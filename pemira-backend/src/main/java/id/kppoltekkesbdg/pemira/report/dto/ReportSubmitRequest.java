package id.kppoltekkesbdg.pemira.report.dto;

import id.kppoltekkesbdg.pemira.report.ReportCategory;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Payload submit laporan. Aturan mengikuti US-401/402 dan skema zod frontend
 * (report.schema.ts) — jaga keduanya tetap konsisten.
 */
public record ReportSubmitRequest(
    @NotNull(message = "Kategori wajib dipilih") ReportCategory category,
    @NotBlank @Size(min = 10, max = 150, message = "Judul 10–150 karakter") String title,
    @NotNull(message = "Tanggal kejadian wajib diisi")
        @PastOrPresent(message = "Tanggal kejadian tidak boleh di masa depan")
        LocalDate incidentDate,
    @NotBlank @Size(min = 3, max = 255, message = "Lokasi kejadian wajib diisi")
        String incidentLocation,
    @Size(max = 150) String reportedCandidate,
    @NotBlank
        @Size(min = 50, max = 5000, message = "Kronologi minimal 50 karakter")
        String description,
    boolean anonymous,
    @Size(max = 100) String reporterName,
    @NotBlank @Pattern(regexp = "\\d{6,}", message = "NPM berupa angka minimal 6 digit")
        String reporterNpm,
    @NotBlank
        @Email(message = "Format email tidak valid")
        @Pattern(
            regexp = ".+@poltekkesbandung\\.ac\\.id$",
            message = "Gunakan email kampus (@poltekkesbandung.ac.id)")
        String reporterEmail) {

  /** Nama wajib ada bila tidak anonim (US-401). */
  @AssertTrue(message = "Nama wajib diisi bila tidak melapor secara anonim")
  public boolean isReporterNameValidWhenNamed() {
    return anonymous || (reporterName != null && reporterName.trim().length() >= 3);
  }
}
