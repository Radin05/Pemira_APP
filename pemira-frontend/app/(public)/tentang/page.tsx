import type { Metadata } from "next";
import { Gavel, Megaphone, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SITE } from "@/lib/constant/site";

export const metadata: Metadata = {
  title: "Tentang KP",
  description:
    "Profil, tugas, dan struktur divisi Komite Pengawasan KM Poltekkes Kemenkes Bandung.",
};

const DIVISIONS = [
  {
    icon: ScrollText,
    name: "Hukum & Sekretariat",
    role: "Menerima dan menginvestigasi laporan",
    detail:
      "Memeriksa setiap laporan yang masuk, melakukan cross-check terhadap bukti, dan menetapkan apakah laporan terbukti atau tidak. Menyusun laporan investigasi resmi untuk diajukan ke Ketua.",
  },
  {
    icon: Gavel,
    name: "Ketua Komite Pengawasan",
    role: "Memutuskan hasil investigasi",
    detail:
      "Menyetujui atau menolak laporan investigasi. Penolakan wajib disertai alasan tertulis, dan laporan dapat direvisi lalu diajukan kembali.",
  },
  {
    icon: Megaphone,
    name: "Publikasi, Dokumentasi & Desain",
    role: "Mempublikasikan putusan",
    detail:
      "Menyusun dan menerbitkan hasil putusan yang telah disetujui ke halaman Transparansi serta kanal media sosial resmi.",
  },
];

const PROCESS_STEPS = [
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
];

export default function TentangPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Profil Lembaga"
        title={`Tentang ${SITE.orgName}`}
        description={`Badan independen yang mengawasi jalannya pemilihan raya calon BEM dan BPM ${SITE.institutionShort}.`}
      />

      <section className="bg-navy-dark py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-ink-inverse">Mandat Kami</h2>
          <span aria-hidden className="mt-4 block h-1 w-20 rounded-full bg-gold" />
          <p className="mt-8 leading-relaxed text-ink-inverse/70">
            Komite Pengawasan dibentuk untuk memastikan setiap tahapan pemilihan raya
            berjalan jujur, terbuka, dan berkepastian hukum. Kami tidak menghitung suara
            dan tidak berpihak pada kandidat mana pun. Tugas kami tunggal: menegakkan tata
            tertib kampanye, dan memutus setiap dugaan pelanggaran berdasarkan bukti.
          </p>
          <p className="mt-5 leading-relaxed text-ink-inverse/70">
            Seluruh laporan yang masuk lewat aplikasi ini terekam permanen. Perubahan
            status laporan, siapa yang memutus, dan kapan keputusan diambil tersimpan
            sebagai jejak audit yang tidak dapat dihapus — termasuk oleh kami sendiri.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-navy py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-2xl font-bold text-ink-inverse sm:text-3xl">
            Struktur Divisi
          </h2>
          <span aria-hidden className="mx-auto mt-4 block h-1 w-20 rounded-full bg-gold" />

          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {DIVISIONS.map((division) => (
              <li
                key={division.name}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-gold">
                  <division.icon className="size-6 text-navy-dark" aria-hidden />
                </span>
                <h3 className="mt-6 text-lg font-bold text-ink-inverse">
                  {division.name}
                </h3>
                <p className="mt-1.5 text-sm font-medium text-gold">{division.role}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink-inverse/65">
                  {division.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-white/10 bg-navy-dark py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-ink-inverse sm:text-3xl">
            Alur Penanganan Laporan
          </h2>
          <span aria-hidden className="mt-4 block h-1 w-20 rounded-full bg-gold" />

          <ol className="mt-12 space-y-5">
            {PROCESS_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-6"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy-dark">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-bold text-ink-inverse">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-inverse/65">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-10 text-sm leading-relaxed text-ink-inverse/50">
            Punya pertanyaan? Hubungi kami di{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-gold transition-colors hover:text-gold-light"
            >
              {SITE.email}
            </a>
            , operasional {SITE.operationalHours}.
          </p>
        </div>
      </section>
    </main>
  );
}
