import type { Metadata } from "next";
import { Activity, CheckCircle2, ExternalLink, Inbox, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  PUBLICATIONS,
  TRANSPARENCY_STATS,
  type TransparencyStat,
} from "@/lib/constant/publications";
import { REPORT_CATEGORY_LABEL } from "@/lib/types/report.types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Transparansi",
  description:
    "Rekap putusan pelanggaran PEMIRA yang telah diverifikasi dan dipublikasikan Komite Pengawasan.",
};

const STAT_STYLE: Record<
  TransparencyStat["tone"],
  { icon: typeof Inbox; iconWrap: string; value: string }
> = {
  neutral: { icon: Inbox, iconWrap: "bg-gold/15 text-gold", value: "text-ink-inverse" },
  process: { icon: Activity, iconWrap: "bg-warning/15 text-gold", value: "text-gold" },
  success: { icon: CheckCircle2, iconWrap: "bg-success/15 text-success", value: "text-success" },
  danger: { icon: XCircle, iconWrap: "bg-danger/15 text-danger", value: "text-danger" },
};

// Format tanggal deterministik (tanpa locale runtime) agar tidak beda server/klien.
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function PublikasiPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Akuntabilitas Publik"
        title="Transparansi"
        description="Rekap putusan pelanggaran yang telah diverifikasi dan disetujui. Hanya kasus yang telah berkekuatan tetap yang ditampilkan di sini."
      />

      {/* Dashboard statistik */}
      <section className="border-b border-white/10 bg-navy-dark py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-center justify-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-success" aria-hidden />
            <span className="text-xs font-semibold tracking-[0.2em] text-ink-inverse/60 uppercase">
              Rekapitulasi Kasus
            </span>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRANSPARENCY_STATS.map((stat) => {
              const style = STAT_STYLE[stat.tone];
              const Icon = style.icon;
              return (
                <li
                  key={stat.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <span
                    className={cn(
                      "inline-flex size-11 items-center justify-center rounded-xl",
                      style.iconWrap,
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <p className="mt-5 text-xs font-semibold tracking-wide text-ink-inverse/60 uppercase">
                    {stat.label}
                  </p>
                  <p className={cn("mt-1 text-4xl font-extrabold", style.value)}>
                    {stat.value}
                  </p>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 text-center text-xs text-ink-inverse/40">
            Angka bersifat sementara untuk pratinjau. Nantinya diambil langsung dari basis
            data laporan.
          </p>
        </div>
      </section>

      {/* Feed berita / putusan */}
      <section className="bg-navy py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-ink-inverse sm:text-3xl">
            Berita &amp; Putusan Terbaru
          </h2>
          <span aria-hidden className="mt-4 block h-1 w-20 rounded-full bg-gold" />

          <ul className="mt-12 space-y-6">
            {PUBLICATIONS.map((pub) => (
              <li
                key={pub.slug}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-gold/40 sm:p-8"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                    {REPORT_CATEGORY_LABEL[pub.category]}
                  </span>
                  <span className="text-xs text-ink-inverse/50">
                    {formatDate(pub.publishedAt)}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-ink-inverse">{pub.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-inverse/70">{pub.summary}</p>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-sm">
                  <span className="text-ink-inverse/60">
                    Terlapor:{" "}
                    <span className="font-medium text-ink-inverse/80">
                      {pub.candidateLabel}
                    </span>
                  </span>
                  <span className="text-ink-inverse/60">
                    Putusan:{" "}
                    <span className="font-medium text-gold">{pub.sanction}</span>
                  </span>
                  {pub.instagramUrl && (
                    <a
                      href={pub.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1.5 font-semibold text-gold transition-colors hover:text-gold-light"
                    >
                      Lihat di Instagram
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
