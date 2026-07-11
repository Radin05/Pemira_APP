package id.kppoltekkesbdg.pemira.config;

import id.kppoltekkesbdg.pemira.common.constant.RoleName;
import id.kppoltekkesbdg.pemira.user.Role;
import id.kppoltekkesbdg.pemira.user.RoleRepository;
import id.kppoltekkesbdg.pemira.user.User;
import id.kppoltekkesbdg.pemira.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Membuat akun ADMIN pertama di produksi. Berbeda dari DevDataSeeder (dev-only,
 * password lemah), ini HANYA membuat SATU admin dari env var, dan HANYA bila
 * belum ada admin sama sekali. Setelah itu, kelola user lewat dashboard /admin.
 *
 * Set env BOOTSTRAP_ADMIN_EMAIL & BOOTSTRAP_ADMIN_PASSWORD pada boot pertama.
 * Boleh dihapus dari env setelah admin terbuat.
 */
@Slf4j
@Configuration
@Profile("prod")
@RequiredArgsConstructor
public class ProdAdminBootstrap {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;

  @Value("${app.bootstrap.admin.email:}")
  private String adminEmail;

  @Value("${app.bootstrap.admin.password:}")
  private String adminPassword;

  @Bean
  ApplicationRunner bootstrapAdmin() {
    return args -> {
      if (adminEmail.isBlank() || adminPassword.isBlank()) {
        return; // tidak diminta membuat admin
      }
      if (roleRepository.findByName(RoleName.ADMIN.name()).isEmpty()) {
        log.warn("Role ADMIN belum di-seed — lewati bootstrap admin.");
        return;
      }
      if (userRepository.countActiveByRole(RoleName.ADMIN.name()) > 0) {
        return; // sudah ada admin, jangan buat lagi
      }
      if (adminPassword.length() < 8) {
        log.error("BOOTSTRAP_ADMIN_PASSWORD terlalu pendek (min 8). Admin tidak dibuat.");
        return;
      }

      Role adminRole = roleRepository.findByName(RoleName.ADMIN.name()).orElseThrow();
      User admin = userRepository.findByEmailIgnoreCase(adminEmail).orElseGet(User::new);
      admin.setEmail(adminEmail.trim());
      admin.setFullName("Administrator");
      admin.setPasswordHash(passwordEncoder.encode(adminPassword));
      admin.getRoles().add(adminRole);
      userRepository.save(admin);
      log.info("[BOOTSTRAP] Akun ADMIN awal dibuat: {}", adminEmail);
    };
  }
}
