package id.kppoltekkesbdg.pemira.approval;

import id.kppoltekkesbdg.pemira.approval.Approval.Decision;
import id.kppoltekkesbdg.pemira.common.constant.RoleName;
import id.kppoltekkesbdg.pemira.common.exception.ResourceNotFoundException;
import id.kppoltekkesbdg.pemira.investigation.Investigation;
import id.kppoltekkesbdg.pemira.investigation.InvestigationRepository;
import id.kppoltekkesbdg.pemira.report.ReportStatus;
import id.kppoltekkesbdg.pemira.report.ReportStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Keputusan Ketua KP atas laporan investigasi yang diajukan (EPIC-06). */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalService {

  private final InvestigationRepository investigationRepository;
  private final ApprovalRepository approvalRepository;
  private final ReportStatusService reportStatusService;

  @Transactional
  public void approve(Long reportId, Long approverId) {
    Investigation inv = requireInvestigation(reportId);

    reportStatusService.transition(
        reportId,
        ReportStatus.MENUNGGU_PERSETUJUAN_KETUA,
        ReportStatus.DISETUJUI,
        RoleName.KETUA_KP,
        approverId,
        "Laporan disetujui Ketua");

    record(inv, approverId, Decision.APPROVED, null);
    // TODO(T-09-02): notifikasi ke PDD bahwa ada laporan siap dipublikasikan.
    log.info("Laporan investigasi report {} DISETUJUI oleh user {}", reportId, approverId);
  }

  @Transactional
  public void reject(Long reportId, Long approverId, String reason) {
    Investigation inv = requireInvestigation(reportId);

    reportStatusService.transition(
        reportId,
        ReportStatus.MENUNGGU_PERSETUJUAN_KETUA,
        ReportStatus.DITOLAK,
        RoleName.KETUA_KP,
        approverId,
        "Laporan ditolak Ketua: " + reason);

    record(inv, approverId, Decision.REJECTED, reason);
    log.info("Laporan investigasi report {} DITOLAK oleh user {}", reportId, approverId);
  }

  private Investigation requireInvestigation(Long reportId) {
    return investigationRepository
        .findByReportId(reportId)
        .orElseThrow(() -> ResourceNotFoundException.of("Investigasi laporan", reportId));
  }

  private void record(Investigation inv, Long approverId, Decision decision, String reason) {
    Approval approval = new Approval();
    approval.setInvestigationId(inv.getId());
    approval.setApproverId(approverId);
    approval.setDecision(decision);
    approval.setReason(reason);
    approval.setRevisionNumber(inv.getRevisionNumber());
    approvalRepository.save(approval);
  }
}
