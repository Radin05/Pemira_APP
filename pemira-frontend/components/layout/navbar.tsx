"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_MENU } from "@/lib/constant/nav-menu";
import { cn } from "@/lib/utils";

/**
 * Menandai tab aktif. "/" harus dicocokkan persis, kalau tidak setiap halaman
 * akan menganggap Beranda ikut aktif karena semua path diawali "/".
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface-dark">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3"
      >
        <Link
          href="/"
          className="shrink-0 font-extrabold tracking-tight text-ink-inverse"
        >
          PEMIRA<span className="text-gold">.</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_MENU.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-gold text-surface-dark"
                      : "text-ink-inverse hover:bg-gold/15",
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
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {isOpen && (
        <ul
          id="menu-mobile"
          className="border-t border-white/10 px-4 pb-4 lg:hidden"
        >
          {NAV_MENU.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "mt-2 block rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-gold text-surface-dark"
                      : "text-ink-inverse hover:bg-gold/15",
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
