import type { ReportCategory } from "@/lib/types/report.types";

export type TimelinePhase = {
  phase: string;
  period: string;
  description: string;
  status: "selesai" | "berlangsung" | "akan-datang";
};

export type FormTemplate = {
  code: string;
  icon: "file" | "search";
  iconBg: string;
  title: string;
  description: string;
  href: string;
};

export type InfoContent = {
  note: string;
  timeline: TimelinePhase[];
  forms: FormTemplate[];
};

export type ViolationRule = {
  code: string;
  article: string;
  title: string;
  description: string;
  category: ReportCategory;
  sanction: string;
};

export type AturanContent = {
  notice: string;
  rules: ViolationRule[];
};

export type Division = {
  icon: "users" | "scroll" | "gavel" | "wallet" | "map" | "megaphone";
  name: string;
  role: string;
  detail: string;
};

export type ProcessStep = {
  title: string;
  detail: string;
};

export type TentangContent = {
  mandate: string[];
  divisions: Division[];
  processSteps: ProcessStep[];
};

export const DEFAULT_INFO_CONTENT: InfoContent = {
  note:
    "Laporan pelanggaran hanya diterima untuk kejadian yang terjadi dalam rentang tahapan yang sedang atau sudah berjalan. Tanggal di bawah menunggu pengesahan resmi Komite Pengawasan.",
  timeline: [
    {
      phase: "Pendaftaran Bakal Calon",
      period: "1 – 7 September 2026",
      description: "Pengumpulan berkas administratif calon Ketua BEM dan anggota BPM.",
      status: "akan-datang",
    },
    {
      phase: "Verifikasi Berkas",
      period: "8 – 12 September 2026",
      description: "Komite Pengawasan memeriksa kelengkapan dan keabsahan berkas.",
      status: "akan-datang",
    },
    {
      phase: "Penetapan Nomor Urut",
      period: "15 September 2026",
      description: "Pengundian dan penetapan nomor urut pasangan calon.",
      status: "akan-datang",
    },
    {
      phase: "Masa Kampanye",
      period: "16 September – 5 Oktober 2026",
      description:
        "Kandidat menyampaikan visi, misi, dan program kerja. Seluruh pelanggaran pada tahap ini dapat dilaporkan lewat aplikasi.",
      status: "akan-datang",
    },
    {
      phase: "Masa Tenang",
      period: "6 – 7 Oktober 2026",
      description: "Seluruh kegiatan kampanye dihentikan. Atribut wajib diturunkan.",
      status: "akan-datang",
    },
    {
      phase: "Pemungutan Suara",
      period: "8 Oktober 2026",
      description: "Pemilihan dilaksanakan secara daring melalui sistem pemungutan suara terpisah.",
      status: "akan-datang",
    },
    {
      phase: "Rekapitulasi & Penetapan",
      period: "9 – 10 Oktober 2026",
      description: "Penghitungan suara, penyelesaian sengketa, dan penetapan hasil akhir.",
      status: "akan-datang",
    },
  ],
  forms: [
    {
      code: "A-1",
      icon: "file",
      iconBg: "bg-steel-deep",
      title: "Formulir Laporan",
      description:
        "Dokumen untuk menampung laporan dugaan pelanggaran yang diajukan secara resmi oleh mahasiswa sebagai bentuk pengawasan partisipatif.",
      href: "/templates/formulir-laporan-a1.txt",
    },
    {
      code: "A-2",
      icon: "search",
      iconBg: "bg-maroon",
      title: "Formulir Temuan",
      description:
        "Instrumen pencatatan dugaan pelanggaran yang ditemukan langsung oleh internal Komite Pengawasan saat pengawasan aktif di lapangan.",
      href: "/templates/formulir-temuan-a2.txt",
    },
  ],
};

