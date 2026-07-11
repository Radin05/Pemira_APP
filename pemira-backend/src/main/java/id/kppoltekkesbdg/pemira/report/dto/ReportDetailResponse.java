package id.kppoltekkesbdg.pemira.report.dto;

import id.kppoltekkesbdg.pemira.report.ReportCategory;
import id.kppoltekkesbdg.pemira.report.ReportStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Detail laporan untuk staf. Menyertakan kronologi, bukti, dan riwayat status.
 * Identitas pelapor SENGAJA tidak disertakan — dekripsi + audit belum ada
 * (ReporterIdentityService, T-04-06 lanjutan). Hanya flag anonim yang tampil.
 */
public record ReportDetailResponse(
    Long id,
    String ticketCode,
    ReportCategory category,
    ReportStatus status,
    String title,
    String description,
    LocalDate incidentDate,
    String incidentLocation,
    String reportedCandidate,
    boolean anonymous,
    Long assigneeId,
    OffsetDateTime submittedAt,
    List<Evidence> evidences,
    List<History> history,
    InvestigationSummary investigation) {

  public record Evidence(
      Long id,
      String originalFilename,
      String mimeType,
      long sizeBytes,
      String checksumSha256,
      OffsetDateTime uploadedAt) {}

  public record History(
      ReportStatus fromStatus, ReportStatus toStatus, String note, OffsetDateTime createdAt) {}

  public record InvestigationSummary(
      String stage,
      boolean stagesCompleted,
      List<StageEntry> stageLog,
      String verdict,
      String findings,
      String recommendedSanction,
      OffsetDateTime verdictAt,
      OffsetDateTime submittedToChiefAt) {}

  public record StageEntry(String stage, String note, OffsetDateTime createdAt) {}
}
