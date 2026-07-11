package id.kppoltekkesbdg.pemira.user;

import id.kppoltekkesbdg.pemira.auth.security.UserPrincipal;
import id.kppoltekkesbdg.pemira.common.response.ApiResponse;
import id.kppoltekkesbdg.pemira.user.dto.UserAdminDtos.CreateUserRequest;
import id.kppoltekkesbdg.pemira.user.dto.UserAdminDtos.SetActiveRequest;
import id.kppoltekkesbdg.pemira.user.dto.UserAdminDtos.UpdateRolesRequest;
import id.kppoltekkesbdg.pemira.user.dto.UserAdminDtos.UserItem;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Manajemen user (EPIC-03). Semua endpoint khusus ADMIN. */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

  private final UserAdminService userAdminService;

  @GetMapping
  public ApiResponse<List<UserItem>> list() {
    return ApiResponse.success(userAdminService.list());
  }

  @PostMapping
  public ApiResponse<Map<String, Long>> create(@Valid @RequestBody CreateUserRequest request) {
    return ApiResponse.success("Akun dibuat", Map.of("id", userAdminService.create(request)));
  }

  @PatchMapping("/{id}/roles")
  public ApiResponse<Void> updateRoles(
      @PathVariable Long id, @Valid @RequestBody UpdateRolesRequest request) {
    userAdminService.updateRoles(id, request.roles());
    return ApiResponse.success("Peran diperbarui", null);
  }

  @PatchMapping("/{id}/active")
  public ApiResponse<Void> setActive(
      @PathVariable Long id,
      @RequestBody SetActiveRequest request,
      @AuthenticationPrincipal UserPrincipal principal) {
    userAdminService.setActive(id, request.active(), principal.id());
    return ApiResponse.success(request.active() ? "Akun diaktifkan" : "Akun dinonaktifkan", null);
  }
}
