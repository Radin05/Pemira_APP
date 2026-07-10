/**
 * Identitas tunggal aplikasi. Jangan menulis nama institusi langsung di JSX —
 * ambil dari sini, supaya perubahan nama tidak perlu diburu ke seluruh halaman.
 */
export const SITE = {
  orgName: "Komite Pengawasan",
  orgShort: "KP",
  institution: "KM Poltekkes Kemenkes Bandung",
  institutionShort: "Poltekkes Kemenkes Bandung",
  tagline: "PEMIRA 2025",

  // TODO(konfirmasi KP): alamat & jam operasional resmi belum divalidasi.
  email: "kp.pemira@poltekkesbandung.ac.id",
  operationalHours: "07.00 – 17.00 WIB",
  responseTime: "Rata-rata respons < 8 jam",

  logo: {
    src: "/logo-kp.png",
    alt: "Logo Komite Pengawasan KM Poltekkes Kemenkes Bandung",
    width: 447,
    height: 559,
  },
} as const;

/** Prinsip kerja KP — ditampilkan di beranda. */
export const WORK_PRINCIPLES = [
  {
    icon: "shield",
    title: "Integritas",
    description: "Konsistensi penuh antara aturan dan tindakan di lapangan.",
  },
  {
    icon: "eye",
    title: "Transparansi",
    description: "Keterbukaan akses informasi regulasi bagi seluruh mahasiswa.",
  },
  {
    icon: "scale",
    title: "Akuntabilitas",
    description: "Pertanggungjawaban penuh atas setiap keputusan yang diambil.",
  },
  {
    icon: "lock",
    title: "Independensi",
    description: "Bebas dari tekanan dan intervensi pihak eksternal mana pun.",
  },
  {
    icon: "file-check",
    title: "Kepastian Hukum",
    description: "Keputusan aduan wajib berbasis bukti digital yang sah.",
  },
] as const;

export const SITE_STATS = [
  { value: "100%", label: "Independen", caption: "Bebas dari intervensi" },
  { value: "24/7", label: "Sistem Aktif", caption: "Pengawasan berkelanjutan" },
  { value: "0", label: "Toleransi Pelanggaran", caption: "Setiap kasus ditindaklanjuti" },
] as const;
