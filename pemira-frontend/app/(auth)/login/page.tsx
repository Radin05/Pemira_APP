"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/api/auth.service";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const inputClass =
  "border-white/15 bg-navy-dark text-ink-inverse placeholder:text-ink-inverse/40 focus-visible:border-gold";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      setSession(res);
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Tidak dapat menghubungi server",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-inverse">Masuk Staf KP</h1>
      <p className="mt-2 text-sm text-ink-inverse/60">
        Untuk anggota Komite Pengawasan. Mahasiswa pelapor{" "}
        <Link href="/masuk" className="text-gold hover:underline">
          masuk di sini
        </Link>
        .
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-ink-inverse">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@poltekkesbandung.ac.id"
            className={cn("mt-1.5", inputClass)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-sm font-medium text-ink-inverse">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Memproses…" : "Masuk"}
        </Button>
      </form>
    </div>
  );
}
