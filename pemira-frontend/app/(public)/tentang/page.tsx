import type { Metadata } from "next";
import {
  Camera,
  Gavel,
  MapPinned,
  Megaphone,
  ScrollText,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { publicContent } from "@/lib/api/content.service";
import { DEFAULT_TENTANG_CONTENT, type Division, type TentangContent } from "@/lib/constant/page-content";
import { SITE } from "@/lib/constant/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tentang KP",
  description:
    "Profil, tugas, dan struktur divisi Komite Pengawasan KM Poltekkes Kemenkes Bandung.",
};

const DIVISION_ICONS: Record<Division["icon"], LucideIcon> = {
  users: UsersRound,
  scroll: ScrollText,
  gavel: Gavel,
  wallet: Wallet,
  map: MapPinned,
  megaphone: Megaphone,
};

export default async function TentangPage() {
  const content = await publicContent.get<TentangContent>("tentang", DEFAULT_TENTANG_CONTENT);

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Profil Lembaga"
        title={`Tentang ${SITE.orgName}`}
        description={`Badan independen yang mengawasi jalannya pemilihan raya calon BEM dan BPM ${SITE.institutionShort}.`}
      />

      <section className="bg-ivory py-12 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-steel-ink">Mandat Kami</h2>
          <span aria-hidden className="mt-4 block h-1 w-20 rounded-full bg-amber" />
          {content.mandate.map((paragraph, index) => (
            <p key={index} className="mt-6 leading-relaxed break-words text-ink-muted first:mt-8">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="border-t border-canvas-line bg-canvas py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-steel-ink sm:text-3xl">
            Struktur Divisi
          </h2>
          <span aria-hidden className="mx-auto mt-4 block h-1 w-20 rounded-full bg-amber" />

          <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3 lg:mt-14">
            {content.divisions.map((division, index) => {
              const Icon = DIVISION_ICONS[division.icon] ?? UsersRound;
              return (
                <li
                  key={`${division.name}-${index}`}
                  className="rounded-2xl border border-steel/20 bg-surface p-5 shadow-sm sm:p-7"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-xl bg-amber">
                    <Icon className="size-6 text-on-amber" aria-hidden />
                  </span>
                  <h3 className="mt-6 text-lg font-bold break-words text-steel-ink">
                    {division.name}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium break-words text-steel-deep">
                    {division.role}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed break-words text-ink-muted">
                    {division.detail}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="border-t border-canvas-line bg-ivory py-12 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-steel-ink sm:text-3xl">
            Alur Penanganan Laporan
          </h2>
          <span aria-hidden className="mt-4 block h-1 w-20 rounded-full bg-amber" />

          <ol className="mt-10 space-y-5 lg:mt-12">
            {content.processSteps.map((step, index) => (
              <li
                key={`${step.title}-${index}`}
                className="flex gap-4 rounded-xl border border-steel/20 bg-surface p-5 shadow-sm sm:gap-5 sm:p-6"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber text-sm font-bold text-on-amber">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold break-words text-steel-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed break-words text-ink-muted">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-2xl border border-steel/20 bg-surface p-5 shadow-sm">
            <p className="text-sm leading-relaxed text-ink-muted">
              Punya pertanyaan? Hubungi kami lewat email atau kanal Instagram resmi.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`mailto:${SITE.email}`}
                className="rounded-full border border-steel/40 px-4 py-2 text-sm font-semibold break-all text-steel-deep transition-colors hover:bg-amber/15"
              >
                {SITE.email}
              </a>
              <a
                href={SITE.instagram.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-steel/40 px-4 py-2 text-sm font-semibold break-all text-steel-deep transition-colors hover:bg-amber/15"
              >
                <Camera className="size-4 shrink-0" aria-hidden />
                {SITE.instagram.handle}
              </a>
            </div>
            <p className="mt-3 text-xs text-ink-muted">Operasional {SITE.operationalHours}.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
