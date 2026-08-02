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
  "border-steel/30 bg-surface text-ink placeholder:text-ink-muted focus-visible:border-steel-deep";

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
        className="rounded-2xl border border-steel/20 bg-surface p-6 shadow-sm sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="ticket" className="text-sm font-medium text-steel-ink">
              Kode tiket
            </Label>
            <Input
              id="ticket"
              value={ticket}
              onChange={(e) => setTicket(e.target.value.toUpperCase())}
              placeholder="PMR-2026-XXXXX"
              className={cn("mt-1.5", inputClass)}
            />
          </div>
          <div>
            <Label htmlFor="npm" className="text-sm font-medium text-steel-ink">
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
          className="mt-6 h-11 rounded-full bg-amber px-6 font-semibold text-on-amber hover:bg-amber-deep disabled:opacity-60"
        >
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {loading ? "Mencari…" : "Lacak Laporan"}
        </Button>
      </form>

      {notFound && (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-steel/20 bg-surface p-10 text-center shadow-sm">
          <SearchX className="size-10 text-steel" aria-hidden />
          <p className="mt-4 font-semibold text-steel-ink">Laporan tidak ditemukan</p>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            Pastikan kode tiket dan NPM sesuai dengan yang Anda gunakan saat melapor.
          </p>
        </div>
      )}

      {result && (
        <section className="mt-8 overflow-hidden rounded-3xl border border-steel/20 bg-surface shadow-lg shadow-bar/10">
          <div className="flex flex-col gap-5 border-b border-canvas-line bg-canvas p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-ink-muted uppercase">
                Kode tiket
              </p>
              <p className="mt-2 break-all text-2xl font-extrabold tracking-wider text-steel-ink sm:text-3xl">
                {result.ticketCode}
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Simpan kode ini bersama NPM yang digunakan saat mengirim laporan.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber/50 bg-amber/15 px-4 py-2 text-sm font-semibold text-ochre">
              <CheckCircle2 className="size-4" aria-hidden />
              {REPORT_STATUS_LABEL[result.currentStatus]}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-5">
              <h3 className="text-sm font-bold tracking-wide text-steel-ink uppercase">
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
                      /* Tahap terakhir = penanda state, jadi garisnya steel-deep (9.65:1),
                         bukan amber yang cuma 1.57:1 di latar terang. Isian amber yang
                         membawa nuansa "sedang berjalan". */
                      isLast
                        ? "border-steel-deep bg-amber/[0.12]"
                        : "border-canvas-line bg-canvas",
                    )}
                  >
                    <div className="flex gap-4">
                      <span
                        className={cn(
                          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border",
                          isLast
                            ? "border-steel-deep bg-amber/15 text-ochre"
                            : "border-success/30 bg-success/10 text-success",
                        )}
                      >
                        <CircleDot className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="font-semibold text-steel-ink">
                            {REPORT_STATUS_LABEL[entry.status]}
                          </p>
                          <p className="text-xs font-medium text-ink-muted">
                            {formatDateTime(entry.at)}
                          </p>
                        </div>
                        {entry.note && (
                          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-6 rounded-2xl border border-canvas-line bg-canvas p-4 text-sm leading-relaxed text-ink-muted">
              Demi menjaga proses, hanya status dan tanggal yang ditampilkan. Isi laporan dan
              hasil investigasi tidak dibuka ke publik sebelum diputuskan dan dipublikasikan.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
