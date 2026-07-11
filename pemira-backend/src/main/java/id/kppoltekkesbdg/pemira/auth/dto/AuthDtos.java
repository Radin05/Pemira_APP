package id.kppoltekkesbdg.pemira.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.List;

/** Kumpulan DTO auth dalam satu berkas supaya ringkas. */
public final class AuthDtos {

  private AuthDtos() {}

  public record LoginRequest(
      @NotBlank @Email(message = "Format email tidak valid") String email,
      @NotBlank(message = "Password wajib diisi") String password) {}

  public record OtpRequestRequest(
      @NotBlank
          @Email(message = "Format email tidak valid")
          @Pattern(
              regexp = ".+@poltekkesbandung\\.ac\\.id$",
              message = "Gunakan email kampus (@poltekkesbandung.ac.id)")
          String email,
      @NotBlank @Pattern(regexp = "\\d{6,}", message = "NPM berupa angka minimal 6 digit")
          String npm) {}

  public record OtpVerifyRequest(
      @NotBlank @Email String email,
      @NotBlank @Pattern(regexp = "\\d{6}", message = "Kode OTP terdiri dari 6 digit") String code) {}

  public record AuthUserResponse(Long id, String email, String fullName, List<String> roles) {}

  /** Dikirim ke klien. Refresh token TIDAK di sini — ia di httpOnly cookie. */
  public record AuthResponse(String accessToken, long expiresIn, AuthUserResponse user) {}
}
