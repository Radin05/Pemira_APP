package id.kppoltekkesbdg.pemira.report;

import id.kppoltekkesbdg.pemira.common.constant.RoleName;
import id.kppoltekkesbdg.pemira.common.exception.IllegalStateTransitionException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Satu-satunya jalur perubahan status laporan (ADR-001, ADR-002). Memvalidasi
 * transisi lewat state machine (pesan ramah + cek peran), lalu meng-update
 * dengan guard optimistic di DB, lalu menulis 1 baris history — semua atomik.
 */
@Service
@RequiredArgsConstructor
public class ReportStatusService {

  private final ReportRepository reportRepository;
  private final ReportStatusHistoryRepository historyRepository;
  private final ReportStateMachine stateMachine;

  /**
   * @param expectedFrom status yang diharapkan saat ini (guard optimistic)
   * @throws IllegalStateTransitionException bila transisi ilegal atau status sudah berubah (409)
   */
  @Transactional
  public void transition(
      Long reportId,
      ReportStatus expectedFrom,
      ReportStatus to,
      RoleName actorRole,
      Long actorId,
      String note) {
    stateMachine.assertCanTransition(expectedFrom, to, actorRole);

    int updated = reportRepository.updateStatusGuarded(reportId, expectedFrom, to);
    if (updated == 0) {
      // Status di DB bukan expectedFrom: laporan sudah diproses orang lain (race).
      throw new IllegalStateTransitionException(
          "Status laporan sudah berubah. Muat ulang dan coba lagi.");
    }

    historyRepository.save(ReportStatusHistory.of(reportId, expectedFrom, to, actorId, note));
  }
}
