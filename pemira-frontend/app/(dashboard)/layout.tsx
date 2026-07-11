"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { SITE } from "@/lib/constant/site";
import { useAuthStore } from "@/store/auth.store";

/**
 * Guard sisi klien untuk seluruh dashboard. Saat load, mencoba memulihkan sesi
 * dari cookie refresh; kalau gagal, dialihkan ke /login.
 *
 * Catatan: guard berbasis `proxy.ts` (edge) TIDAK dipakai di sini. Di dev
 * frontend (localhost:3000) dan backend (localhost:8080) beda origin, sehingga
 * cookie refresh httpOnly milik backend tidak terlihat oleh middleware Next.
 * Proteksi yang mengikat tetap di backend (@PreAuthorize). Lihat ADR-010.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, accessToken, initializing, bootstrap, logout } = useAuthStore();

  useEffect(() => {
    if (!accessToken) bootstrap();
  }, [accessToken, bootstrap]);

  useEffect(() => {
    if (!initializing && !user) router.replace("/login");
  }, [initializing, user, router]);

  if (initializing || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-black/10 bg-primary">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              src={SITE.logo.src}
              alt={SITE.logo.alt}
              width={SITE.logo.width}
              height={SITE.logo.height}
              className="size-9"
            />
            <span className="text-sm font-bold text-ink-inverse">Dashboard KP</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-ink-inverse">{user.fullName}</p>
              <p className="text-xs text-gold">{user.roles.join(", ")}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-ink-inverse/25 px-4 py-2 text-sm font-semibold text-ink-inverse transition-colors hover:bg-ink-inverse/10"
            >
              <LogOut className="size-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
