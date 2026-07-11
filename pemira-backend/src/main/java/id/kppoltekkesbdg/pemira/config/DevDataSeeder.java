package id.kppoltekkesbdg.pemira.config;

import id.kppoltekkesbdg.pemira.common.constant.RoleName;
import id.kppoltekkesbdg.pemira.user.Role;
import id.kppoltekkesbdg.pemira.user.RoleRepository;
import id.kppoltekkesbdg.pemira.user.User;
import id.kppoltekkesbdg.pemira.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Membuat akun staf uji saat dev supaya login bisa dicoba tanpa setup manual.
 * HANYA aktif di profil dev. Password semua akun: {@code Test@1234}.
 */
@Slf4j
@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class DevDataSeeder {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;

  @Bean
  ApplicationRunner seedStaffUsers() {
    return args -> {
      seed("hukum@poltekkesbandung.ac.id", "Staf Hukum & Sekretariat", RoleName.HUKUM_SEKRETARIAT);
      seed("ketua@poltekkesbandung.ac.id", "Ketua Komite Pengawasan", RoleName.KETUA_KP);
      seed("pdd@poltekkesbandung.ac.id", "Staf PDD", RoleName.PDD);
      seed("admin@poltekkesbandung.ac.id", "Administrator", RoleName.ADMIN);
    };
  }

  private void seed(String email, String fullName, RoleName roleName) {
    if (userRepository.findByEmailIgnoreCase(email).isPresent()) return;

    Role role =
        roleRepository
            .findByName(roleName.name())
            .orElseThrow(() -> new IllegalStateException("Role " + roleName + " belum di-seed"));

    User user = new User();
    user.setEmail(email);
    user.setFullName(fullName);
    user.setPasswordHash(passwordEncoder.encode("Test@1234"));
    user.getRoles().add(role);
    userRepository.save(user);
    log.info("[DEV-SEED] Akun staf dibuat: {} (role {})", email, roleName);
  }
}
