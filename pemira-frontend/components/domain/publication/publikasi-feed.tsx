"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, ExternalLink, Inbox, Loader2, XCircle } from "lucide-react";
import {
  publicationPublic,
  type PublicItem,
  type TransparencyStats,
} from "@/lib/api/publication.service";
import { REPORT_CATEGORY_LABEL } from "@/lib/types/report.types";
import { SANCTION_LABEL } from "@/lib/api/investigation.service";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const STAT_CARDS = [
  { key: "masuk", label: "Laporan Masuk", icon: Inbox, wrap: "bg-gold/15 text-gold", value: "text-ink-inverse" },
  { key: "diinvestigasi", label: "Sedang Diinvestigasi", icon: Activity, wrap: "bg-warning/15 text-gold", value: "text-gold" },
  { key: "dipublikasi", label: "Dipublikasi", icon: CheckCircle2, wrap: "bg-success/15 text-success", value: "text-success" },
  { key: "ditolak", label: "Tidak Terbukti", icon: XCircle, wrap: "bg-danger/15 text-danger", value: "text-danger" },
] as const;

export function PublikasiFeed() {
  const [stats, setStats] = useState<TransparencyStats | null>(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([publicationPublic.stats(), publicationPublic.feed()])
      .then(([s, f]) => {
        if (!active) return;
        setStats(s);
        setItems(f);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
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
            {STAT_CARDS.map((card) => (
              <li
                key={card.key}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <span
                  className={cn(
                    "inline-flex size-11 items-center justify-center rounded-xl",
                    card.wrap,
                  )}
                >
                  <card.icon className="size-5" aria-hidden />
                </span>
                <p className="mt-5 text-xs font-semibold tracking-wide text-ink-inverse/60 uppercase">
                  {card.label}
                </p>
                <p className={cn("mt-1 text-4xl font-extrabold", card.value)}>
                  {stats ? stats[card.key] : "—"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Feed putusan */}
      <section className="bg-navy py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-ink-inverse sm:text-3xl">
            Berita &amp; Putusan Terbaru
          </h2>
          <span aria-hidden className="mt-4 block h-1 w-20 rounded-full bg-gold" />

          {loading ? (
            <div className="mt-12 flex justify-center">
              <Loader2 className="size-7 animate-spin text-gold" aria-hidden />
            </div>
          ) : items.length === 0 ? (
            <p className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-ink-inverse/60">
              Belum ada putusan yang dipublikasikan.
            </p>
          ) : (
            <ul className="mt-12 space-y-6">
              {items.map((pub) => (
                <li
                  key={pub.slug}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-gold/40 sm:p-8"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {pub.category && (
                      <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                        {REPORT_CATEGORY_LABEL[pub.category]}
                      </span>
                    )}
                    {pub.conclusion && (
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          pub.conclusion === "VALID"
                            ? "bg-success/15 text-success"
                            : "bg-danger/15 text-danger",
                        )}
                      >
                        {pub.conclusion === "VALID" ? "Terbukti" : "Tidak Terbukti"}
                      </span>
                    )}
                    <span className="text-xs text-ink-inverse/50">
                      {formatDate(pub.publishedAt)}
                    </span>
                  </div>

                  <Link href={`/publikasi/${pub.slug}`}>
                    <h3 className="mt-4 text-xl font-bold text-ink-inverse hover:text-gold">
                      {pub.title}
                    </h3>
                  </Link>
                  <p className="mt-3 leading-relaxed text-ink-inverse/70">{pub.summary}</p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-sm">
                    {pub.reportedCandidate && (
                      <span className="text-ink-inverse/60">
                        Terlapor:{" "}
                        <span className="font-medium text-ink-inverse/80">
                          {pub.reportedCandidate}
                        </span>
                      </span>
                    )}
                    {pub.recommendedSanction && (
                      <span className="text-ink-inverse/60">
                        Sanksi:{" "}
                        <span className="font-medium text-gold">
                          {SANCTION_LABEL[pub.recommendedSanction] ?? pub.recommendedSanction}
                        </span>
                      </span>
                    )}
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
          )}
        </div>
      </section>
    </>
  );
}
