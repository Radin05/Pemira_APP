package id.kppoltekkesbdg.pemira.config;

import id.kppoltekkesbdg.pemira.auth.security.JwtAuthFilter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Keamanan: stateless (JWT), CSRF mati (tidak ada sesi cookie untuk API),
 * daftar endpoint publik dibuka, sisanya butuh token. @EnableMethodSecurity
 * mengaktifkan @PreAuthorize — otorisasi yang mengikat (ADR-010).
 */
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthFilter jwtAuthFilter;

  private static final String[] PUBLIC_PATHS = {
    "/api/v1/auth/**",
    "/api/v1/public/**",
    "/actuator/health",
    "/actuator/info",
    "/v3/api-docs/**",
    "/swagger-ui/**",
    "/swagger-ui.html",
  };

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth
                    // /me butuh token — HARUS dievaluasi sebelum matcher publik
                    // /api/v1/auth/** di bawah, kalau tidak ia ikut terbuka & anonim
                    // menembus ke controller (principal null → 500).
                    .requestMatchers(HttpMethod.GET, "/api/v1/auth/me")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/v1/public/**")
                    .permitAll()
                    // TODO(follow-up): kunci ke MAHASISWA setelah /lapor digerbangi OTP.
                    // Untuk sekarang tetap publik agar form /lapor & /status tidak putus.
                    .requestMatchers(HttpMethod.POST, "/api/v1/reports")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/reports/track")
                    .permitAll()
                    .requestMatchers(PUBLIC_PATHS)
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        // Tanpa token pada endpoint terlindungi → 401 (bukan 403 default utk anonim).
        .exceptionHandling(
            ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    // TODO(deploy): pindahkan origin ke properti per-lingkungan.
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
