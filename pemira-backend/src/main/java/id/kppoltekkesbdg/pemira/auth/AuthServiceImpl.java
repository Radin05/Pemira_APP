package id.kppoltekkesbdg.pemira.auth;

import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.AuthResponse;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.AuthUserResponse;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.LoginRequest;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.OtpRequestRequest;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.OtpVerifyRequest;
import id.kppoltekkesbdg.pemira.auth.security.JwtService;
import id.kppoltekkesbdg.pemira.common.constant.RoleName;
import id.kppoltekkesbdg.pemira.common.exception.BadRequestException;
import id.kppoltekkesbdg.pemira.common.exception.RateLimitExceededException;
import id.kppoltekkesbdg.pemira.common.exception.ResourceNotFoundException;
import id.kppoltekkesbdg.pemira.common.exception.UnauthorizedException;
import id.kppoltekkesbdg.pemira.common.util.HashUtil;
import id.kppoltekkesbdg.pemira.user.Role;
import id.kppoltekkesbdg.pemira.user.RoleRepository;
import id.kppoltekkesbdg.pemira.user.User;
import id.kppoltekkesbdg.pemira.user.UserRepository;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

  private static final int MAX_LOGIN_ATTEMPTS = 5;
  private static final int LOCK_MINUTES = 15;
  private static final int OTP_TTL_MINUTES = 10;
  private static final int OTP_MAX_ATTEMPTS = 5;
  private static final int REFRESH_TTL_DAYS = 7;

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final OtpCodeRepository otpCodeRepository;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;
  private final SecureRandom random = new SecureRandom();

  // ── Login staf (email + password) ───────────────────────────────────────
  @Override
  @Transactional
  public AuthResult login(LoginRequest req, String userAgent, String ip) {
    User user = userRepository.findByEmailIgnoreCase(req.email()).orElse(null);

    // Pesan seragam "kredensial salah" untuk email tak dikenal maupun password
    // salah, supaya keberadaan akun tidak bisa diprobing.
    if (user == null || user.getPasswordHash() == null) {
      throw new UnauthorizedException("Email atau password salah");
    }
    if (!user.isActive()) {
      throw new UnauthorizedException("Akun tidak aktif");
    }
    if (user.isLocked()) {
      throw new UnauthorizedException(
          "Akun terkunci sementara karena terlalu banyak percobaan. Coba lagi nanti.");
    }

    if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
      int attempts = user.getFailedLoginCount() + 1;
      user.setFailedLoginCount(attempts);
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        user.setLockedUntil(OffsetDateTime.now().plusMinutes(LOCK_MINUTES));
        user.setFailedLoginCount(0);
      }
      userRepository.save(user);
      throw new UnauthorizedException("Email atau password salah");
    }

    user.setFailedLoginCount(0);
    user.setLockedUntil(null);
    userRepository.save(user);
    return issueTokens(user, userAgent, ip);
  }

  // ── OTP mahasiswa ───────────────────────────────────────────────────────
  @Override
  @Transactional
  public void requestOtp(OtpRequestRequest req) {
    String code = "%06d".formatted(random.nextInt(1_000_000));

    OtpCode otp = new OtpCode();
    otp.setEmail(req.email());
    otp.setNpm(req.npm());
    otp.setCodeHash(HashUtil.sha256Hex(code));
    otp.setPurpose("LOGIN");
    otp.setExpiresAt(OffsetDateTime.now().plusMinutes(OTP_TTL_MINUTES));
    otpCodeRepository.save(otp);

    // TODO(T-09-03/04): kirim lewat email. Belum ada SMTP, jadi kode DICATAT di
    // log level INFO khusus dev — JANGAN kembalikan di response (bocor).
    log.info("[DEV-OTP] Kode OTP untuk {} : {}", req.email(), code);
  }

  @Override
  @Transactional
  public AuthResult verifyOtp(OtpVerifyRequest req, String userAgent, String ip) {
    OtpCode otp =
        otpCodeRepository
            .findLatestUsable(req.email(), "LOGIN")
            .filter(OtpCode::isUsable)
            .orElseThrow(() -> new BadRequestException("Kode OTP tidak valid atau sudah kedaluwarsa"));

    if (otp.getAttemptCount() >= OTP_MAX_ATTEMPTS) {
      otp.setConsumedAt(OffsetDateTime.now()); // hanguskan
      otpCodeRepository.save(otp);
      throw new RateLimitExceededException("Terlalu banyak percobaan. Minta kode baru.");
    }

    if (!otp.getCodeHash().equals(HashUtil.sha256Hex(req.code()))) {
      otp.setAttemptCount((short) (otp.getAttemptCount() + 1));
      otpCodeRepository.save(otp);
      throw new BadRequestException("Kode OTP salah");
    }

    otp.setConsumedAt(OffsetDateTime.now());
    otpCodeRepository.save(otp);

    // Upsert akun mahasiswa (sesi terbatas). Nama belum diketahui dari OTP.
    User user =
        userRepository
            .findByEmailIgnoreCase(req.email())
            .orElseGet(
                () -> {
                  User u = new User();
                  u.setEmail(req.email());
                  u.setNpm(otp.getNpm());
                  u.setFullName("Mahasiswa " + otp.getNpm());
                  u.getRoles().add(requireRole(RoleName.MAHASISWA));
                  return u;
                });
    user.setEmailVerifiedAt(OffsetDateTime.now());
    userRepository.save(user);

    return issueTokens(user, userAgent, ip);
  }

  // ── Refresh dengan rotasi + deteksi reuse ───────────────────────────────
  @Override
  @Transactional
  public AuthResult refresh(String rawRefreshToken, String userAgent, String ip) {
    if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
      throw new UnauthorizedException("Refresh token tidak ditemukan");
    }
    String hash = HashUtil.sha256Hex(rawRefreshToken);
    RefreshToken token =
        refreshTokenRepository
            .findByTokenHash(hash)
            .orElseThrow(() -> new UnauthorizedException("Sesi tidak valid"));

    if (token.getRevokedAt() != null) {
      // Token yang sudah di-rotasi dipakai lagi → indikasi pencurian.
      // Revoke seluruh keluarga token milik user ini (ADR-003).
      log.warn("Refresh token reuse terdeteksi untuk user {}", token.getUserId());
      refreshTokenRepository.revokeAllForUser(token.getUserId());
      throw new UnauthorizedException("Sesi tidak valid");
    }
    if (!token.isActive()) {
      throw new UnauthorizedException("Sesi telah berakhir");
    }

    User user =
        userRepository
            .findById(token.getUserId())
            .orElseThrow(() -> new UnauthorizedException("Sesi tidak valid"));

    AuthResult result = issueTokens(user, userAgent, ip);
    token.setRevokedAt(OffsetDateTime.now());
    // Tautkan ke pengganti dicatat lewat token baru; sederhananya tandai revoked.
    refreshTokenRepository.save(token);
    return result;
  }

  @Override
  @Transactional
  public void logout(String rawRefreshToken) {
    if (rawRefreshToken == null || rawRefreshToken.isBlank()) return;
    refreshTokenRepository
        .findByTokenHash(HashUtil.sha256Hex(rawRefreshToken))
        .ifPresent(
            t -> {
              if (t.getRevokedAt() == null) {
                t.setRevokedAt(OffsetDateTime.now());
                refreshTokenRepository.save(t);
              }
            });
  }

  @Override
  @Transactional(readOnly = true)
  public AuthUserResponse me(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
    return toUserResponse(user);
  }

  // ── Helper ──────────────────────────────────────────────────────────────
  private AuthResult issueTokens(User user, String userAgent, String ip) {
    List<String> roles = user.getRoles().stream().map(Role::getName).toList();
    String accessToken = jwtService.generateAccessToken(user, roles);

    String rawRefresh = randomToken();
    RefreshToken rt = new RefreshToken();
    rt.setUserId(user.getId());
    rt.setTokenHash(HashUtil.sha256Hex(rawRefresh));
    rt.setExpiresAt(OffsetDateTime.now().plusDays(REFRESH_TTL_DAYS));
    rt.setUserAgent(truncate(userAgent, 255));
    rt.setIpAddress(truncate(ip, 45));
    refreshTokenRepository.save(rt);

    AuthResponse response =
        new AuthResponse(accessToken, jwtService.getAccessTtlSeconds(), toUserResponse(user));
    return new AuthResult(response, rawRefresh);
  }

  private AuthUserResponse toUserResponse(User user) {
    return new AuthUserResponse(
        user.getId(),
        user.getEmail(),
        user.getFullName(),
        user.getRoles().stream().map(Role::getName).toList());
  }

  private Role requireRole(RoleName name) {
    return roleRepository
        .findByName(name.name())
        .orElseThrow(() -> new IllegalStateException("Role " + name + " belum di-seed"));
  }

  private String randomToken() {
    byte[] bytes = new byte[32];
    random.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private String truncate(String s, int max) {
    if (s == null) return null;
    return s.length() <= max ? s : s.substring(0, max);
  }
}
