"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleDot, Loader2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/domain/report/status-badge";
import { reportService, type TrackResult } from "@/lib/api/report.service";
import { REPORT_STATUS_LABEL } from "@/lib/types/report.types";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${hh}:${mm}`;
}

const inputClass =
  "border-white/15 bg-white/[0.03] text-ink-inverse placeholder:text-ink-inverse/40 focus-visible:border-gold";

export function StatusTracker() {
  const searchParams = useSearchParams();
  // Prefill kode tiket dari query (?ticket=) sekali, saat datang dari halaman sukses.
  const [ticket, setTicket] = useState(() => searchParams.get("ticket") ?? "");
  const [npm, setNpm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setResult(null);
    const found = await reportService.track(ticket, npm);
    if (found) setResult(found);
    else setNotFound(true);
    setLoading(false);
  }

  return (
    <div>
      <form
        onSubmit={onSearch}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="ticket" className="text-sm font-medium text-ink-inverse">
              Kode tiket
            </Label>
            <Input
              id="ticket"
              value={ticket}
              onChange={(e) => setTicket(e.target.value.toUpperCase())}
              placeholder="PMR-2025-XXXXX"
              className={cn("mt-1.5", inputClass)}
            />
          </div>
          <div>
            <Label htmlFor="npm" className="text-sm font-medium text-ink-inverse">
              NPM pelapor
            </Label>
            <Input
              id="npm"
              inputMode="numeric"
              value={npm}
              onChange={(e) => setNpm(e.target.value)}
              placeholder="Untuk verifikasi kepemilikan"
              className={cn("mt-1.5", inputClass)}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading || !ticket || !npm}
          className="mt-6 h-11 rounded-full bg-gold px-6 font-semibold text-navy-dark hover:bg-gold-light disabled:opacity-60"
        >
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {loading ? "Mencari…" : "Lacak Laporan"}
        </Button>
      </form>

      {notFound && (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <SearchX className="size-10 text-ink-inverse/40" aria-hidden />
          <p className="mt-4 font-semibold text-ink-inverse">Laporan tidak ditemukan</p>
          <p className="mt-2 max-w-sm text-sm text-ink-inverse/60">
            Pastikan kode tiket dan NPM sesuai dengan yang Anda gunakan saat melapor.
          </p>
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs tracking-wide text-ink-inverse/50 uppercase">Kode tiket</p>
              <p className="mt-1 text-lg font-bold tracking-wider text-gold">
                {result.ticketCode}
              </p>
            </div>
            <StatusBadge status={result.currentStatus} />
          </div>

          <ol className="relative mt-6">
            {result.timeline.map((entry, index) => {
              const isLast = index === result.timeline.length - 1;
              return (
                <li key={index} className="relative flex gap-5 pb-8 last:pb-0">
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute top-6 bottom-0 left-[0.6875rem] w-px bg-white/15"
                    />
                  )}
                  <span className="relative z-10 mt-0.5 shrink-0 rounded-full bg-white/[0.03]">
                    <CircleDot
                      className={cn("size-6", isLast ? "text-gold" : "text-success")}
                      aria-hidden
                    />
                  </span>
                  <div>
                    <p className="font-semibold text-ink-inverse">
                      {REPORT_STATUS_LABEL[entry.status]}
                    </p>
                    <p className="mt-1 text-xs text-ink-inverse/50">
                      {formatDateTime(entry.at)}
                    </p>
                    {entry.note && (
                      <p className="mt-2 text-sm text-ink-inverse/65">{entry.note}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 border-t border-white/10 pt-5 text-xs leading-relaxed text-ink-inverse/50">
            Demi menjaga proses, hanya status dan tanggal yang ditampilkan. Isi laporan dan
            hasil investigasi tidak dibuka ke publik sebelum diputuskan dan dipublikasikan.
          </p>
        </div>
      )}
    </div>
  );
}
