"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import {
  publicationPublic,
  type PublicDetail,
} from "@/lib/api/publication.service";
import { ApiError } from "@/lib/api/client";
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

export default function PublikasiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [pub, setPub] = useState<PublicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    publicationPublic
      .detail(slug)
      .then((d) => active && setPub(d))
      .catch((e) => {
        if (active && e instanceof ApiError && e.status === 404) setNotFound(true);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <main className="flex-1 bg-ivory">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <Link
          href="/publikasi"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-steel-deep"
        >
          <ArrowLeft className="size-4" /> Kembali ke Transparansi
        </Link>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="size-7 animate-spin text-steel-deep" aria-hidden />
          </div>
        ) : notFound || !pub ? (
          <div className="mt-16 rounded-2xl border border-steel/20 bg-surface p-10 text-center shadow-sm">
            <p className="font-semibold text-steel-ink">Publikasi tidak ditemukan</p>
          </div>
        ) : (
          <article className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              {pub.category && (
                <span className="rounded-full bg-amber/15 px-3 py-1 text-xs font-semibold text-ochre">
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
              <span className="text-xs text-ink-muted">{formatDate(pub.publishedAt)}</span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold text-steel-ink sm:text-4xl">
              {pub.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">{pub.summary}</p>

            {pub.content && (
              <div className="mt-8 border-t border-canvas-line pt-8">
                <p className="leading-relaxed whitespace-pre-line text-ink">
                  {pub.content}
                </p>
              </div>
            )}

            <dl className="mt-8 grid gap-4 rounded-2xl border border-steel/20 bg-surface p-6 shadow-sm sm:grid-cols-2">
              {pub.reportedCandidate && (
                <div>
                  <dt className="text-xs tracking-wide text-ink-muted uppercase">Terlapor</dt>
                  <dd className="mt-1 font-medium text-steel-ink">{pub.reportedCandidate}</dd>
                </div>
              )}
              {pub.recommendedSanction && (
                <div>
                  <dt className="text-xs tracking-wide text-ink-muted uppercase">Sanksi</dt>
                  <dd className="mt-1 font-medium text-ochre">
                    {SANCTION_LABEL[pub.recommendedSanction] ?? pub.recommendedSanction}
                  </dd>
                </div>
              )}
            </dl>

            {pub.instagramUrl && (
              <a
                href={pub.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-steel/40 px-5 py-2.5 text-sm font-semibold text-steel-deep hover:bg-amber/15"
              >
                Lihat di Instagram <ExternalLink className="size-4" aria-hidden />
              </a>
            )}
          </article>
        )}
      </div>
    </main>
  );
}
