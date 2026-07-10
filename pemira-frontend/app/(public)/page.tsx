import Link from "next/link";
import {
  Eye,
  FileCheck2,
  Lock,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, SITE_STATS, WORK_PRINCIPLES } from "@/lib/constant/site";

/** Peta nama ikon → komponen. Record<> memaksa setiap ikon di site.ts punya pasangan. */
const ICONS: Record<(typeof WORK_PRINCIPLES)[number]["icon"], LucideIcon> = {
  shield: ShieldCheck,
  eye: Eye,
  scale: Scale,
  lock: Lock,
  "file-check": FileCheck2,
};

function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy">
      {/* Cahaya emas samar di kanan atas — memberi kedalaman tanpa menambah aset gambar. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <p className="mb-6 text-xs font-semibold tracking-[0.25em] text-gold uppercase">
          {SITE.orgName} · {SITE.institution}
        </p>

        <h1 className="max-w-4xl text-4xl leading-[1.08] font-extrabold text-ink-inverse uppercase sm:text-5xl lg:text-6xl">
          Kawal demokrasi
          <br />
          secara <span className="text-gold">adil &amp; bersih.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-inverse/75 sm:text-lg">
          Di balik pesta demokrasi yang sehat, terdapat komitmen pengawasan yang
          objektif dan bermartabat. Kami memastikan setiap proses berjalan jujur,
          bebas dari intervensi, dan berkepastian hukum.{" "}
          <span className="font-semibold text-ink-inverse">
            Integritas adalah standar kami.
          </span>
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          {/* nativeButton={false} wajib saat render sebagai <a>: Base UI sebaliknya
              memperingatkan bahwa semantik <button> hilang. */}
          <Button
            nativeButton={false}
            render={<Link href="/lapor" />}
            className="h-12 rounded-full bg-gold px-7 text-base font-semibold text-navy-dark hover:bg-gold-light"
          >
            Lapor Pelanggaran
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/status" />}
            className="h-12 rounded-full border-ink-inverse/25 bg-transparent px-7 text-base font-semibold text-ink-inverse hover:bg-ink-inverse/10 hover:text-ink-inverse"
          >
            Lacak Status Laporan
          </Button>
        </div>
      </div>
    </section>
  );
}

function Principles() {
  return (
    <section className="bg-navy-dark py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-extrabold text-ink-inverse sm:text-4xl">
            Prinsip Kerja Kami
          </h2>
          <span aria-hidden className="mt-5 h-1 w-24 rounded-full bg-gold" />
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {WORK_PRINCIPLES.map((principle) => {
            const Icon = ICONS[principle.icon];
            return (
              <li
                key={principle.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center transition-colors hover:border-gold/50"
              >
                <span className="inline-flex size-14 items-center justify-center rounded-xl bg-gold">
                  <Icon className="size-7 text-navy-dark" aria-hidden />
                </span>
                <h3 className="mt-6 text-lg font-bold text-ink-inverse">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-inverse/65">
                  {principle.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-t border-white/10 bg-navy py-20">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 text-center sm:grid-cols-3">
        {SITE_STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-5xl font-extrabold text-gold sm:text-6xl">{stat.value}</p>
            <p className="mt-4 text-base font-semibold text-ink-inverse">{stat.label}</p>
            <p className="mt-2 text-sm text-ink-inverse/60">{stat.caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Principles />
      <Stats />
    </main>
  );
}
