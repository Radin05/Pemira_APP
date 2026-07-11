package id.kppoltekkesbdg.pemira.report;

/**
 * Status laporan. Nilai HARUS sama persis dengan CHECK constraint di migrasi V1
 * dan dengan REPORT_STATUS di frontend (report.types.ts).
 */
public enum ReportStatus {
  DITERIMA,
  DIVERIFIKASI,
  VALID,
  HOAX,
  DICATAT_HOAX,
  DIBUAT_LAPORAN_INVESTIGASI,
  MENUNGGU_PERSETUJUAN_KETUA,
  DISETUJUI,
  DITOLAK,
  DIPUBLIKASI,
  DITARIK,
  SELESAI
}
