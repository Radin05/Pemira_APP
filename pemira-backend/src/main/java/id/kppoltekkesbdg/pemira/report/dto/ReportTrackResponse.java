package id.kppoltekkesbdg.pemira.report.dto;

import id.kppoltekkesbdg.pemira.report.ReportStatus;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Hasil pelacakan publik. Sesuai ADR-007, HANYA status + tanggal + catatan
 * ringkas — tidak ada isi laporan, kronologi, atau identitas.
 */
public record ReportTrackResponse(
    String ticketCode, ReportStatus currentStatus, List<TimelineEntry> timeline) {

  public record TimelineEntry(ReportStatus status, OffsetDateTime at, String note) {}
}
