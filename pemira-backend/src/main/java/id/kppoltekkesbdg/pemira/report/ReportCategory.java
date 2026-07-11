package id.kppoltekkesbdg.pemira.report;

/**
 * Kategori pelanggaran. Nilai HARUS sama dengan CHECK constraint di migrasi V1
 * dan dengan REPORT_CATEGORY di frontend (report.types.ts).
 */
public enum ReportCategory {
  KAMPANYE_DILUAR_JADWAL,
  POLITIK_UANG,
  KAMPANYE_HITAM,
  PERUSAKAN_ATRIBUT,
  PELIBATAN_PIHAK_TERLARANG,
  PELANGGARAN_MEDIA_SOSIAL,
  INTIMIDASI,
  LAINNYA
}
