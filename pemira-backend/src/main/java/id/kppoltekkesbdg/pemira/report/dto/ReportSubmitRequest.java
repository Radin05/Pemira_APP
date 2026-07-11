package id.kppoltekkesbdg.pemira.report.dto;

import id.kppoltekkesbdg.pemira.report.ReportCategory;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Payload submit laporan. Aturan mengikuti US-401/402 dan skema zod frontend
 * (report.schema.ts) — jaga keduanya tetap konsisten.
 */
public record ReportSubmitRequest(
    String submissionMode,
    ReportCategory category,
    @Size(max = 150, message = "Judul maksimal 150 karakter") String title,
    @PastOrPresent(message = "Tanggal kejadian tidak boleh di masa depan") LocalDate incidentDate,
    @Size(max = 255, message = "Lokasi kejadian maksimal 255 karakter") String incidentLocation,
    @Size(max = 150) String reportedCandidate,
    @Size(max = 5000, message = "Kronologi maksimal 5000 karakter") String description,
    boolean anonymous,
    @Size(max = 100) String reporterName,
    @NotBlank @Pattern(regexp = "\\d{6,}", message = "NPM berupa angka minimal 6 digit")
        String reporterNpm,
    @NotBlank
        @Email(message = "Format email tidak valid")
        String reporterEmail) {

  public boolean isTemplateSubmission() {
    return "TEMPLATE".equalsIgnoreCase(submissionMode);
  }

  /** Detail laporan wajib bila pelapor mengisi langsung lewat website. */
  @AssertTrue(message = "Detail pelanggaran wajib diisi bila tidak upload formulir")
  public boolean isDirectReportDetailValid() {
    if (isTemplateSubmission()) return true;
    return category != null
        && title != null
        && title.trim().length() >= 10
        && incidentDate != null
        && incidentLocation != null
        && incidentLocation.trim().length() >= 3
        && description != null
        && description.trim().length() >= 50;
  }

  /** Nama wajib ada bila tidak anonim (US-401). */
  @AssertTrue(message = "Nama wajib diisi bila tidak melapor secara anonim")
  public boolean isReporterNameValidWhenNamed() {
    return anonymous || (reporterName != null && reporterName.trim().length() >= 3);
  }
}
