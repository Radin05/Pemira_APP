"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EvidenceDropzone } from "@/components/domain/report/evidence-dropzone";
import { reportService, type SubmitReportResult } from "@/lib/api/report.service";
import { ApiError } from "@/lib/api/client";
import { reportSchema, type ReportFormValues } from "@/lib/validators/report.schema";
import { REPORT_CATEGORY, REPORT_CATEGORY_LABEL } from "@/lib/types/report.types";
import { cn } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-danger">{message}</p>;
}

function SuccessPanel({
  result,
  reporterNpm,
}: {
  result: SubmitReportResult;
  reporterNpm: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border border-success/40 bg-success/10 p-8 text-center">
      <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden />
      <h2 className="mt-5 text-2xl font-bold text-ink-inverse">Laporan Terkirim</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-inverse/70">
        Simpan kode tiket dan NPM di bawah ini. Keduanya diperlukan untuk melacak
        perkembangan laporan di halaman Status Laporan.
      </p>

      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/15 bg-navy-dark p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-ink-inverse/45 uppercase">
              Kode tiket
            </p>
            <p className="mt-1 break-all text-xl font-bold tracking-wider text-gold">
              {result.ticketCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(result.ticketCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-md p-2 text-ink-inverse/70 hover:bg-white/10 hover:text-gold"
            aria-label="Salin kode tiket"
          >
            <Copy className="size-4" />
          </button>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs font-semibold tracking-wide text-ink-inverse/45 uppercase">
            NPM verifikasi
          </p>
          <p className="mt-1 font-semibold text-ink-inverse">{reporterNpm}</p>
        </div>
      </div>
      {copied && <p className="mt-2 text-xs text-success">Kode tiket disalin</p>}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          nativeButton={false}
          render={<Link href={`/status?ticket=${result.ticketCode}`} />}
          className="h-11 rounded-full bg-gold px-6 font-semibold text-navy-dark hover:bg-gold-light"
        >
          Lacak Status
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/" />}
          className="h-11 rounded-full border-ink-inverse/25 bg-transparent px-6 font-semibold text-ink-inverse hover:bg-ink-inverse/10 hover:text-ink-inverse"
        >
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
}

const inputClass =
  "border-white/15 bg-white/[0.03] text-ink-inverse placeholder:text-ink-inverse/40 focus-visible:border-gold";
const labelClass = "text-sm font-medium text-ink-inverse";

export function ReportForm() {
  const [evidence, setEvidence] = useState<File[]>([]);
  const [result, setResult] = useState<SubmitReportResult | null>(null);
  const [submittedNpm, setSubmittedNpm] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { isAnonymous: false },
  });

  const isAnonymous = watch("isAnonymous");

  async function onSubmit(values: ReportFormValues) {
    setSubmitError(null);
    try {
      const submitResult = await reportService.submit(values, evidence);
      setSubmittedNpm(values.reporterNpm);
      setResult(submitResult);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        // Kegagalan jaringan / backend mati.
        setSubmitError(
          "Tidak dapat menghubungi server. Pastikan koneksi Anda dan coba lagi.",
        );
      }
    }
  }

  if (result) return <SuccessPanel result={result} reporterNpm={submittedNpm} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* ── Detail pelanggaran ─────────────────────────── */}
      <fieldset className="space-y-5" disabled={isSubmitting}>
        <legend className="mb-2 text-xs font-bold tracking-[0.2em] text-gold uppercase">
          Detail Pelanggaran
        </legend>

        <div>
          <Label htmlFor="category" className={labelClass}>
            Kategori pelanggaran
          </Label>
          <select
            id="category"
            {...register("category")}
            defaultValue=""
            className={cn(
              "mt-1.5 h-10 w-full rounded-md border px-3 text-sm",
              inputClass,
              "[&>option]:bg-navy-dark [&>option]:text-ink-inverse",
            )}
          >
            <option value="" disabled>
              Pilih kategori…
            </option>
            {REPORT_CATEGORY.map((c) => (
              <option key={c} value={c}>
                {REPORT_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <FieldError message={errors.category?.message} />
        </div>

        <div>
          <Label htmlFor="title" className={labelClass}>
            Judul laporan
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Ringkasan singkat, mis. Pemasangan spanduk di luar jadwal"
            className={cn("mt-1.5", inputClass)}
          />
          <FieldError message={errors.title?.message} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="incidentDate" className={labelClass}>
              Tanggal kejadian
            </Label>
            <Input
              id="incidentDate"
              type="date"
              {...register("incidentDate")}
              className={cn("mt-1.5", inputClass)}
            />
            <FieldError message={errors.incidentDate?.message} />
          </div>
          <div>
            <Label htmlFor="incidentLocation" className={labelClass}>
              Lokasi kejadian
            </Label>
            <Input
              id="incidentLocation"
              {...register("incidentLocation")}
              placeholder="mis. Gedung Direktorat, atau akun @…"
              className={cn("mt-1.5", inputClass)}
            />
            <FieldError message={errors.incidentLocation?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="reportedCandidate" className={labelClass}>
            Kandidat terlapor <span className="text-ink-inverse/40">(opsional)</span>
          </Label>
          <Input
            id="reportedCandidate"
            {...register("reportedCandidate")}
            placeholder="Nama atau nomor urut kandidat, jika diketahui"
            className={cn("mt-1.5", inputClass)}
          />
          <FieldError message={errors.reportedCandidate?.message} />
        </div>

        <div>
          <Label htmlFor="description" className={labelClass}>
            Kronologi kejadian
          </Label>
          <Textarea
            id="description"
            rows={6}
            {...register("description")}
            placeholder="Jelaskan apa yang terjadi, kapan, di mana, dan siapa yang terlibat. Semakin rinci, semakin mudah ditindaklanjuti."
            className={cn("mt-1.5 resize-y", inputClass)}
          />
          <FieldError message={errors.description?.message} />
        </div>
      </fieldset>

      {/* ── Bukti ──────────────────────────────────────── */}
      <fieldset disabled={isSubmitting}>
        <legend className="mb-4 text-xs font-bold tracking-[0.2em] text-gold uppercase">
          Lampiran Bukti <span className="text-ink-inverse/40 normal-case">(opsional)</span>
        </legend>
        <EvidenceDropzone files={evidence} onChange={setEvidence} disabled={isSubmitting} />
      </fieldset>

      {/* ── Identitas pelapor ──────────────────────────── */}
      <fieldset className="space-y-5" disabled={isSubmitting}>
        <legend className="mb-2 text-xs font-bold tracking-[0.2em] text-gold uppercase">
          Identitas Pelapor
        </legend>

        <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <input
            type="checkbox"
            {...register("isAnonymous")}
            className="mt-0.5 size-4 accent-[var(--color-gold)]"
          />
          <span>
            <span className="text-sm font-medium text-ink-inverse">
              Laporkan secara anonim
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-inverse/60">
              Nama Anda disembunyikan dari petugas investigasi. NPM dan email tetap
              diperlukan untuk verifikasi dan pengiriman kode tiket, disimpan terenkripsi.
            </span>
          </span>
        </label>

        <div className={cn("grid gap-5 sm:grid-cols-2", isAnonymous && "sm:grid-cols-1")}>
          {!isAnonymous && (
            <div>
              <Label htmlFor="reporterName" className={labelClass}>
                Nama lengkap
              </Label>
              <Input
                id="reporterName"
                {...register("reporterName")}
                className={cn("mt-1.5", inputClass)}
              />
              <FieldError message={errors.reporterName?.message} />
            </div>
          )}
          <div>
            <Label htmlFor="reporterNpm" className={labelClass}>
              NPM
            </Label>
            <Input
              id="reporterNpm"
              inputMode="numeric"
              {...register("reporterNpm")}
              className={cn("mt-1.5", inputClass)}
            />
            <FieldError message={errors.reporterNpm?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="reporterEmail" className={labelClass}>
            Email kampus
          </Label>
          <Input
            id="reporterEmail"
            type="email"
            {...register("reporterEmail")}
            placeholder="nama@poltekkesbandung.ac.id"
            className={cn("mt-1.5", inputClass)}
          />
          <FieldError message={errors.reporterEmail?.message} />
        </div>
      </fieldset>

      {submitError && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {submitError}
        </p>
      )}

      <div className="flex items-center gap-4 border-t border-white/10 pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-full bg-gold px-8 font-semibold text-navy-dark hover:bg-gold-light disabled:opacity-70"
        >
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isSubmitting ? "Mengirim…" : "Kirim Laporan"}
        </Button>
        <p className="text-xs text-ink-inverse/50">
          Dengan mengirim, Anda menyatakan laporan ini benar.
        </p>
      </div>
    </form>
  );
}
