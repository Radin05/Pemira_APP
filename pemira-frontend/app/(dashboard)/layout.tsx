"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { SITE } from "@/lib/constant/site";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

/**
 * Guard sisi klien untuk seluruh dashboard. Saat load, mencoba memulihkan sesi
 * dari cookie refresh; kalau gagal, dialihkan ke /login. Guard berbasis proxy.ts
 * (edge) tidak dipakai — beda origin dev, cookie backend tak terlihat middleware.
 * Proteksi mengikat tetap di backend (@PreAuthorize). Lihat ADR-010.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken, initializing, bootstrap, logout } = useAuthStore();

  useEffect(() => {
    if (!accessToken) bootstrap();
  }, [accessToken, bootstrap]);

  useEffect(() => {
    if (!initializing && !user) router.replace("/login");
  }, [initializing, user, router]);

  if (initializing || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  const initials = user.fullName
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-black/20 bg-primary shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src={SITE.logo.src}
              alt={SITE.logo.alt}
              width={SITE.logo.width}
              height={SITE.logo.height}
              className="size-9"
            />
            <div className="leading-none">
              <span className="block text-sm font-bold text-ink-inverse">Dashboard KP</span>
              <span className="mt-0.5 block text-[0.65rem] font-semibold tracking-[0.15em] text-gold uppercase">
                {SITE.tagline}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink-inverse">{user.fullName}</p>
              <p className="text-xs text-gold">{user.roles.join(", ")}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy-dark">
              {initials}
            </span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-ink-inverse/25 px-3.5 py-2 text-sm font-semibold text-ink-inverse transition-colors hover:bg-ink-inverse/10"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb tipis untuk memberi konteks selain header putih polos */}
      {pathname !== "/dashboard" && (
        <div className="border-b border-canvas-line bg-white/60">
          <div className="mx-auto max-w-7xl px-6 py-2.5">
            <Link
              href="/dashboard"
              className={cn(
                "text-xs font-medium text-ink-muted transition-colors hover:text-primary",
              )}
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
