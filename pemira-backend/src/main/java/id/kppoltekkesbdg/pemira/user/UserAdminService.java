package id.kppoltekkesbdg.pemira.user;

import id.kppoltekkesbdg.pemira.common.constant.RoleName;
import id.kppoltekkesbdg.pemira.common.exception.BadRequestException;
import id.kppoltekkesbdg.pemira.common.exception.ResourceNotFoundException;
import id.kppoltekkesbdg.pemira.user.dto.UserAdminDtos.CreateUserRequest;
import id.kppoltekkesbdg.pemira.user.dto.UserAdminDtos.UserItem;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Manajemen user oleh ADMIN (EPIC-03). */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserAdminService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional(readOnly = true)
  public List<UserItem> list() {
    return userRepository.findAllActive().stream().map(this::toItem).toList();
  }

  @Transactional
  public Long create(CreateUserRequest req) {
    if (userRepository.findByEmailIgnoreCase(req.email()).isPresent()) {
      throw new BadRequestException("Email sudah terdaftar");
    }
    Set<Role> roles = resolveRoles(req.roles());

    User user = new User();
    user.setEmail(req.email().trim());
    user.setFullName(req.fullName().trim());
    user.setStudyProgram(req.studyProgram());
    user.setPasswordHash(passwordEncoder.encode(req.password()));
    user.setRoles(roles);
    User saved = userRepository.save(user);
    log.info("Admin membuat user {} dengan peran {}", saved.getEmail(), req.roles());
    return saved.getId();
  }

  @Transactional
  public void updateRoles(Long userId, List<String> roleNames) {
    User user = requireUser(userId);
    Set<Role> newRoles = resolveRoles(roleNames);

    // Jangan sampai ADMIN aktif terakhir kehilangan peran ADMIN (terkunci di luar sistem).
    boolean wasAdmin = hasRole(user, RoleName.ADMIN);
    boolean willBeAdmin = newRoles.stream().anyMatch(r -> r.getName().equals(RoleName.ADMIN.name()));
    if (wasAdmin && !willBeAdmin && isLastActiveAdmin(user)) {
      throw new BadRequestException("Tidak dapat mencabut peran ADMIN dari administrator terakhir.");
    }

    user.setRoles(newRoles);
    userRepository.save(user);
  }

  @Transactional
  public void setActive(Long userId, boolean active, Long actingAdminId) {
    User user = requireUser(userId);
    if (!active) {
      if (user.getId().equals(actingAdminId)) {
        throw new BadRequestException("Anda tidak dapat menonaktifkan akun sendiri.");
      }
      if (hasRole(user, RoleName.ADMIN) && isLastActiveAdmin(user)) {
        throw new BadRequestException("Tidak dapat menonaktifkan administrator terakhir.");
      }
    }
    user.setActive(active);
    userRepository.save(user);
  }

  // ── Helper ──────────────────────────────────────────────────────────────
  private boolean isLastActiveAdmin(User user) {
    return user.isActive() && userRepository.countActiveByRole(RoleName.ADMIN.name()) <= 1;
  }

  private boolean hasRole(User user, RoleName role) {
    return user.getRoles().stream().anyMatch(r -> r.getName().equals(role.name()));
  }

  private Set<Role> resolveRoles(List<String> roleNames) {
    Set<Role> roles = new HashSet<>();
    for (String name : roleNames) {
      // Validasi terhadap enum agar tidak menyimpan nama peran ngawur.
      try {
        RoleName.valueOf(name);
      } catch (IllegalArgumentException e) {
        throw new BadRequestException("Peran tidak dikenal: " + name);
      }
      roles.add(
          roleRepository
              .findByName(name)
              .orElseThrow(() -> new BadRequestException("Peran belum di-seed: " + name)));
    }
    return roles;
  }

  private User requireUser(Long id) {
    return userRepository
        .findById(id)
        .filter(u -> u.getDeletedAt() == null)
        .orElseThrow(() -> ResourceNotFoundException.of("User", id));
  }

  private UserItem toItem(User u) {
    return new UserItem(
        u.getId(),
        u.getEmail(),
        u.getFullName(),
        u.getNpm(),
        u.getStudyProgram(),
        u.isActive(),
        u.getRoles().stream().map(Role::getName).sorted().toList(),
        u.getCreatedAt());
  }
}
