"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/api/auth.service";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const inputClass =
  "border-white/15 bg-navy-dark text-ink-inverse placeholder:text-ink-inverse/40 focus-visible:border-gold";

export default function MasukMahasiswaPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [npm, setNpm] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.requestOtp(email, npm);
      setStep("verify");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tidak dapat menghubungi server");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.verifyOtp(email, code);
      setSession(res);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tidak dapat menghubungi server");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-inverse">Masuk Mahasiswa</h1>
      <p className="mt-2 text-sm text-ink-inverse/60">
        Verifikasi lewat email kampus untuk melapor dan melacak laporan. Staf KP{" "}
        <Link href="/login" className="text-gold hover:underline">
          masuk di sini
        </Link>
        .
      </p>

      {step === "request" ? (
        <form onSubmit={requestOtp} className="mt-8 space-y-5" noValidate>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-ink-inverse">
              Email kampus
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@poltekkesbandung.ac.id"
              className={cn("mt-1.5", inputClass)}
              required
            />
          </div>
          <div>
            <Label htmlFor="npm" className="text-sm font-medium text-ink-inverse">
              NPM
            </Label>
            <Input
              id="npm"
              inputMode="numeric"
              value={npm}
              onChange={(e) => setNpm(e.target.value)}
              className={cn("mt-1.5", inputClass)}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-full bg-gold font-semibold text-navy-dark hover:bg-gold-light disabled:opacity-70"
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loading ? "Mengirim…" : "Kirim Kode OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="mt-8 space-y-5" noValidate>
          <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
            <p className="text-sm leading-relaxed text-ink-inverse/70">
              Kode 6 digit telah dikirim ke <span className="text-ink-inverse">{email}</span>.
              Berlaku 10 menit.
            </p>
          </div>
          <div>
            <Label htmlFor="code" className="text-sm font-medium text-ink-inverse">
              Kode OTP
            </Label>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className={cn("mt-1.5 text-center text-lg tracking-[0.5em]", inputClass)}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="h-11 w-full rounded-full bg-gold font-semibold text-navy-dark hover:bg-gold-light disabled:opacity-60"
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loading ? "Memverifikasi…" : "Verifikasi & Masuk"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setCode("");
              setError(null);
            }}
            className="flex items-center gap-1.5 text-sm text-ink-inverse/60 hover:text-gold"
          >
            <ArrowLeft className="size-4" /> Ganti email atau NPM
          </button>
        </form>
      )}
    </div>
  );
}
