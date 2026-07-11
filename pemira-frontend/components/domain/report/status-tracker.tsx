"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CircleDot, Loader2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/10">
          <div className="flex flex-col gap-5 border-b border-white/10 bg-white/[0.025] p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-ink-inverse/45 uppercase">
                Kode tiket
              </p>
              <p className="mt-2 break-all text-2xl font-extrabold tracking-wider text-gold sm:text-3xl">
                {result.ticketCode}
              </p>
              <p className="mt-2 text-sm text-ink-inverse/55">
                Simpan kode ini bersama NPM yang digunakan saat mengirim laporan.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold">
              <CheckCircle2 className="size-4" aria-hidden />
              {REPORT_STATUS_LABEL[result.currentStatus]}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-5">
              <h3 className="text-sm font-bold tracking-wide text-ink-inverse uppercase">
                Riwayat penanganan
              </h3>
            </div>

            <ol className="space-y-4">
              {result.timeline.map((entry, index) => {
                const isLast = index === result.timeline.length - 1;
                return (
                  <li
                    key={index}
                    className={cn(
                      "rounded-2xl border p-4",
                      isLast
                        ? "border-gold/30 bg-gold/[0.08]"
                        : "border-white/10 bg-white/[0.025]",
                    )}
                  >
                    <div className="flex gap-4">
                      <span
                        className={cn(
                          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border",
                          isLast
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : "border-success/30 bg-success/10 text-success",
                        )}
                      >
                        <CircleDot className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="font-semibold text-ink-inverse">
                            {REPORT_STATUS_LABEL[entry.status]}
                          </p>
                          <p className="text-xs font-medium text-ink-inverse/45">
                            {formatDateTime(entry.at)}
                          </p>
                        </div>
                        {entry.note && (
                          <p className="mt-2 text-sm leading-relaxed text-ink-inverse/70">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-6 rounded-2xl border border-white/10 bg-navy-dark/40 p-4 text-sm leading-relaxed text-ink-inverse/60">
              Demi menjaga proses, hanya status dan tanggal yang ditampilkan. Isi laporan dan
              hasil investigasi tidak dibuka ke publik sebelum diputuskan dan dipublikasikan.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
