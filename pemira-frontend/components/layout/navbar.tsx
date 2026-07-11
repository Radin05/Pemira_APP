"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_MENU } from "@/lib/constant/nav-menu";
import { SITE } from "@/lib/constant/site";
import { cn } from "@/lib/utils";

/**
 * Menandai tab aktif. "/" harus dicocokkan persis, kalau tidak setiap halaman
 * akan menganggap Beranda ikut aktif karena semua path diawali "/".
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-4">
      <Image
        src={SITE.logo.src}
        alt={SITE.logo.alt}
        width={SITE.logo.width}
        height={SITE.logo.height}
        priority
        className="size-16 shrink-0 sm:size-18"
      />
      <span className="flex flex-col leading-none">
        <span className="text-xl font-extrabold tracking-tight text-ink-inverse sm:text-2xl">
          {SITE.orgName}
        </span>
        <span className="mt-1.5 text-xs font-semibold tracking-[0.2em] text-gold uppercase">
          {SITE.tagline}
        </span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-dark">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4"
      >
        <Brand />

        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV_MENU.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                    active
                      ? "bg-gold text-navy-dark"
                      : "text-ink-inverse/85 hover:bg-gold/15 hover:text-ink-inverse",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="menu-mobile"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          className="rounded-md p-2 text-ink-inverse hover:bg-gold/15 lg:hidden"
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {isOpen && (
        <ul id="menu-mobile" className="border-t border-white/10 px-6 pb-5 lg:hidden">
          {NAV_MENU.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "mt-2 block rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-gold text-navy-dark"
                      : "text-ink-inverse/85 hover:bg-gold/15 hover:text-ink-inverse",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
