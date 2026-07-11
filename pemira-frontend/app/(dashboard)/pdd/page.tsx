"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, Loader2, Megaphone } from "lucide-react";
import {
  publicationAdmin,
  type PublicationAdminItem,
  type ReadyReport,
} from "@/lib/api/publication.service";
import { REPORT_CATEGORY_LABEL } from "@/lib/types/report.types";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-black/5 text-ink-muted",
  PUBLISHED: "bg-success/10 text-success",
  WITHDRAWN: "bg-danger/10 text-danger",
};
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Terbit",
  WITHDRAWN: "Ditarik",
};

export default function PddPage() {
  const allowed = useAuthStore((s) => s.user?.roles.includes("PDD") ?? false);
  const [ready, setReady] = useState<ReadyReport[]>([]);
  const [published, setPublished] = useState<PublicationAdminItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([publicationAdmin.ready(), publicationAdmin.list()]);
      setReady(r);
      setPublished(p);
    } catch {
      // diabaikan; UI menampilkan kosong
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [allowed, load]);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-canvas-line bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-ink">Akses ditolak</p>
        <p className="mt-2 text-sm text-ink-muted">Halaman ini khusus divisi PDD.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-page-title text-ink">Publikasi</h1>
      <p className="mt-2 text-ink-muted">
        Susun dan terbitkan putusan yang telah disetujui Ketua ke halaman Transparansi.
      </p>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
        </div>
      ) : (
        <>
          {/* Siap dipublikasikan */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-ink-muted uppercase">
              <CheckCircle2 className="size-4 text-success" /> Siap Dipublikasikan ({ready.length})
            </h2>
            {ready.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-canvas-line bg-white p-6 text-sm text-ink-muted shadow-sm">
                Belum ada laporan yang disetujui dan menunggu publikasi.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {ready.map((r) => (
                  <li
                    key={r.reportId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-canvas-line bg-white p-5 shadow-sm"
                  >
                    <div>
                      <p className="font-mono text-xs font-semibold text-primary">
                        {r.ticketCode}
                      </p>
                      <p className="mt-1 font-semibold text-ink">{r.reportTitle}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {REPORT_CATEGORY_LABEL[r.category]} ·{" "}
                        {r.conclusion === "VALID" ? "Terbukti" : "Tidak Terbukti"}
                        {r.hasDraft && " · sudah ada draft"}
                      </p>
                    </div>
                    <Link
                      href={`/pdd/${r.reportId}`}
                      className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy-dark hover:bg-gold-light"
                    >
                      {r.hasDraft ? "Lanjutkan" : "Susun Publikasi"}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Publikasi tersimpan */}
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-ink-muted uppercase">
              <Megaphone className="size-4 text-primary" /> Publikasi ({published.length})
            </h2>
            {published.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-canvas-line bg-white p-6 text-sm text-ink-muted shadow-sm">
                Belum ada publikasi tersimpan.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {published.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-canvas-line bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-primary" aria-hidden />
                      <div>
                        <p className="font-semibold text-ink">{p.title}</p>
                        <p className="mt-0.5 font-mono text-xs text-ink-muted">/{p.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          STATUS_STYLE[p.status],
                        )}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                      <Link
                        href={`/pdd/${p.reportId}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Kelola
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
