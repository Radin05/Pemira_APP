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
 * HANYA aktif di profil dev. Password tiap akun dibuat berbeda agar skenario login
 * per-role lebih mudah diuji.
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
      seed(
          "hukum@poltekkesbandung.ac.id",
          "Staf Hukum & Sekretariat",
          RoleName.HUKUM_SEKRETARIAT,
          "hukumpemira25");
      seed("ketua@poltekkesbandung.ac.id", "Ketua Komite Pengawasan", RoleName.KETUA_KP, "ketuano123");
      seed("pdd@poltekkesbandung.ac.id", "Staf PDD", RoleName.PDD, "pubdekdok25");
      seed("admin@poltekkesbandung.ac.id", "Administrator", RoleName.ADMIN, "passwordadmin");
    };
  }

  private void seed(String email, String fullName, RoleName roleName, String rawPassword) {
    Role role =
        roleRepository
            .findByName(roleName.name())
            .orElseThrow(() -> new IllegalStateException("Role " + roleName + " belum di-seed"));

    User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
    boolean isNew = user.getId() == null;

    user.setEmail(email);
    user.setFullName(fullName);
    user.setPasswordHash(passwordEncoder.encode(rawPassword));
    user.getRoles().add(role);
    userRepository.save(user);

    log.info(
        "[DEV-SEED] Akun staf {}: {} (role {}, password: {})",
        isNew ? "dibuat" : "diperbarui",
        email,
        roleName,
        rawPassword);
  }
}
