package id.kppoltekkesbdg.pemira.report.dto;

import id.kppoltekkesbdg.pemira.report.ReportCategory;
import id.kppoltekkesbdg.pemira.report.ReportStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Baris ringkas untuk antrean investigator. TANPA identitas pelapor. */
public record ReportSummaryResponse(
    Long id,
    String ticketCode,
    ReportCategory category,
    ReportStatus status,
    String title,
    LocalDate incidentDate,
    String incidentLocation,
    String reportedCandidate,
    boolean anonymous,
    Long assigneeId,
    OffsetDateTime submittedAt) {}
