import type { Metadata } from "next";
import { CheckCircle2, CircleDot, Circle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PEMIRA_TIMELINE, type TimelinePhase } from "@/lib/constant/rules";
import { cn } from "@/lib/utils";

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
    dot: "text-gold",
    label: "Sedang Berlangsung",
    badge: "bg-warning/15 text-gold border-warning/50",
  },
  "akan-datang": {
    icon: Circle,
    dot: "text-ink-inverse/30",
    label: "Akan Datang",
    badge: "bg-white/5 text-ink-inverse/50 border-white/15",
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

      <section className="bg-navy-dark py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <p className="mb-12 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-ink-inverse/70">
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
                      className="absolute top-8 bottom-0 left-[0.9375rem] w-px bg-white/15"
                    />
                  )}

                  <span className="relative z-10 mt-0.5 shrink-0 rounded-full bg-navy-dark">
                    <Icon className={cn("size-8", style.dot)} aria-hidden />
                  </span>

                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-ink-inverse">{phase.phase}</h2>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase",
                          style.badge,
                        )}
                      >
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-gold">{phase.period}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-inverse/65">
                      {phase.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </main>
  );
}
