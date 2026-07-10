import type { ReportCategory } from "@/lib/types/report.types";

/**
 * Tata tertib kampanye. Ini cermin dari tabel `violation_rules` di backend
 * (docs/02-ERD.md) — `code` di sini harus sama persis dengan `violation_rules.code`
 * di migrasi Flyway V10, karena laporan investigasi merujuk pasal lewat kode ini.
 *
 * TODO(konfirmasi KP): isi pasal di bawah masih rumusan sementara. Ganti dengan
 * bunyi tata tertib resmi sebelum halaman ini dipublikasikan — halaman ini jadi
 * rujukan mahasiswa saat menilai apakah suatu tindakan layak dilaporkan.
 */
export type ViolationRule = {
  code: string;
  article: string;
  title: string;
  description: string;
  category: ReportCategory;
  sanction: string;
};

export const VIOLATION_RULES: readonly ViolationRule[] = [
  {
    code: "PASAL_5_AYAT_1",
    article: "Pasal 5 Ayat (1)",
    title: "Kampanye di Luar Jadwal",
    description:
      "Kandidat dan tim kampanye dilarang melakukan kegiatan kampanye dalam bentuk apa pun sebelum masa kampanye dimulai atau setelah masa tenang ditetapkan.",
    category: "KAMPANYE_DILUAR_JADWAL",
    sanction: "Teguran tertulis, hingga pengurangan suara bila berulang.",
  },
  {
    code: "PASAL_7_AYAT_2",
    article: "Pasal 7 Ayat (2)",
    title: "Politik Uang",
    description:
      "Dilarang menjanjikan atau memberikan uang, barang, jasa, atau keuntungan material lain kepada pemilih dengan maksud memengaruhi pilihannya.",
    category: "POLITIK_UANG",
    sanction: "Diskualifikasi pasangan calon.",
  },
  {
    code: "PASAL_8_AYAT_1",
    article: "Pasal 8 Ayat (1)",
    title: "Kampanye Hitam",
    description:
      "Dilarang menyebarkan informasi yang menghina, memfitnah, atau menyerang pribadi kandidat lain, termasuk yang tidak dapat dibuktikan kebenarannya.",
    category: "KAMPANYE_HITAM",
    sanction: "Teguran tertulis hingga diskualifikasi, bergantung dampaknya.",
  },
  {
    code: "PASAL_9_AYAT_3",
    article: "Pasal 9 Ayat (3)",
    title: "Perusakan Atribut Kampanye",
    description:
      "Dilarang merusak, menutup, memindahkan, atau menghilangkan atribut kampanye kandidat lain yang dipasang sesuai ketentuan.",
    category: "PERUSAKAN_ATRIBUT",
    sanction: "Teguran tertulis dan kewajiban mengganti kerugian.",
  },
  {
    code: "PASAL_11_AYAT_1",
    article: "Pasal 11 Ayat (1)",
    title: "Pelibatan Pihak Terlarang",
    description:
      "Dilarang melibatkan pejabat struktural kampus, dosen, atau tenaga kependidikan dalam kegiatan kampanye untuk memengaruhi pilihan mahasiswa.",
    category: "PELIBATAN_PIHAK_TERLARANG",
    sanction: "Teguran tertulis hingga pengurangan suara.",
  },
  {
    code: "PASAL_12_AYAT_2",
    article: "Pasal 12 Ayat (2)",
    title: "Pelanggaran Media Sosial",
    description:
      "Kampanye daring wajib menggunakan akun yang terdaftar pada Komite Pengawasan. Dilarang memakai akun anonim atau akun palsu untuk mengampanyekan kandidat.",
    category: "PELANGGARAN_MEDIA_SOSIAL",
    sanction: "Teguran tertulis dan kewajiban menurunkan konten.",
  },
  {
    code: "PASAL_14_AYAT_1",
    article: "Pasal 14 Ayat (1)",
    title: "Intimidasi terhadap Pemilih",
    description:
      "Dilarang mengancam, menekan, atau mengintimidasi mahasiswa agar memilih atau tidak memilih kandidat tertentu.",
    category: "INTIMIDASI",
    sanction: "Diskualifikasi pasangan calon.",
  },
];

/** Tahapan PEMIRA. TODO(konfirmasi KP): tanggal masih contoh, belum resmi. */
export type TimelinePhase = {
  phase: string;
  period: string;
  description: string;
  status: "selesai" | "berlangsung" | "akan-datang";
};

export const PEMIRA_TIMELINE: readonly TimelinePhase[] = [
  {
    phase: "Pendaftaran Bakal Calon",
    period: "1 – 7 September 2025",
    description: "Pengumpulan berkas administratif calon Ketua BEM dan anggota BPM.",
    status: "selesai",
  },
  {
    phase: "Verifikasi Berkas",
    period: "8 – 12 September 2025",
    description: "Komite Pengawasan memeriksa kelengkapan dan keabsahan berkas.",
    status: "selesai",
  },
  {
    phase: "Penetapan Nomor Urut",
    period: "15 September 2025",
    description: "Pengundian dan penetapan nomor urut pasangan calon.",
    status: "selesai",
  },
  {
    phase: "Masa Kampanye",
    period: "16 September – 5 Oktober 2025",
    description:
      "Kandidat menyampaikan visi, misi, dan program kerja. Seluruh pelanggaran pada tahap ini dapat dilaporkan lewat aplikasi.",
    status: "berlangsung",
  },
  {
    phase: "Masa Tenang",
    period: "6 – 7 Oktober 2025",
    description: "Seluruh kegiatan kampanye dihentikan. Atribut wajib diturunkan.",
    status: "akan-datang",
  },
  {
    phase: "Pemungutan Suara",
    period: "8 Oktober 2025",
    description: "Pemilihan dilaksanakan secara daring melalui sistem pemungutan suara terpisah.",
    status: "akan-datang",
  },
  {
    phase: "Rekapitulasi & Penetapan",
    period: "9 – 10 Oktober 2025",
    description: "Penghitungan suara, penyelesaian sengketa, dan penetapan hasil akhir.",
    status: "akan-datang",
  },
];
