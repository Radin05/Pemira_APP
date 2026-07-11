"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Inbox } from "lucide-react";
import { StatusBadge } from "@/components/domain/report/status-badge";
import { investigationService, type ReportSummary } from "@/lib/api/investigation.service";
import {
  REPORT_CATEGORY_LABEL,
  REPORT_STATUS_LABEL,
  type ReportStatus,
} from "@/lib/types/report.types";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; status?: ReportStatus }[] = [
  { label: "Perlu Ditangani", status: "DITERIMA" },
  { label: "Sedang Diverifikasi", status: "DIVERIFIKASI" },
  { label: "Terbukti Valid", status: "VALID" },
  { label: "Tidak Terbukti", status: "HOAX" },
  { label: "Semua", status: undefined },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function HukumSekretariatPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [activeFilter, setActiveFilter] = useState(0);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allowed = user?.roles.includes("HUKUM_SEKRETARIAT") ?? false;

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
    // Tunda ke macrotask agar setState di dalam load tidak dianggap sinkron di
    // effect (aturan React compiler: cegah cascading render).
    if (!allowed) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [allowed, load]);

  async function claim(id: number) {
    setClaimingId(id);
    try {
      await investigationService.claim(id);
      router.push(`/hukum-sekretariat/${id}`);
    } catch {
      setError("Gagal mengambil laporan. Mungkin sudah ditangani orang lain.");
      setClaimingId(null);
      load();
    }
  }

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
        <p className="font-semibold text-ink">Akses ditolak</p>
        <p className="mt-2 text-sm text-ink-muted">
          Halaman ini khusus divisi Hukum &amp; Sekretariat.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-page-title text-ink">Antrean Laporan</h1>
      <p className="mt-2 text-ink-muted">
        Ambil laporan untuk diinvestigasi, lalu tetapkan hasil cross-check.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f, i) => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(i)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeFilter === i
                ? "bg-primary text-ink-inverse"
                : "bg-black/5 text-ink-muted hover:bg-black/10",
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

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Inbox className="size-10 text-ink-muted/50" aria-hidden />
            <p className="mt-3 text-sm text-ink-muted">Tidak ada laporan pada kategori ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/10 bg-black/[0.02] text-xs tracking-wide text-ink-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tiket</th>
                  <th className="px-5 py-3 font-semibold">Judul</th>
                  <th className="px-5 py-3 font-semibold">Kategori</th>
                  <th className="px-5 py-3 font-semibold">Kejadian</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
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
                        href={`/hukum-sekretariat/${r.id}`}
                        className="font-medium text-ink hover:text-primary hover:underline"
                      >
                        {r.title}
                      </Link>
                      {r.anonymous && (
                        <span className="ml-2 rounded bg-black/5 px-1.5 py-0.5 text-[0.65rem] text-ink-muted">
                          Anonim
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {REPORT_CATEGORY_LABEL[r.category]}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{formatDate(r.incidentDate)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {r.status === "DITERIMA" ? (
                        <button
                          onClick={() => claim(r.id)}
                          disabled={claimingId === r.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-navy-dark hover:bg-gold-light disabled:opacity-60"
                        >
                          {claimingId === r.id && <Loader2 className="size-3 animate-spin" />}
                          Ambil
                        </button>
                      ) : (
                        <Link
                          href={`/hukum-sekretariat/${r.id}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Lihat detail
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reports.length > 0 && (
        <p className="mt-3 text-xs text-ink-muted">
          Menampilkan {reports.length} laporan berstatus{" "}
          {FILTERS[activeFilter].status
            ? REPORT_STATUS_LABEL[FILTERS[activeFilter].status]
            : "semua"}
          .
        </p>
      )}
    </div>
  );
}
