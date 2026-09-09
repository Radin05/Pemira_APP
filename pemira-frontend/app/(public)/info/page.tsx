import type { Metadata } from "next";
import { CheckCircle2, CircleDot, Circle, Download, FileText, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { publicContent } from "@/lib/api/content.service";
import {
  DEFAULT_INFO_CONTENT,
  type FormTemplate,
  type InfoContent,
  type TimelinePhase,
} from "@/lib/constant/page-content";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

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

const FORM_ICONS: Record<FormTemplate["icon"], typeof FileText> = {
  file: FileText,
  search: Search,
};

export default async function InfoPage() {
  const content = await publicContent.get<InfoContent>("info", DEFAULT_INFO_CONTENT);

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Tahapan & Sosialisasi"
        title="Info Pemira"
        description="Jadwal resmi setiap tahapan pemilihan raya, dari pendaftaran bakal calon sampai penetapan hasil akhir."
      />

      <section className="bg-ivory py-12 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-10 rounded-xl border border-steel/20 bg-surface p-5 text-sm leading-relaxed text-ink-muted shadow-sm sm:mb-12">
            {content.note}
          </p>

          <ol className="relative">
            {content.timeline.map((phase, index) => {
              const style = PHASE_STYLE[phase.status] ?? PHASE_STYLE["akan-datang"];
              const Icon = style.icon;
              const isLast = index === content.timeline.length - 1;

              return (
                <li key={`${phase.phase}-${index}`} className="relative flex gap-4 pb-10 sm:gap-6 last:pb-0">
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute top-8 bottom-0 left-[0.9375rem] w-px bg-steel/35"
                    />
                  )}

                  <span className="relative z-10 mt-0.5 shrink-0 rounded-full bg-ivory">
                    <Icon className={cn("size-8", style.dot)} aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold break-words text-steel-ink">{phase.phase}</h2>
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
                    <p className="mt-3 text-sm leading-relaxed break-words text-ink-muted">
                      {phase.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section id="formulir" className="scroll-mt-24 border-t border-canvas-line bg-canvas py-12 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-extrabold text-steel-ink sm:text-4xl">
              Instrumen &amp; Formulir
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted">
              Formulir standar operasional pengawasan. Unduh, isi, lalu lampirkan saat
              mengirim laporan.
            </p>
            <span aria-hidden className="mt-5 h-1 w-24 rounded-full bg-amber" />
          </div>

          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-14">
            {content.forms.map((tpl, index) => {
              const Icon = FORM_ICONS[tpl.icon] ?? FileText;
              return (
                <li
                  key={`${tpl.code}-${index}`}
                  className="relative overflow-hidden rounded-2xl border border-steel/20 bg-surface p-5 shadow-sm sm:p-7"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-4 bottom-0 text-7xl font-extrabold text-steel/12 sm:text-8xl"
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
                      <Icon className="size-6 text-ink-inverse" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <span className="rounded-full bg-amber/15 px-3 py-1 text-xs font-semibold tracking-wide text-ochre">
                        Formulir Model {tpl.code}
                      </span>
                      <h3 className="mt-3 text-xl font-bold break-words text-steel-ink">{tpl.title}</h3>
                    </div>
                  </div>
                  <p className="relative mt-4 text-sm leading-relaxed break-words text-ink-muted">
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
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
