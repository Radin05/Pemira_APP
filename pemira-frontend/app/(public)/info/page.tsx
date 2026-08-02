import type { Metadata } from "next";
import { CheckCircle2, CircleDot, Circle, Download, FileText, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PEMIRA_TIMELINE, type TimelinePhase } from "@/lib/constant/rules";
import { cn } from "@/lib/utils";

// Template formulir yang bisa diunduh — "Intelligence Hub" pada referensi.
// TODO(konfirmasi KP): file .txt ini placeholder, ganti dengan formulir resmi.
const FORM_TEMPLATES = [
  {
    code: "A-1",
    icon: FileText,
    iconBg: "bg-steel-deep",
    title: "Formulir Laporan",
    description:
      "Dokumen untuk menampung laporan dugaan pelanggaran yang diajukan secara resmi oleh mahasiswa sebagai bentuk pengawasan partisipatif.",
    href: "/templates/formulir-laporan-a1.txt",
  },
  {
    code: "A-2",
    icon: Search,
    iconBg: "bg-maroon",
    title: "Formulir Temuan",
    description:
      "Instrumen pencatatan dugaan pelanggaran yang ditemukan langsung oleh internal Komite Pengawasan saat pengawasan aktif di lapangan.",
    href: "/templates/formulir-temuan-a2.txt",
  },
] as const;

export const metadata: Metadata = {
  title: "Info Pemira",
  description:
    "Tahapan dan jadwal Pemilihan Raya calon BEM dan BPM KM Poltekkes Kemenkes Bandung.",
};

const PHASE_STYLE: Record<
  TimelinePhase["status"],
  { icon: typeof Circle; dot: string; label: string; badge: string }
> = {
  selesai: {
    icon: CheckCircle2,
    dot: "text-success",
    label: "Selesai",
    badge: "bg-success/15 text-success border-success/40",
  },
  berlangsung: {
    icon: CircleDot,
    dot: "text-ochre",
    label: "Sedang Berlangsung",
    badge: "bg-warning/15 text-steel-ink border-warning/50",
  },
  "akan-datang": {
    icon: Circle,
    dot: "text-steel/50",
    label: "Akan Datang",
    badge: "bg-canvas text-ink-muted border-canvas-line",
  },
};

export default function InfoPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Tahapan & Sosialisasi"
        title="Info Pemira"
        description="Jadwal resmi setiap tahapan pemilihan raya, dari pendaftaran bakal calon sampai penetapan hasil akhir."
      />

      <section className="bg-ivory py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <p className="mb-12 rounded-xl border border-steel/20 bg-surface p-5 text-sm leading-relaxed text-ink-muted shadow-sm">
            Laporan pelanggaran hanya diterima untuk kejadian yang terjadi dalam rentang
            tahapan yang sedang atau sudah berjalan. Tanggal di bawah menunggu
            pengesahan resmi Komite Pengawasan.
          </p>

          <ol className="relative">
            {PEMIRA_TIMELINE.map((phase, index) => {
              const style = PHASE_STYLE[phase.status];
              const Icon = style.icon;
              const isLast = index === PEMIRA_TIMELINE.length - 1;

              return (
                <li key={phase.phase} className="relative flex gap-6 pb-10 last:pb-0">
                  {/* Garis penghubung antar tahap, disembunyikan di item terakhir. */}
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute top-8 bottom-0 left-[0.9375rem] w-px bg-steel/35"
                    />
                  )}

                  {/* bg WAJIB sama persis dengan bg section, ia yang menutup garis di balik ikon. */}
                  <span className="relative z-10 mt-0.5 shrink-0 rounded-full bg-ivory">
                    <Icon className={cn("size-8", style.dot)} aria-hidden />
                  </span>

                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-steel-ink">{phase.phase}</h2>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase",
                          style.badge,
                        )}
                      >
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-steel-deep">{phase.period}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                      {phase.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Instrumen & Formulir — template yang bisa diunduh */}
      <section id="formulir" className="scroll-mt-24 border-t border-canvas-line bg-canvas py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-extrabold text-steel-ink sm:text-4xl">
              Instrumen &amp; Formulir
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted">
              Formulir standar operasional pengawasan. Unduh, isi, lalu lampirkan saat
              mengirim laporan.
            </p>
            <span aria-hidden className="mt-5 h-1 w-24 rounded-full bg-amber" />
          </div>

          <ul className="mt-14 grid gap-6 md:grid-cols-2">
            {FORM_TEMPLATES.map((tpl) => (
              <li
                key={tpl.code}
                className="relative overflow-hidden rounded-2xl border border-steel/20 bg-surface p-7 shadow-sm"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-4 bottom-0 text-8xl font-extrabold text-steel/12"
                >
                  {tpl.code}
                </span>
                <div className="relative flex items-start gap-4">
                  <span
                    className={cn(
                      "inline-flex size-12 shrink-0 items-center justify-center rounded-xl",
                      tpl.iconBg,
                    )}
                  >
                    <tpl.icon className="size-6 text-ink-inverse" aria-hidden />
                  </span>
                  <div>
                    <span className="rounded-full bg-amber/15 px-3 py-1 text-xs font-semibold tracking-wide text-ochre">
                      Formulir Model {tpl.code}
                    </span>
                    <h3 className="mt-3 text-xl font-bold text-steel-ink">{tpl.title}</h3>
                  </div>
                </div>
                <p className="relative mt-4 text-sm leading-relaxed text-ink-muted">
                  {tpl.description}
                </p>
                <a
                  href={tpl.href}
                  download
                  className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-steel/40 px-5 py-2.5 text-sm font-semibold text-steel-deep transition-colors hover:bg-amber/15"
                >
                  <Download className="size-4" aria-hidden />
                  Unduh Template {tpl.code}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
