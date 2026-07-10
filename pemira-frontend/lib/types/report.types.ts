/**
 * Cermin dari enum ReportStatus di backend (docs/02-ERD.md §3).
 * Kalau daftar ini berubah, ubah juga CHECK constraint di migrasi Flyway —
 * keduanya harus selalu sinkron.
 */
export const REPORT_STATUS = [
  "DITERIMA",
  "DIVERIFIKASI",
  "VALID",
  "HOAX",
  "DICATAT_HOAX",
  "DIBUAT_LAPORAN_INVESTIGASI",
  "MENUNGGU_PERSETUJUAN_KETUA",
  "DISETUJUI",
  "DITOLAK",
  "DIPUBLIKASI",
  "DITARIK",
  "SELESAI",
] as const;

export type ReportStatus = (typeof REPORT_STATUS)[number];

export const REPORT_CATEGORY = [
  "KAMPANYE_DILUAR_JADWAL",
  "POLITIK_UANG",
  "KAMPANYE_HITAM",
  "PERUSAKAN_ATRIBUT",
  "PELIBATAN_PIHAK_TERLARANG",
  "PELANGGARAN_MEDIA_SOSIAL",
  "INTIMIDASI",
  "LAINNYA",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORY)[number];

/** Label bahasa Indonesia untuk ditampilkan ke user. */
export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  DITERIMA: "Diterima",
  DIVERIFIKASI: "Sedang Diverifikasi",
  VALID: "Terbukti Valid",
  HOAX: "Tidak Terbukti",
  DICATAT_HOAX: "Dicatat Sebagai Hoaks",
  DIBUAT_LAPORAN_INVESTIGASI: "Penyusunan Laporan",
  MENUNGGU_PERSETUJUAN_KETUA: "Menunggu Persetujuan Ketua",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
  DIPUBLIKASI: "Dipublikasi",
  DITARIK: "Ditarik",
  SELESAI: "Selesai",
};

export const REPORT_CATEGORY_LABEL: Record<ReportCategory, string> = {
  KAMPANYE_DILUAR_JADWAL: "Kampanye di Luar Jadwal",
  POLITIK_UANG: "Politik Uang",
  KAMPANYE_HITAM: "Kampanye Hitam",
  PERUSAKAN_ATRIBUT: "Perusakan Atribut",
  PELIBATAN_PIHAK_TERLARANG: "Pelibatan Pihak Terlarang",
  PELANGGARAN_MEDIA_SOSIAL: "Pelanggaran Media Sosial",
  INTIMIDASI: "Intimidasi",
  LAINNYA: "Lainnya",
};
