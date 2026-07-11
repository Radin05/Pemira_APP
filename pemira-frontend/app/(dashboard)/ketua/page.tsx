"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Gavel, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/domain/report/status-badge";
import { investigationService, type ReportSummary } from "@/lib/api/investigation.service";
import {
  REPORT_CATEGORY_LABEL,
  REPORT_STATUS_LABEL,
  type ReportStatus,
} from "@/lib/types/report.types";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; status: ReportStatus }[] = [
  { label: "Menunggu Keputusan", status: "MENUNGGU_PERSETUJUAN_KETUA" },
  { label: "Disetujui", status: "DISETUJUI" },
  { label: "Ditolak", status: "DITOLAK" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function KetuaPage() {
  const user = useAuthStore((s) => s.user);
  const [activeFilter, setActiveFilter] = useState(0);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allowed = user?.roles.includes("KETUA_KP") ?? false;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await investigationService.list({ status: FILTERS[activeFilter].status });
      setReports(res.content);
    } catch {
      setError("Gagal memuat daftar laporan.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (!allowed) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [allowed, load]);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-canvas-line bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-ink">Akses ditolak</p>
        <p className="mt-2 text-sm text-ink-muted">Halaman ini khusus Ketua Komite Pengawasan.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-page-title text-ink">Persetujuan Laporan</h1>
      <p className="mt-2 text-ink-muted">
        Tinjau laporan investigasi yang diajukan, lalu setujui atau tolak dengan alasan.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f, i) => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(i)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeFilter === i
                ? "bg-primary text-ink-inverse shadow-sm"
                : "border border-canvas-line bg-white text-ink-muted hover:border-primary/40 hover:text-primary",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-canvas-line bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-canvas">
              <Gavel className="size-7 text-primary/50" aria-hidden />
            </span>
            <p className="mt-4 font-medium text-ink">Tidak ada laporan</p>
            <p className="mt-1 text-sm text-ink-muted">
              Belum ada laporan berstatus {REPORT_STATUS_LABEL[FILTERS[activeFilter].status]}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/10 bg-black/[0.02] text-xs tracking-wide text-ink-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tiket</th>
                  <th className="px-5 py-3 font-semibold">Judul</th>
                  <th className="px-5 py-3 font-semibold">Kategori</th>
                  <th className="px-5 py-3 font-semibold">Diajukan</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-black/[0.015]">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">
                      {r.ticketCode}
                    </td>
                    <td className="max-w-xs px-5 py-4">
                      <Link
                        href={`/ketua/${r.id}`}
                        className="font-medium text-ink hover:text-primary hover:underline"
                      >
                        {r.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {REPORT_CATEGORY_LABEL[r.category]}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{formatDate(r.submittedAt)}</td>
                    <td className="px-5 py-4 text-right">
                      {r.status === "MENUNGGU_PERSETUJUAN_KETUA" ? (
                        <Link
                          href={`/ketua/${r.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-navy-dark hover:bg-gold-light"
                        >
                          Tinjau
                        </Link>
                      ) : (
                        <span className="inline-block">
                          <StatusBadge status={r.status} />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
