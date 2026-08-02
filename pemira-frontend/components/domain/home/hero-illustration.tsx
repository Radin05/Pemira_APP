"use client";

import { useRef } from "react";

/**
 * Ilustrasi hero beranda: kotak suara + surat suara yang dimasukkan, perisai
 * pengawasan, kaca pembesar investigasi, dan berkas laporan — empat hal yang
 * persis dikerjakan aplikasi ini.
 *
 * SVG inline, bukan file gambar, karena dua alasan:
 *   1. warnanya memakai var(--color-*) sehingga ikut berbalik di tema gelap
 *      tanpa perlu menyiapkan dua aset;
 *   2. tiap lapisan bisa digerakkan sendiri untuk efek parallax.
 *
 * Parallax menulis --mx/--my langsung ke DOM lewat ref, bukan lewat state:
 * mousemove memicu puluhan kali per detik dan setState di tiap event akan
 * me-render ulang seluruh subtree.
 */
export function HeroIllustration() {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    // Hormati preferensi sistem — sebagian orang pusing oleh gerak paralaks.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const r = el.getBoundingClientRect();
    // -1 .. 1, relatif terhadap titik tengah ilustrasi.
    const mx = (e.clientX - r.left) / r.width - 0.5;
    const my = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--mx", String(mx * 2));
    el.style.setProperty("--my", String(my * 2));
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
  }

  /** Lapisan parallax. `depth` = seberapa jauh ia bergeser mengikuti kursor. */
  function layer(depth: number) {
    return {
      transform: `translate3d(calc(var(--mx, 0) * ${depth}px), calc(var(--my, 0) * ${depth}px), 0)`,
      transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
    } as React.CSSProperties;
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ ["--mx" as string]: 0, ["--my" as string]: 0 }}
      className="group relative mx-auto w-full max-w-md select-none lg:max-w-none"
      aria-hidden
    >
      {/* Cahaya latar — ikut kursor paling pelan, memberi kesan kedalaman. */}
      <div
        style={layer(6)}
        className="pointer-events-none absolute inset-6 rounded-full bg-amber/25 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
      />

      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-label="Ilustrasi kotak suara, perisai pengawasan, dan berkas laporan"
        className="relative w-full drop-shadow-sm"
      >
        {/* ── Cincin dekoratif ─────────────────────────── */}
        <g style={layer(4)} className="text-steel">
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeDasharray="6 10"
          />
          <circle
            cx="200"
            cy="200"
            r="118"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
        </g>

        {/* ── Berkas laporan (kiri) ────────────────────── */}
        <g style={layer(12)}>
          <g className="animate-float-slow">
            <g transform="rotate(-8 88 190)">
              <rect
                x="42"
                y="132"
                width="92"
                height="116"
                rx="10"
                fill="var(--color-surface)"
                stroke="var(--color-steel)"
                strokeOpacity="0.45"
                strokeWidth="2"
              />
              <rect x="58" y="154" width="60" height="7" rx="3.5" fill="var(--color-steel)" fillOpacity="0.5" />
              <rect x="58" y="172" width="44" height="7" rx="3.5" fill="var(--color-steel)" fillOpacity="0.35" />
              <rect x="58" y="190" width="52" height="7" rx="3.5" fill="var(--color-steel)" fillOpacity="0.35" />
              <rect x="58" y="214" width="30" height="12" rx="6" fill="var(--color-amber)" />
            </g>
          </g>
        </g>

        {/* ── Surat suara yang dimasukkan ──────────────── */}
        <g style={layer(9)}>
          <g className="animate-drop">
            <g transform="rotate(6 200 150)">
              <rect
                x="172"
                y="104"
                width="58"
                height="78"
                rx="7"
                fill="var(--color-surface)"
                stroke="var(--color-steel)"
                strokeOpacity="0.5"
                strokeWidth="2"
              />
              <rect x="184" y="122" width="34" height="6" rx="3" fill="var(--color-steel)" fillOpacity="0.4" />
              <rect x="184" y="136" width="24" height="6" rx="3" fill="var(--color-steel)" fillOpacity="0.3" />
              <path
                d="M185 158l9 9 17-19"
                fill="none"
                stroke="var(--color-amber)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </g>

        {/* ── Kotak suara (jangkar, tidak ikut parallax) ── */}
        <g>
          <rect x="112" y="228" width="176" height="112" rx="16" fill="var(--color-steel)" />
          <rect x="112" y="228" width="176" height="112" rx="16" fill="var(--color-bar)" fillOpacity="0.28" />
          <rect x="100" y="204" width="200" height="34" rx="10" fill="var(--color-steel)" />
          {/* Celah tempat surat suara masuk */}
          <rect x="164" y="215" width="72" height="10" rx="5" fill="var(--color-bar)" fillOpacity="0.65" />
          {/* Emblem KP di badan kotak */}
          <circle cx="200" cy="288" r="26" fill="var(--color-ivory)" fillOpacity="0.16" />
          <path
            d="M200 272l18 7v11c0 11-7.6 20.6-18 23.4-10.4-2.8-18-12.4-18-23.4v-11z"
            fill="var(--color-amber)"
          />
          <path
            d="M192 289l6 6 11-12"
            fill="none"
            stroke="var(--color-on-amber)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ── Perisai pengawasan (kanan atas) ──────────── */}
        <g style={layer(20)}>
          <g className="animate-float">
            <path
              d="M312 78l38 15v25c0 24-16 43.5-38 49.5-22-6-38-25.5-38-49.5V93z"
              fill="var(--color-amber)"
            />
            <path
              d="M296 118l12 12 22-24"
              fill="none"
              stroke="var(--color-on-amber)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* ── Kaca pembesar investigasi (kiri bawah) ───── */}
        <g style={layer(16)} className="text-steel-deep">
          <g className="animate-float">
            <circle
              cx="92"
              cy="300"
              r="27"
              fill="var(--color-surface)"
              stroke="currentColor"
              strokeWidth="7"
            />
            <path
              d="M112 320l22 22"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* ── Partikel — lapisan terjauh, paling responsif ── */}
        <g style={layer(28)} className="text-amber">
          <circle cx="330" cy="238" r="6" fill="currentColor" />
          <circle cx="72" cy="96" r="4.5" fill="currentColor" fillOpacity="0.75" />
          <circle cx="286" cy="352" r="4" fill="currentColor" fillOpacity="0.6" />
          <circle cx="352" cy="176" r="3.5" fill="currentColor" fillOpacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
