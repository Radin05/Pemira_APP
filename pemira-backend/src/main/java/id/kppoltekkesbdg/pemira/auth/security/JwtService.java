package id.kppoltekkesbdg.pemira.auth.security;

import id.kppoltekkesbdg.pemira.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Menerbitkan & memvalidasi access token (JWT HS256). Berumur pendek (15 menit) —
 * sesi diperpanjang lewat refresh token, bukan dengan memperpanjang access token
 * (ADR-003). Claim: sub = userId, roles = daftar nama peran.
 */
@Service
public class JwtService {

  private final SecretKey key;
  private final long accessTtlSeconds;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.access-ttl-seconds:900}") long accessTtlSeconds) {
    byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
    if (keyBytes.length < 32) {
      throw new IllegalStateException("app.jwt.secret minimal 32 byte (256 bit)");
    }
    this.key = Keys.hmacShaKeyFor(keyBytes);
    this.accessTtlSeconds = accessTtlSeconds;
  }

  public String generateAccessToken(User user, List<String> roles) {
    Date now = new Date();
    return Jwts.builder()
        .subject(String.valueOf(user.getId()))
        .claim("roles", roles)
        .claim("email", user.getEmail())
        .issuedAt(now)
        .expiration(new Date(now.getTime() + Duration.ofSeconds(accessTtlSeconds).toMillis()))
        .signWith(key)
        .compact();
  }

  /** Mem-parse & memvalidasi token. Melempar {@link JwtException} bila tidak sah/kadaluarsa. */
  public Claims parse(String token) throws JwtException {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }

  public long getAccessTtlSeconds() {
    return accessTtlSeconds;
  }
}
