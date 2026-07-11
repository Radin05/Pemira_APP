package id.kppoltekkesbdg.pemira.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.List;

public final class UserAdminDtos {

  private UserAdminDtos() {}

  public record UserItem(
      Long id,
      String email,
      String fullName,
      String npm,
      String studyProgram,
      boolean active,
      List<String> roles,
      OffsetDateTime createdAt) {}

  public record CreateUserRequest(
      @NotBlank @Email(message = "Format email tidak valid") String email,
      @NotBlank @Size(min = 3, max = 150, message = "Nama 3–150 karakter") String fullName,
      @NotBlank @Size(min = 8, message = "Password minimal 8 karakter") String password,
      String studyProgram,
      @NotEmpty(message = "Pilih minimal satu peran") List<String> roles) {}

  public record UpdateRolesRequest(
      @NotEmpty(message = "Pilih minimal satu peran") List<String> roles) {}

  public record SetActiveRequest(boolean active) {}
}
