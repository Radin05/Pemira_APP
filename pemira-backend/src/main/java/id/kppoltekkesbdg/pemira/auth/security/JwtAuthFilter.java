package id.kppoltekkesbdg.pemira.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Membaca Bearer token, memvalidasi, dan mengisi SecurityContext. Token tidak
 * sah TIDAK langsung ditolak di sini — dibiarkan lewat sebagai anonim, lalu
 * authorization rules yang menentukan 401/403. Ini menjaga endpoint publik tetap
 * dapat diakses walau ada header Authorization yang rusak.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService;

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain chain)
      throws ServletException, IOException {
    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      try {
        Claims claims = jwtService.parse(token);
        Long userId = Long.valueOf(claims.getSubject());
        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);
        String email = claims.get("email", String.class);

        UserPrincipal principal = new UserPrincipal(userId, email, roles == null ? List.of() : roles);
        var auth =
            new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(auth);
      } catch (JwtException | IllegalArgumentException e) {
        // Token rusak/kadaluarsa → tetap anonim. Tidak melempar di sini.
        SecurityContextHolder.clearContext();
      }
    }
    chain.doFilter(request, response);
  }
}
