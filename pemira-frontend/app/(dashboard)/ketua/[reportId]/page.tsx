"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, Gavel, Loader2, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/domain/report/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approvalService,
  investigationService,
  ApiError,
  SANCTION_LABEL,
  STAGE_LABEL,
  type ReportDetail,
} from "@/lib/api/investigation.service";
import { REPORT_CATEGORY_LABEL } from "@/lib/types/report.types";
import { useAuthStore } from "@/store/auth.store";

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-sm text-ink-muted">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export default function KetuaDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const id = Number(reportId);
  const allowed = useAuthStore((s) => s.user?.roles.includes("KETUA_KP") ?? false);

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
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
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      await approvalService.approve(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyetujui.");
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    if (reason.trim().length < 30) return;
    setBusy(true);
    setError(null);
    try {
      await approvalService.reject(id, reason);
      setRejecting(false);
      setReason("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menolak.");
    } finally {
      setBusy(false);
    }
  }

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-canvas-line bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-ink">Akses ditolak</p>
        <p className="mt-2 text-sm text-ink-muted">Halaman ini khusus Ketua Komite Pengawasan.</p>
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
  if (notFound || !report) {
    return (
      <div className="rounded-2xl border border-canvas-line bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-ink">Laporan tidak ditemukan</p>
        <Link href="/ketua" className="mt-3 inline-block text-sm text-primary hover:underline">
          ← Kembali
        </Link>
      </div>
    );
  }

  const inv = report.investigation;
  const canDecide = report.status === "MENUNGGU_PERSETUJUAN_KETUA";

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/ketua"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Kembali
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold text-primary">{report.ticketCode}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{report.title}</h1>
        </div>
        <StatusBadge status={report.status} />
      </div>

      {/* Ringkasan laporan */}
      <div className="mt-8 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
        <dl className="space-y-4">
          <InfoRow label="Kategori">{REPORT_CATEGORY_LABEL[report.category]}</InfoRow>
          <InfoRow label="Kandidat terlapor">
            {report.reportedCandidate ?? <span className="text-ink-muted">—</span>}
          </InfoRow>
        </dl>
        <div className="mt-6 border-t border-black/10 pt-6">
          <p className="mb-2 text-sm font-semibold text-ink">Kronologi Laporan</p>
          <p className="text-sm leading-relaxed whitespace-pre-line text-ink">
            {report.description}
          </p>
        </div>
      </div>

      {/* Tahapan investigasi yang telah dilalui */}
      {inv && inv.stageLog.length > 0 && (
        <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-ink">Tahapan Investigasi</p>
          <ol className="mt-4 space-y-3">
            {inv.stageLog.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{STAGE_LABEL[s.stage]}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Laporan investigasi resmi */}
      {inv?.findings && (
        <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <FileText className="size-4 text-primary" /> Laporan Investigasi
          </p>
          <div className="mt-3">
            {inv.verdict === "VALID" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                <CheckCircle2 className="size-3.5" /> Kesimpulan Hukum: Terbukti
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
                <XCircle className="size-3.5" /> Kesimpulan Hukum: Tidak Terbukti
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Temuan &amp; dasar hukum
            </p>
            <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-ink">
              {inv.findings}
            </p>
          </div>
          <p className="mt-4 border-t border-black/10 pt-4 text-sm text-ink-muted">
            Rekomendasi sanksi:{" "}
            <span className="font-semibold text-primary">
              {SANCTION_LABEL[inv.recommendedSanction ?? ""] ?? inv.recommendedSanction}
            </span>
          </p>
        </div>
      )}

      {/* Keputusan */}
      {canDecide ? (
        <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Gavel className="size-4 text-primary" /> Keputusan Ketua
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Keputusan tercatat permanen dan diteruskan ke divisi Publikasi bila disetujui.
          </p>

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}

          {!rejecting ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={approve}
                disabled={busy}
                className="h-11 rounded-full bg-success px-6 font-semibold text-ink-inverse hover:bg-success/90 disabled:opacity-60"
              >
                {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                <CheckCircle2 className="mr-1.5 size-4" /> Setujui
              </Button>
              <Button
                onClick={() => setRejecting(true)}
                disabled={busy}
                variant="outline"
                className="h-11 rounded-full border-danger/40 bg-transparent px-6 font-semibold text-danger hover:bg-danger/10 hover:text-danger"
              >
                <XCircle className="mr-1.5 size-4" /> Tolak
              </Button>
            </div>
          ) : (
            <div className="mt-5">
              <label htmlFor="reason" className="text-sm font-medium text-ink">
                Alasan penolakan <span className="text-ink-muted">(min. 30 karakter)</span>
              </label>
              <Textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jelaskan mengapa laporan ini ditolak agar investigator dapat merevisi."
                className="mt-1.5 resize-y border-black/15"
              />
              <p className="mt-1 text-xs text-ink-muted">{reason.length} karakter</p>
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={reject}
                  disabled={busy || reason.trim().length < 30}
                  className="h-11 rounded-full bg-danger px-6 font-semibold text-ink-inverse hover:bg-danger/90 disabled:opacity-60"
                >
                  {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Konfirmasi Penolakan
                </Button>
                <Button
                  onClick={() => {
                    setRejecting(false);
                    setReason("");
                  }}
                  disabled={busy}
                  variant="outline"
                  className="h-11 rounded-full border-black/15 bg-transparent px-6 font-semibold text-ink-muted hover:bg-black/5"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 text-sm text-ink-muted shadow-sm">
          Laporan ini sudah berstatus{" "}
          <span className="font-semibold text-ink">
            <StatusBadge status={report.status} />
          </span>{" "}
          dan tidak menunggu keputusan lagi.
        </div>
      )}
    </div>
  );
}
