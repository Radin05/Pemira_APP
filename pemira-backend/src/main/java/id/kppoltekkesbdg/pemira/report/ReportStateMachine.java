package id.kppoltekkesbdg.pemira.report;

import id.kppoltekkesbdg.pemira.common.constant.RoleName;
import id.kppoltekkesbdg.pemira.common.exception.IllegalStateTransitionException;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

/**
 * State machine laporan yang dideklarasikan di satu tempat (ADR-002). Diagram
 * resmi ada di docs/01-PRD.md §4.3. Kode dan diagram TIDAK boleh menyimpang —
 * seluruh transisi diuji lengkap lewat parameterized test (T-04-02).
 *
 * Pembuatan awal (null → DITERIMA) BUKAN transisi di sini; itu terjadi saat
 * laporan dibuat. State machine hanya mengatur perubahan dari status yang ada.
 */
@Component
public class ReportStateMachine {

  /** Satu transisi legal: ke status apa, oleh peran apa. */
  public record Transition(ReportStatus to, RoleName role) {}

  private final Map<ReportStatus, Set<Transition>> transitions = new EnumMap<>(ReportStatus.class);

  public ReportStateMachine() {
    allow(ReportStatus.DITERIMA, ReportStatus.DIVERIFIKASI, RoleName.HUKUM_SEKRETARIAT);

    allow(ReportStatus.DIVERIFIKASI, ReportStatus.VALID, RoleName.HUKUM_SEKRETARIAT);
    allow(ReportStatus.DIVERIFIKASI, ReportStatus.HOAX, RoleName.HUKUM_SEKRETARIAT);

    allow(ReportStatus.HOAX, ReportStatus.DICATAT_HOAX, RoleName.HUKUM_SEKRETARIAT);
    allow(ReportStatus.DICATAT_HOAX, ReportStatus.SELESAI, RoleName.HUKUM_SEKRETARIAT);

    allow(ReportStatus.VALID, ReportStatus.DIBUAT_LAPORAN_INVESTIGASI, RoleName.HUKUM_SEKRETARIAT);
    allow(
        ReportStatus.DIBUAT_LAPORAN_INVESTIGASI,
        ReportStatus.MENUNGGU_PERSETUJUAN_KETUA,
        RoleName.HUKUM_SEKRETARIAT);

    allow(ReportStatus.MENUNGGU_PERSETUJUAN_KETUA, ReportStatus.DISETUJUI, RoleName.KETUA_KP);
    allow(ReportStatus.MENUNGGU_PERSETUJUAN_KETUA, ReportStatus.DITOLAK, RoleName.KETUA_KP);

    // Laporan yang ditolak boleh direvisi atau diarsipkan (US-506).
    allow(ReportStatus.DITOLAK, ReportStatus.DIBUAT_LAPORAN_INVESTIGASI, RoleName.HUKUM_SEKRETARIAT);
    allow(ReportStatus.DITOLAK, ReportStatus.SELESAI, RoleName.HUKUM_SEKRETARIAT);

    allow(ReportStatus.DISETUJUI, ReportStatus.DIPUBLIKASI, RoleName.PDD);
    allow(ReportStatus.DIPUBLIKASI, ReportStatus.DITARIK, RoleName.PDD);
    allow(ReportStatus.DITARIK, ReportStatus.DIPUBLIKASI, RoleName.PDD);
    allow(ReportStatus.DIPUBLIKASI, ReportStatus.SELESAI, RoleName.PDD);
    // SELESAI bersifat terminal — tidak ada transisi keluar.
  }

  private void allow(ReportStatus from, ReportStatus to, RoleName role) {
    transitions.computeIfAbsent(from, k -> new HashSet<>()).add(new Transition(to, role));
  }

  /** True bila peran {@code role} boleh memindahkan laporan dari {@code from} ke {@code to}. */
  public boolean canTransition(ReportStatus from, ReportStatus to, RoleName role) {
    return transitions.getOrDefault(from, Set.of()).contains(new Transition(to, role));
  }

  /** Lempar {@link IllegalStateTransitionException} (→ HTTP 409) bila transisi ilegal. */
  public void assertCanTransition(ReportStatus from, ReportStatus to, RoleName role) {
    if (!canTransition(from, to, role)) {
      throw new IllegalStateTransitionException(
          "Transisi dari %s ke %s oleh %s tidak diizinkan".formatted(from, to, role));
    }
  }
}
