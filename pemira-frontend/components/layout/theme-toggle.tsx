"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sumber kebenaran tema adalah class `dark` di <html>, bukan state React —
 * skrip anti-kedip di app/layout.tsx sudah memasangnya sebelum React hydrate.
 * Jadi class itu diperlakukan sebagai external store: useSyncExternalStore
 * membacanya, bukan useEffect + setState (yang memicu render berantai dan
 * ditolak eslint react-hooks).
 *
 * getServerSnapshot mengembalikan false: server tidak tahu tema, jadi render
 * pertama selalu "terang", lalu React menyelaraskan saat hydrate.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

export function ThemeToggle({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    // Sekali user memilih, pilihannya menang atas prefers-color-scheme sistem.
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
      aria-pressed={isDark}
      title={isDark ? "Tema terang" : "Tema gelap"}
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-steel-deep transition-colors hover:bg-amber/15 hover:text-steel-ink",
        className,
      )}
    >
      {/* Kedua ikon selalu dirender dan saling silang lewat opacity + rotate,
          jadi pergantiannya mulus dan tidak ada layout shift. */}
      <Sun
        aria-hidden
        className={cn(
          "absolute size-5 transition-all duration-300",
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 -rotate-90 opacity-0",
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          "absolute size-5 transition-all duration-300",
          isDark
            ? "scale-50 rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100",
        )}
      />
    </button>
  );
}
