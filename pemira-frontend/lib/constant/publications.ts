import type { ReportCategory } from "@/lib/types/report.types";

/**
 * Data transparansi. SEMENTARA statis untuk membangun UI. Nanti diambil dari
 * backend: statistik dari agregasi laporan, feed dari GET /api/v1/public/publications
 * (T-08-07). Hanya laporan berstatus DIPUBLIKASI yang boleh tampil di sini —
 * isi laporan tidak pernah publik sebelum disetujui (ADR-007).
 */

export type TransparencyStat = {
  key: string;
  label: string;
  value: number;
  tone: "neutral" | "process" | "success" | "danger";
};

export const TRANSPARENCY_STATS: readonly TransparencyStat[] = [
  { key: "masuk", label: "Laporan Masuk", value: 25, tone: "neutral" },
  { key: "proses", label: "Sedang Diinvestigasi", value: 4, tone: "process" },
  { key: "selesai", label: "Kasus Ditutup", value: 13, tone: "success" },
  { key: "ditolak", label: "Tidak Terbukti", value: 5, tone: "danger" },
];

export type PublicationItem = {
  slug: string;
  title: string;
  summary: string;
  category: ReportCategory;
  sanction: string;
  publishedAt: string; // ISO
  candidateLabel: string;
  instagramUrl?: string;
};

export const PUBLICATIONS: readonly PublicationItem[] = [
  {
    slug: "spanduk-luar-jadwal-paslon-2",
    title: "Sanksi Teguran atas Pemasangan Spanduk di Luar Jadwal",
    summary:
      "Komite Pengawasan menjatuhkan teguran tertulis kepada tim kampanye setelah terbukti memasang atribut sebelum masa kampanye resmi dimulai.",
    category: "KAMPANYE_DILUAR_JADWAL",
    sanction: "Teguran tertulis",
    publishedAt: "2025-09-20T09:00:00+07:00",
    candidateLabel: "Pasangan Calon Nomor 2",
    instagramUrl: "https://instagram.com/",
  },
  {
    slug: "konten-akun-tak-terdaftar",
    title: "Klarifikasi Dugaan Kampanye lewat Akun Tidak Terdaftar",
    summary:
      "Setelah cross-check, laporan mengenai akun media sosial anonim dinyatakan tidak cukup bukti untuk dikaitkan dengan kandidat mana pun.",
    category: "PELANGGARAN_MEDIA_SOSIAL",
    sanction: "Tidak terbukti",
    publishedAt: "2025-09-24T15:30:00+07:00",
    candidateLabel: "Tidak teridentifikasi",
  },
  {
    slug: "perusakan-atribut-koridor",
    title: "Putusan atas Perusakan Atribut Kampanye di Koridor Kampus",
    summary:
      "Terlapor terbukti menurunkan atribut kandidat lain tanpa kewenangan. Dijatuhkan teguran tertulis dan kewajiban mengganti kerugian.",
    category: "PERUSAKAN_ATRIBUT",
    sanction: "Teguran + ganti rugi",
    publishedAt: "2025-09-28T11:00:00+07:00",
    candidateLabel: "Pasangan Calon Nomor 1",
    instagramUrl: "https://instagram.com/",
  },
];
