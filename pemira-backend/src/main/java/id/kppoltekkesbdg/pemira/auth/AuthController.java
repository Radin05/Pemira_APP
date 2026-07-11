package id.kppoltekkesbdg.pemira.auth;

import id.kppoltekkesbdg.pemira.auth.AuthService.AuthResult;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.AuthResponse;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.AuthUserResponse;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.LoginRequest;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.OtpRequestRequest;
import id.kppoltekkesbdg.pemira.auth.dto.AuthDtos.OtpVerifyRequest;
import id.kppoltekkesbdg.pemira.auth.security.UserPrincipal;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private static final String REFRESH_COOKIE = "refreshToken";
  private static final Duration REFRESH_MAX_AGE = Duration.ofDays(7);

  private final AuthService authService;
  private final boolean secureCookie;

  public AuthController(
      AuthService authService,
      @org.springframework.beans.factory.annotation.Value("${app.cookie.secure:false}")
          boolean secureCookie) {
    this.authService = authService;
    this.secureCookie = secureCookie;
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<AuthResponse>> login(
      @Valid @RequestBody LoginRequest request, HttpServletRequest http) {
    return respondWithSession(
        authService.login(request, http.getHeader("User-Agent"), clientIp(http)));
  }

  @PostMapping("/otp/request")
  public ApiResponse<Void> requestOtp(@Valid @RequestBody OtpRequestRequest request) {
    authService.requestOtp(request);
    // Selalu sukses walau email tak terdaftar — cegah enumerasi (US-201).
    return ApiResponse.success("Jika data valid, kode OTP telah dikirim ke email kampus", null);
  }

  @PostMapping("/otp/verify")
  public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
      @Valid @RequestBody OtpVerifyRequest request, HttpServletRequest http) {
    return respondWithSession(
        authService.verifyOtp(request, http.getHeader("User-Agent"), clientIp(http)));
  }

  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<AuthResponse>> refresh(
      @CookieValue(value = REFRESH_COOKIE, required = false) String refreshToken,
      HttpServletRequest http) {
    return respondWithSession(
        authService.refresh(refreshToken, http.getHeader("User-Agent"), clientIp(http)));
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout(
      @CookieValue(value = REFRESH_COOKIE, required = false) String refreshToken) {
    authService.logout(refreshToken);
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, clearCookie().toString())
        .body(ApiResponse.success("Berhasil keluar", null));
  }

  @GetMapping("/me")
  public ApiResponse<AuthUserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
    return ApiResponse.success(authService.me(principal.id()));
  }

  // ── Helper ──────────────────────────────────────────────────────────────
  private ResponseEntity<ApiResponse<AuthResponse>> respondWithSession(AuthResult result) {
    ResponseCookie cookie =
        ResponseCookie.from(REFRESH_COOKIE, result.rawRefreshToken())
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite("Strict")
            .path("/api/v1/auth")
            .maxAge(REFRESH_MAX_AGE)
            .build();
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(ApiResponse.success(result.response()));
  }

  private ResponseCookie clearCookie() {
    return ResponseCookie.from(REFRESH_COOKIE, "")
        .httpOnly(true)
        .secure(secureCookie)
        .sameSite("Strict")
        .path("/api/v1/auth")
        .maxAge(0)
        .build();
  }

  private String clientIp(HttpServletRequest http) {
    String forwarded = http.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0].trim();
    }
    return http.getRemoteAddr();
  }
}