export const DEFAULT_ATURAN_CONTENT: AturanContent = {
  notice:
    "Rumusan pasal di halaman ini masih menunggu pengesahan naskah resmi Komite Pengawasan. Gunakan sebagai rujukan awal, bukan sebagai dasar keberatan formal.",
  rules: [
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
  ],
};

export const DEFAULT_TENTANG_CONTENT: TentangContent = {
  mandate: [
    "Komite Pengawasan dibentuk untuk memastikan setiap tahapan pemilihan raya berjalan jujur, terbuka, dan berkepastian hukum. Kami tidak menghitung suara dan tidak berpihak pada kandidat mana pun. Tugas kami tunggal: menegakkan tata tertib kampanye, dan memutus setiap dugaan pelanggaran berdasarkan bukti.",
    "Seluruh laporan yang masuk lewat aplikasi ini terekam permanen. Perubahan status laporan, siapa yang memutus, dan kapan keputusan diambil tersimpan sebagai jejak audit yang tidak dapat dihapus — termasuk oleh kami sendiri.",
  ],
  divisions: [
    {
      icon: "users",
      name: "Inti dan Penanggung Jawab",
      role: "Koordinasi utama dan pengambilan arahan strategis",
      detail:
        "Mengawal arah kerja Komite Pengawasan, memastikan koordinasi lintas divisi berjalan, serta menjadi penanggung jawab utama dalam pelaksanaan pengawasan PEMIRA.",
    },
    {
      icon: "scroll",
      name: "Divisi Kesekretariatan",
      role: "Administrasi, surat-menyurat, dan arsip kelembagaan",
      detail:
        "Mengelola dokumen resmi, notulensi, arsip laporan, surat keputusan, serta kebutuhan administrasi agar setiap proses memiliki jejak tertulis yang rapi.",
    },
    {
      icon: "gavel",
      name: "Divisi Hukum",
      role: "Kajian aturan dan penanganan dugaan pelanggaran",
      detail:
        "Menelaah laporan berdasarkan tata tertib PEMIRA, memeriksa kesesuaian bukti, dan menyusun rekomendasi hukum untuk proses tindak lanjut.",
    },
    {
      icon: "wallet",
      name: "Divisi Keuangan",
      role: "Pengelolaan anggaran dan pertanggungjawaban dana",
      detail:
        "Mencatat pemasukan dan pengeluaran kegiatan, menyiapkan kebutuhan pendanaan, serta memastikan laporan keuangan transparan dan dapat dipertanggungjawabkan.",
    },
    {
      icon: "map",
      name: "Divisi Koordinator Lapangan",
      role: "Pengawasan teknis dan koordinasi kegiatan di lapangan",
      detail:
        "Mengatur kebutuhan teknis pengawasan, berkoordinasi dengan petugas lapangan, dan memastikan pelaksanaan kegiatan sesuai arahan serta jadwal.",
    },
    {
      icon: "megaphone",
      name: "Divisi Pubdekdok",
      role: "Publikasi, dokumentasi, dan desain informasi",
      detail:
        "Mengelola konten publikasi, dokumentasi kegiatan, desain informasi, serta kanal media sosial resmi Komite Pengawasan.",
    },
  ],
  processSteps: [
    {
      title: "Laporan diterima",
      detail: "Mahasiswa mengirim laporan beserta bukti. Sistem menerbitkan kode tiket.",
    },
    {
      title: "Investigasi",
      detail:
        "Divisi Hukum & Sekretariat memeriksa bukti dan menetapkan laporan terbukti atau tidak terbukti.",
    },
    {
      title: "Putusan Ketua",
      detail:
        "Laporan yang terbukti disusun menjadi berkas resmi, lalu disetujui atau ditolak Ketua dengan alasan tertulis.",
    },
    {
      title: "Publikasi",
      detail:
        "Hanya laporan yang telah disetujui yang dipublikasikan. Sebelum itu, isi laporan tidak pernah dibuka ke publik.",
    },
  ],
};
