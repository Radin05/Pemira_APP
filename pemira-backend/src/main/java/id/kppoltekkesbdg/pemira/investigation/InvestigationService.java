package id.kppoltekkesbdg.pemira.investigation;

import id.kppoltekkesbdg.pemira.common.constant.RoleName;
import id.kppoltekkesbdg.pemira.common.exception.BadRequestException;
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

/**
 * Alur divisi Hukum & Sekretariat. Investigasi berjalan lewat 4 tahap internal
 * (VERIFIKASI → PENYELIDIKAN → PENYIDIKAN → GELAR_PERKARA) selama status laporan
 * DIVERIFIKASI. Setelah tahap tuntas, Hukum mengisi template laporan resmi lalu
 * mengajukannya ke Ketua.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InvestigationService {

  private final ReportRepository reportRepository;
  private final ReportStatusHistoryRepository historyRepository;
  private final ReportStatusService reportStatusService;
  private final InvestigationRepository investigationRepository;
  private final InvestigationStageRepository stageRepository;

  /** Ambil laporan: DITERIMA → DIVERIFIKASI, mulai tahap VERIFIKASI. 409 bila sudah di-claim. */
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
    inv.setStage(Stage.VERIFIKASI);
    inv.setStagesCompletedAt(null);
    investigationRepository.save(inv);

    log.info("Laporan {} di-claim oleh user {}", report.getTicketCode(), investigatorId);
  }

  /**
   * Selesaikan tahap saat ini (catat notanya) lalu maju ke tahap berikutnya.
   * Pada tahap terakhir (GELAR_PERKARA), menandai seluruh tahap selesai sehingga
   * template laporan bisa diisi. Hanya assignee, hanya saat status DIVERIFIKASI.
   */
  @Transactional
  public void advanceStage(Long reportId, Long investigatorId, String note) {
    Report report = requireAssigned(reportId, investigatorId);
    if (report.getStatus() != ReportStatus.DIVERIFIKASI) {
      throw new IllegalStateTransitionException("Tahap hanya bisa diisi saat laporan diverifikasi.");
    }

    Investigation inv = requireInvestigation(reportId);
    Stage current = inv.getStage() == null ? Stage.VERIFIKASI : inv.getStage();
    if (inv.getStagesCompletedAt() != null) {
      throw new BadRequestException("Seluruh tahap sudah selesai.");
    }

    InvestigationStage log = new InvestigationStage();
    log.setInvestigationId(inv.getId());
    log.setStage(current);
    log.setNote(note);
    log.setInvestigatorId(investigatorId);
    stageRepository.save(log);

    if (current.isLast()) {
      inv.setStagesCompletedAt(OffsetDateTime.now());
    } else {
      inv.setStage(current.next());
    }
    investigationRepository.save(inv);
  }

  /**
   * Isi template laporan resmi & ajukan ke Ketua (US-505). Syarat: seluruh tahap
   * investigasi sudah selesai (stagesCompletedAt terisi). Transisi DIVERIFIKASI →
   * MENUNGGU_PERSETUJUAN_KETUA.
   */
  @Transactional
  public void submitToChief(
      Long reportId,
      Long investigatorId,
      String findings,
      Verdict conclusion,
      String recommendedSanction) {
    requireAssigned(reportId, investigatorId);

    Investigation inv = requireInvestigation(reportId);
    if (inv.getStagesCompletedAt() == null) {
      throw new BadRequestException(
          "Selesaikan seluruh tahap investigasi (hingga gelar perkara) sebelum menyusun laporan.");
    }

    inv.setFindings(findings);
    inv.setVerdict(conclusion);
    inv.setVerdictAt(OffsetDateTime.now());
    inv.setRecommendedSanction(recommendedSanction);
    inv.setSubmittedToChiefAt(OffsetDateTime.now());
    investigationRepository.save(inv);

    reportStatusService.transition(
        reportId,
        ReportStatus.DIVERIFIKASI,
        ReportStatus.MENUNGGU_PERSETUJUAN_KETUA,
        RoleName.HUKUM_SEKRETARIAT,
        investigatorId,
        "Laporan resmi diajukan ke Ketua (kesimpulan: " + conclusion + ")");
  }

  private Report requireAssigned(Long reportId, Long investigatorId) {
    Report report =
        reportRepository
            .findById(reportId)
            .orElseThrow(() -> ResourceNotFoundException.of("Laporan", reportId));
    if (report.getAssigneeId() == null || !report.getAssigneeId().equals(investigatorId)) {
      throw new ForbiddenException(
          "Hanya investigator yang menangani laporan ini yang berwenang.");
    }
    return report;
  }

  private Investigation requireInvestigation(Long reportId) {
    return investigationRepository
        .findByReportId(reportId)
        .orElseThrow(() -> ResourceNotFoundException.of("Investigasi laporan", reportId));
  }
}
