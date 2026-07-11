package id.kppoltekkesbdg.pemira.investigation;

import id.kppoltekkesbdg.pemira.common.constant.RoleName;
import id.kppoltekkesbdg.pemira.common.exception.ForbiddenException;
import id.kppoltekkesbdg.pemira.common.exception.IllegalStateTransitionException;
import id.kppoltekkesbdg.pemira.common.exception.ResourceNotFoundException;
import id.kppoltekkesbdg.pemira.investigation.Investigation.Verdict;
import id.kppoltekkesbdg.pemira.report.Report;
import id.kppoltekkesbdg.pemira.report.ReportRepository;
import id.kppoltekkesbdg.pemira.report.ReportStatus;
import id.kppoltekkesbdg.pemira.report.ReportStatusHistory;
import id.kppoltekkesbdg.pemira.report.ReportStatusHistoryRepository;
import id.kppoltekkesbdg.pemira.report.ReportStatusService;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Alur divisi Hukum & Sekretariat: claim laporan dan tetapkan verdict. */
@Slf4j
@Service
@RequiredArgsConstructor
public class InvestigationService {

  private final ReportRepository reportRepository;
  private final ReportStatusHistoryRepository historyRepository;
  private final ReportStatusService reportStatusService;
  private final InvestigationRepository investigationRepository;

  /** Ambil laporan: DITERIMA → DIVERIFIKASI, set assignee. 409 bila sudah di-claim. */
  @Transactional
  public void claim(Long reportId, Long investigatorId) {
    Report report =
        reportRepository
            .findById(reportId)
            .orElseThrow(() -> ResourceNotFoundException.of("Laporan", reportId));

    int updated = reportRepository.claimGuarded(reportId, investigatorId);
    if (updated == 0) {
      throw new IllegalStateTransitionException(
          "Laporan sudah ditangani atau statusnya bukan 'Diterima'.");
    }

    historyRepository.save(
        ReportStatusHistory.of(
            reportId,
            ReportStatus.DITERIMA,
            ReportStatus.DIVERIFIKASI,
            investigatorId,
            "Laporan diambil untuk investigasi"));

    // Siapkan berkas investigasi bila belum ada.
    if (investigationRepository.findByReportId(reportId).isEmpty()) {
      Investigation inv = new Investigation();
      inv.setReportId(reportId);
      inv.setInvestigatorId(investigatorId);
      investigationRepository.save(inv);
    }
    log.info("Laporan {} di-claim oleh user {}", report.getTicketCode(), investigatorId);
  }

  /**
   * Tetapkan hasil cross-check. VALID → status VALID; HOAX → status HOAX. Hanya
   * investigator yang meng-claim (assignee) yang boleh menetapkan verdict.
   */
  @Transactional
  public void setVerdict(Long reportId, Long investigatorId, Verdict verdict, String note) {
    Report report =
        reportRepository
            .findById(reportId)
            .orElseThrow(() -> ResourceNotFoundException.of("Laporan", reportId));

    if (report.getAssigneeId() == null || !report.getAssigneeId().equals(investigatorId)) {
      throw new ForbiddenException("Hanya investigator yang menangani laporan ini yang boleh menetapkan hasil.");
    }

    ReportStatus target = verdict == Verdict.VALID ? ReportStatus.VALID : ReportStatus.HOAX;
    // Transisi ber-guard DIVERIFIKASI → VALID/HOAX (409 bila status sudah berubah).
    reportStatusService.transition(
        reportId,
        ReportStatus.DIVERIFIKASI,
        target,
        RoleName.HUKUM_SEKRETARIAT,
        investigatorId,
        "Hasil cross-check: " + verdict);

    Investigation inv =
        investigationRepository
            .findByReportId(reportId)
            .orElseGet(
                () -> {
                  Investigation i = new Investigation();
                  i.setReportId(reportId);
                  i.setInvestigatorId(investigatorId);
                  return i;
                });
    inv.setVerdict(verdict);
    inv.setCrossCheckNote(note);
    inv.setVerdictAt(OffsetDateTime.now());
    investigationRepository.save(inv);
  }

  /**
   * Susun & kirim laporan resmi ke Ketua (US-505). Hanya untuk laporan berstatus
   * VALID, oleh assignee. Melewati dua transisi berurutan sesuai state machine:
   * VALID → DIBUAT_LAPORAN_INVESTIGASI → MENUNGGU_PERSETUJUAN_KETUA.
   */
  @Transactional
  public void submitToChief(
      Long reportId, Long investigatorId, String findings, String recommendedSanction) {
    Report report =
        reportRepository
            .findById(reportId)
            .orElseThrow(() -> ResourceNotFoundException.of("Laporan", reportId));

    if (report.getAssigneeId() == null || !report.getAssigneeId().equals(investigatorId)) {
      throw new ForbiddenException("Hanya investigator yang menangani laporan ini yang boleh menyusun laporan.");
    }

    Investigation inv =
        investigationRepository
            .findByReportId(reportId)
            .orElseThrow(() -> ResourceNotFoundException.of("Investigasi laporan", reportId));
    inv.setFindings(findings);
    inv.setRecommendedSanction(recommendedSanction);
    inv.setSubmittedToChiefAt(OffsetDateTime.now());
    investigationRepository.save(inv);

    reportStatusService.transition(
        reportId,
        ReportStatus.VALID,
        ReportStatus.DIBUAT_LAPORAN_INVESTIGASI,
        RoleName.HUKUM_SEKRETARIAT,
        investigatorId,
        "Menyusun laporan resmi");
    reportStatusService.transition(
        reportId,
        ReportStatus.DIBUAT_LAPORAN_INVESTIGASI,
        ReportStatus.MENUNGGU_PERSETUJUAN_KETUA,
        RoleName.HUKUM_SEKRETARIAT,
        investigatorId,
        "Laporan diajukan ke Ketua");
  }
}
