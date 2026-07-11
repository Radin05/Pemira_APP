"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CircleDot,
  FileText,
  Gavel,
  Loader2,
  Send,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/domain/report/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  investigationService,
  ApiError,
  INVESTIGATION_STAGES,
  STAGE_LABEL,
  STAGE_HINT,
  SANCTION_OPTIONS,
  SANCTION_LABEL,
  type InvestigationStage,
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
  const [error, setError] = useState<string | null>(null);

  const [stageNote, setStageNote] = useState("");
  const [advancing, setAdvancing] = useState(false);

  const [findings, setFindings] = useState("");
  const [conclusion, setConclusion] = useState<"VALID" | "HOAX" | "">("");
  const [sanction, setSanction] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

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

  async function advanceStage() {
    if (stageNote.trim().length < 20) return;
    setAdvancing(true);
    setError(null);
    try {
      await investigationService.advanceStage(id, stageNote);
      setStageNote("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan tahap.");
    } finally {
      setAdvancing(false);
    }
  }

  async function submitReport() {
    if (findings.trim().length < 50 || !conclusion || !sanction) return;
    setSubmittingReport(true);
    setError(null);
    try {
      await investigationService.submitToChief(id, findings, conclusion, sanction);
      setFindings("");
      setConclusion("");
      setSanction("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengirim laporan.");
    } finally {
      setSubmittingReport(false);
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
      <div className="rounded-2xl border border-canvas-line bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-ink">Laporan tidak ditemukan</p>
        <Link
          href="/hukum-sekretariat"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          ← Kembali ke antrean
        </Link>
      </div>
    );
  }

  const inv = report.investigation;
  const isAssignee = report.assigneeId != null && report.assigneeId === user?.id;
  const isInvestigating = report.status === "DIVERIFIKASI";
  const doneStages = new Set((inv?.stageLog ?? []).map((s) => s.stage));
  const currentStage: InvestigationStage | null = inv?.stagesCompleted ? null : (inv?.stage ?? null);
  const canAdvance = isInvestigating && isAssignee && !inv?.stagesCompleted;
  const canSubmitReport =
    isInvestigating && isAssignee && (inv?.stagesCompleted ?? false) && !inv?.submittedToChiefAt;

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
      <div className="mt-8 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
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
      <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">
          Bukti Lampiran ({report.evidences.length})
        </p>
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

      {/* Tahapan investigasi */}
      {inv && (
        <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-ink">Tahapan Investigasi</p>
          <p className="mt-1 text-xs text-ink-muted">
            Empat tahap wajib dilalui sebelum menyusun laporan resmi ke Ketua.
          </p>

          <ol className="mt-5 space-y-4">
            {INVESTIGATION_STAGES.map((st, i) => {
              const done = doneStages.has(st) || inv.stagesCompleted;
              const active = st === currentStage;
              const logEntry = inv.stageLog.find((s) => s.stage === st);
              return (
                <li key={st} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {done ? (
                      <CheckCircle2 className="size-6 text-success" aria-hidden />
                    ) : active ? (
                      <CircleDot className="size-6 text-gold" aria-hidden />
                    ) : (
                      <Circle className="size-6 text-ink-muted/30" aria-hidden />
                    )}
                    {i < INVESTIGATION_STAGES.length - 1 && (
                      <span
                        className={cn(
                          "mt-1 w-px flex-1",
                          done ? "bg-success/40" : "bg-black/10",
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <p
                      className={cn(
                        "font-semibold",
                        done ? "text-ink" : active ? "text-gold" : "text-ink-muted",
                      )}
                    >
                      {i + 1}. {STAGE_LABEL[st]}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">{STAGE_HINT[st]}</p>
                    {logEntry && (
                      <div className="mt-2 rounded-lg bg-canvas p-3">
                        <p className="text-sm text-ink">{logEntry.note}</p>
                        <p className="mt-1 text-[0.7rem] text-ink-muted">
                          {formatDateTime(logEntry.createdAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Form isi tahap aktif */}
          {canAdvance && currentStage && (
            <div className="mt-5 rounded-xl border border-gold/40 bg-gold/[0.06] p-4">
              <label htmlFor="stageNote" className="text-sm font-medium text-ink">
                Catatan tahap {STAGE_LABEL[currentStage]}{" "}
                <span className="text-ink-muted">(min. 20 karakter)</span>
              </label>
              <Textarea
                id="stageNote"
                rows={3}
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                placeholder={STAGE_HINT[currentStage]}
                className="mt-1.5 resize-y border-black/15 bg-white"
              />
              <Button
                onClick={advanceStage}
                disabled={advancing || stageNote.trim().length < 20}
                className="mt-3 h-10 rounded-full bg-primary px-5 text-sm font-semibold text-ink-inverse hover:bg-primary/90 disabled:opacity-60"
              >
                {advancing && <Loader2 className="mr-2 size-4 animate-spin" />}
                {currentStage === "GELAR_PERKARA"
                  ? "Selesaikan Gelar Perkara"
                  : "Selesaikan & Lanjut"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Laporan resmi tersusun (read-only) */}
      {inv?.findings && (
        <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Gavel className="size-4 text-primary" /> Laporan Resmi ke Ketua
          </p>
          <div className="mt-3 flex items-center gap-2">
            {inv.verdict === "VALID" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                <CheckCircle2 className="size-3.5" /> Kesimpulan: Terbukti
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
                <XCircle className="size-3.5" /> Kesimpulan: Tidak Terbukti
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink">
            {inv.findings}
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            Rekomendasi sanksi:{" "}
            <span className="font-semibold text-primary">
              {SANCTION_LABEL[inv.recommendedSanction ?? ""] ?? inv.recommendedSanction}
            </span>
          </p>
        </div>
      )}

      {/* Form template laporan resmi — setelah tahap selesai */}
      {canSubmitReport && (
        <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Send className="size-4 text-primary" /> Susun Laporan Resmi ke Ketua
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Seluruh tahap investigasi telah selesai. Isi template berikut, lalu ajukan ke Ketua KP.
          </p>

          <div className="mt-5">
            <label htmlFor="findings" className="text-sm font-medium text-ink">
              Temuan &amp; dasar hukum <span className="text-ink-muted">(min. 50 karakter)</span>
            </label>
            <Textarea
              id="findings"
              rows={5}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Uraikan temuan, pasal yang dilanggar, dan bukti pendukung."
              className="mt-1.5 resize-y border-black/15"
            />
            <p className="mt-1 text-xs text-ink-muted">{findings.length} karakter</p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-ink">Kesimpulan</p>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setConclusion("VALID")}
                className={cn(
                  "flex-1 rounded-xl border-2 p-3 text-left transition-colors",
                  conclusion === "VALID"
                    ? "border-success bg-success/10"
                    : "border-black/10 hover:border-success/50",
                )}
              >
                <CheckCircle2 className="size-5 text-success" />
                <p className="mt-1.5 text-sm font-semibold text-ink">Terbukti</p>
                <p className="text-xs text-ink-muted">Laporan valid, pelanggaran terbukti</p>
              </button>
              <button
                type="button"
                onClick={() => setConclusion("HOAX")}
                className={cn(
                  "flex-1 rounded-xl border-2 p-3 text-left transition-colors",
                  conclusion === "HOAX"
                    ? "border-danger bg-danger/10"
                    : "border-black/10 hover:border-danger/50",
                )}
              >
                <XCircle className="size-5 text-danger" />
                <p className="mt-1.5 text-sm font-semibold text-ink">Tidak Terbukti</p>
                <p className="text-xs text-ink-muted">Laporan palsu/hoaks</p>
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="sanction" className="text-sm font-medium text-ink">
              Rekomendasi sanksi
            </label>
            <select
              id="sanction"
              value={sanction}
              onChange={(e) => setSanction(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-md border border-black/15 bg-white px-3 text-sm text-ink"
            >
              <option value="" disabled>
                Pilih sanksi…
              </option>
              {SANCTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="mt-3 text-sm text-danger">{error}</p>}

          <Button
            onClick={submitReport}
            disabled={
              submittingReport || findings.trim().length < 50 || !conclusion || !sanction
            }
            className="mt-5 h-11 rounded-full bg-primary px-6 font-semibold text-ink-inverse hover:bg-primary/90 disabled:opacity-60"
          >
            {submittingReport && <Loader2 className="mr-2 size-4 animate-spin" />}
            Ajukan ke Ketua
          </Button>
        </div>
      )}

      {error && !canSubmitReport && !canAdvance && (
        <p className="mt-4 text-sm text-danger">{error}</p>
      )}

      {report.status === "DIVERIFIKASI" && !isAssignee && (
        <p className="mt-6 rounded-lg border border-canvas-line bg-white p-4 text-sm text-ink-muted shadow-sm">
          Laporan ini sedang ditangani investigator lain.
        </p>
      )}

      {/* Riwayat status */}
      <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">Riwayat Status</p>
        <ol className="mt-4 space-y-4">
          {report.history.map((h, i) => (
            <li key={i} className="flex gap-4">
              <div className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium text-ink">{REPORT_STATUS_LABEL[h.toStatus]}</p>
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
