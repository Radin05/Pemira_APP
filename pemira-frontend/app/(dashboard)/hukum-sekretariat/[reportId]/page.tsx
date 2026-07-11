"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/domain/report/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  investigationService,
  ApiError,
  type ReportDetail,
} from "@/lib/api/investigation.service";
import { REPORT_CATEGORY_LABEL, REPORT_STATUS_LABEL } from "@/lib/types/report.types";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-sm text-ink-muted">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const id = Number(reportId);
  const user = useAuthStore((s) => s.user);

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [verdict, setVerdict] = useState<"VALID" | "HOAX" | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReport(await investigationService.detail(id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setError("Gagal memuat detail laporan.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Tunda ke macrotask (aturan React compiler: cegah setState sinkron di effect).
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function submitVerdict() {
    if (!verdict) return;
    setSubmitting(true);
    setError(null);
    try {
      await investigationService.setVerdict(id, verdict, note);
      setVerdict(null);
      setNote("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan hasil.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }
  if (notFound || !report) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
        <p className="font-semibold text-ink">Laporan tidak ditemukan</p>
        <Link href="/hukum-sekretariat" className="mt-3 inline-block text-sm text-primary hover:underline">
          ← Kembali ke antrean
        </Link>
      </div>
    );
  }

  const isAssignee = report.assigneeId != null && report.assigneeId === user?.id;
  const canVerdict = report.status === "DIVERIFIKASI" && isAssignee;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/hukum-sekretariat"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Kembali ke antrean
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold text-primary">{report.ticketCode}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{report.title}</h1>
        </div>
        <StatusBadge status={report.status} />
      </div>

      {/* Info laporan */}
      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <dl className="space-y-4">
          <InfoRow label="Kategori">{REPORT_CATEGORY_LABEL[report.category]}</InfoRow>
          <InfoRow label="Tanggal kejadian">
            {new Date(report.incidentDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </InfoRow>
          <InfoRow label="Lokasi">{report.incidentLocation}</InfoRow>
          <InfoRow label="Kandidat terlapor">
            {report.reportedCandidate ?? <span className="text-ink-muted">—</span>}
          </InfoRow>
          <InfoRow label="Pelapor">
            {report.anonymous ? (
              <span className="inline-flex items-center gap-1.5 text-ink-muted">
                <ShieldAlert className="size-4" /> Anonim (identitas dilindungi)
              </span>
            ) : (
              <span className="text-ink-muted">Identitas tercatat terenkripsi</span>
            )}
          </InfoRow>
        </dl>

        <div className="mt-6 border-t border-black/10 pt-6">
          <p className="mb-2 text-sm font-semibold text-ink">Kronologi</p>
          <p className="text-sm leading-relaxed whitespace-pre-line text-ink">
            {report.description}
          </p>
        </div>
      </div>

      {/* Bukti */}
      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <p className="text-sm font-semibold text-ink">Bukti Lampiran ({report.evidences.length})</p>
        {report.evidences.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Tidak ada bukti dilampirkan.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {report.evidences.map((e) => (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-lg border border-black/10 p-3"
              >
                <FileText className="size-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{e.originalFilename}</p>
                  <p className="truncate font-mono text-[0.7rem] text-ink-muted">
                    SHA-256: {e.checksumSha256}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-ink-muted">{fmtSize(e.sizeBytes)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Hasil investigasi (bila sudah ada) */}
      {report.investigation?.verdict && (
        <div
          className={cn(
            "mt-6 rounded-2xl border p-6",
            report.investigation.verdict === "VALID"
              ? "border-success/40 bg-success/5"
              : "border-danger/40 bg-danger/5",
          )}
        >
          <p className="flex items-center gap-2 font-semibold text-ink">
            {report.investigation.verdict === "VALID" ? (
              <CheckCircle2 className="size-5 text-success" />
            ) : (
              <XCircle className="size-5 text-danger" />
            )}
            Hasil: {report.investigation.verdict === "VALID" ? "Terbukti Valid" : "Tidak Terbukti"}
          </p>
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink">
            {report.investigation.crossCheckNote}
          </p>
        </div>
      )}

      {/* Form verdict */}
      {canVerdict && !report.investigation?.verdict && (
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
          <p className="text-sm font-semibold text-ink">Tetapkan Hasil Cross-check</p>
          <p className="mt-1 text-xs text-ink-muted">
            Keputusan tercatat permanen di riwayat laporan.
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setVerdict("VALID")}
              className={cn(
                "flex-1 rounded-xl border-2 p-4 text-left transition-colors",
                verdict === "VALID"
                  ? "border-success bg-success/10"
                  : "border-black/10 hover:border-success/50",
              )}
            >
              <CheckCircle2 className="size-5 text-success" />
              <p className="mt-2 font-semibold text-ink">Terbukti Valid</p>
              <p className="text-xs text-ink-muted">Pelanggaran terbukti dari bukti</p>
            </button>
            <button
              type="button"
              onClick={() => setVerdict("HOAX")}
              className={cn(
                "flex-1 rounded-xl border-2 p-4 text-left transition-colors",
                verdict === "HOAX"
                  ? "border-danger bg-danger/10"
                  : "border-black/10 hover:border-danger/50",
              )}
            >
              <XCircle className="size-5 text-danger" />
              <p className="mt-2 font-semibold text-ink">Tidak Terbukti</p>
              <p className="text-xs text-ink-muted">Bukti tidak mendukung laporan</p>
            </button>
          </div>

          <div className="mt-5">
            <label htmlFor="note" className="text-sm font-medium text-ink">
              Catatan temuan <span className="text-ink-muted">(min. 50 karakter)</span>
            </label>
            <Textarea
              id="note"
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Jelaskan proses cross-check dan dasar keputusan Anda."
              className="mt-1.5 resize-y border-black/15"
            />
            <p className="mt-1 text-xs text-ink-muted">{note.length} karakter</p>
          </div>

          {error && <p className="mt-3 text-sm text-danger">{error}</p>}

          <Button
            onClick={submitVerdict}
            disabled={submitting || !verdict || note.trim().length < 50}
            className="mt-4 h-11 rounded-full bg-primary px-6 font-semibold text-ink-inverse hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Simpan Hasil
          </Button>
        </div>
      )}

      {report.status === "DIVERIFIKASI" && !isAssignee && (
        <p className="mt-6 rounded-lg border border-black/10 bg-black/[0.02] p-4 text-sm text-ink-muted">
          Laporan ini sedang ditangani investigator lain.
        </p>
      )}

      {/* Riwayat status */}
      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <p className="text-sm font-semibold text-ink">Riwayat Status</p>
        <ol className="mt-4 space-y-4">
          {report.history.map((h, i) => (
            <li key={i} className="flex gap-4">
              <div className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium text-ink">
                  {REPORT_STATUS_LABEL[h.toStatus]}
                </p>
                <p className="text-xs text-ink-muted">{formatDateTime(h.createdAt)}</p>
                {h.note && <p className="mt-1 text-sm text-ink-muted">{h.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
