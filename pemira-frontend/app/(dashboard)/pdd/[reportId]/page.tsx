"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, Megaphone, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  publicationAdmin,
  type PublicationAdminItem,
  type ReadyReport,
} from "@/lib/api/publication.service";
import { ApiError } from "@/lib/api/client";
import { REPORT_CATEGORY_LABEL } from "@/lib/types/report.types";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

export default function PddComposePage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const id = Number(reportId);
  const allowed = useAuthStore((s) => s.user?.roles.includes("PDD") ?? false);

  const [report, setReport] = useState<ReadyReport | null>(null);
  const [pub, setPub] = useState<PublicationAdminItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const [withdrawing, setWithdrawing] = useState(false);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, list] = await Promise.all([
        publicationAdmin.readyOne(id),
        publicationAdmin.list(),
      ]);
      setReport(r);
      const existing = list.find((p) => p.reportId === id) ?? null;
      setPub(existing);
      // Prefill sekali (hanya bila field masih kosong).
      setTitle((t) => t || r.reportTitle);
      setContent((c) => c || (r.findings ?? ""));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!allowed) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [allowed, load]);

  async function save(publish: boolean) {
    if (title.trim().length < 10 || summary.trim().length < 20) {
      setError("Judul minimal 10 karakter dan ringkasan minimal 20 karakter.");
      return;
    }
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await publicationAdmin.save(id, { title, summary, content, instagramUrl, publish });
      setOk(publish ? "Publikasi diterbitkan." : "Draft tersimpan.");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    if (!pub || reason.trim().length < 20) return;
    setBusy(true);
    setError(null);
    try {
      await publicationAdmin.withdraw(pub.id, reason);
      setOk("Publikasi ditarik.");
      setWithdrawing(false);
      setReason("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menarik publikasi.");
    } finally {
      setBusy(false);
    }
  }

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-canvas-line bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-ink">Akses ditolak</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }
  if (!report) {
    return (
      <div className="rounded-2xl border border-canvas-line bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-ink">{error ?? "Laporan tidak ditemukan"}</p>
        <Link href="/pdd" className="mt-3 inline-block text-sm text-primary hover:underline">
          ← Kembali
        </Link>
      </div>
    );
  }

  const isPublished = pub?.status === "PUBLISHED";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/pdd" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" /> Kembali
      </Link>

      <div className="mt-4">
        <p className="font-mono text-sm font-semibold text-primary">{report.ticketCode}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Susun Publikasi</h1>
      </div>

      {/* Konteks laporan */}
      <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Ringkasan hasil investigasi
        </p>
        <p className="mt-2 text-sm text-ink">
          <span className="text-ink-muted">Kategori:</span> {REPORT_CATEGORY_LABEL[report.category]} ·{" "}
          <span className="text-ink-muted">Kesimpulan:</span>{" "}
          {report.conclusion === "VALID" ? "Terbukti" : "Tidak Terbukti"}
        </p>
        {report.findings && (
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-muted">
            {report.findings}
          </p>
        )}
      </div>

      {ok && (
        <p className="mt-4 rounded-lg border border-success/40 bg-success/5 p-3 text-sm text-success">
          {ok}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {isPublished ? (
        <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
          <p className="flex items-center gap-2 font-semibold text-success">
            <Megaphone className="size-5" /> Sudah Terbit
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Publikasi ini tampil di halaman Transparansi publik.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`/publikasi/${pub?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Lihat publik <ExternalLink className="size-3.5" />
            </a>
            {!withdrawing ? (
              <Button
                onClick={() => setWithdrawing(true)}
                variant="outline"
                className="h-10 rounded-full border-danger/40 bg-transparent px-5 text-sm font-semibold text-danger hover:bg-danger/10 hover:text-danger"
              >
                <Undo2 className="mr-1.5 size-4" /> Tarik Publikasi
              </Button>
            ) : null}
          </div>

          {withdrawing && (
            <div className="mt-5">
              <label htmlFor="reason" className="text-sm font-medium text-ink">
                Alasan penarikan <span className="text-ink-muted">(min. 20 karakter)</span>
              </label>
              <Textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5 resize-y border-black/15"
              />
              <div className="mt-3 flex gap-3">
                <Button
                  onClick={withdraw}
                  disabled={busy || reason.trim().length < 20}
                  className="h-10 rounded-full bg-danger px-5 text-sm font-semibold text-ink-inverse hover:bg-danger/90 disabled:opacity-60"
                >
                  {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Konfirmasi Tarik
                </Button>
                <Button
                  onClick={() => setWithdrawing(false)}
                  variant="outline"
                  className="h-10 rounded-full border-black/15 bg-transparent px-5 text-sm font-semibold text-ink-muted hover:bg-black/5"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="text-sm font-medium text-ink">
                Judul publikasi
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 border-black/15"
              />
            </div>
            <div>
              <label htmlFor="summary" className="text-sm font-medium text-ink">
                Ringkasan <span className="text-ink-muted">(tampil di feed)</span>
              </label>
              <Textarea
                id="summary"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Ringkasan singkat putusan untuk ditampilkan di halaman Transparansi."
                className="mt-1.5 resize-y border-black/15"
              />
            </div>
            <div>
              <label htmlFor="content" className="text-sm font-medium text-ink">
                Isi lengkap <span className="text-ink-muted">(opsional)</span>
              </label>
              <Textarea
                id="content"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1.5 resize-y border-black/15"
              />
            </div>
            <div>
              <label htmlFor="ig" className="text-sm font-medium text-ink">
                Tautan Instagram <span className="text-ink-muted">(opsional)</span>
              </label>
              <Input
                id="ig"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/p/…"
                className="mt-1.5 border-black/15"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-black/10 pt-5">
            <Button
              onClick={() => save(true)}
              disabled={busy}
              className={cn(
                "h-11 rounded-full bg-primary px-6 font-semibold text-ink-inverse hover:bg-primary/90 disabled:opacity-60",
              )}
            >
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
              <Megaphone className="mr-1.5 size-4" /> Terbitkan
            </Button>
            <Button
              onClick={() => save(false)}
              disabled={busy}
              variant="outline"
              className="h-11 rounded-full border-black/15 bg-transparent px-6 font-semibold text-ink-muted hover:bg-black/5"
            >
              Simpan Draft
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
