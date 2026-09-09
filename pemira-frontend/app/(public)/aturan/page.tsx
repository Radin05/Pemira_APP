import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Gavel } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { publicContent } from "@/lib/api/content.service";
import { DEFAULT_ATURAN_CONTENT, type AturanContent } from "@/lib/constant/page-content";
import { REPORT_CATEGORY_LABEL } from "@/lib/types/report.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aturan Main",
  description:
    "Tata tertib kampanye dan dasar hukum pelanggaran PEMIRA KM Poltekkes Kemenkes Bandung.",
};

function anchorId(code: string): string {
  return code.toLowerCase().replaceAll("_", "-");
}

export default async function AturanPage() {
  const content = await publicContent.get<AturanContent>("aturan", DEFAULT_ATURAN_CONTENT);

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Dasar Hukum"
        title="Aturan Main"
        description="Tata tertib kampanye yang mengikat seluruh kandidat dan tim kampanye. Setiap laporan pelanggaran diperiksa dengan merujuk pasal-pasal di bawah ini."
      />

      <section className="bg-ivory py-12 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[16rem_1fr] lg:gap-16">
          <nav aria-label="Daftar isi" className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="mb-5 border-b border-canvas-line pb-2 text-xs font-bold tracking-[0.2em] text-steel-deep uppercase">
              Daftar Pasal
            </h2>
            <ul className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-3 lg:overflow-visible lg:pb-0">
              {content.rules.map((rule) => (
                <li key={rule.code} className="shrink-0 lg:shrink">
                  <a
                    href={`#${anchorId(rule.code)}`}
                    className="block rounded-full border border-steel/20 bg-surface px-3 py-2 text-xs font-semibold whitespace-nowrap text-ink-muted transition-colors hover:text-steel-deep lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:text-sm lg:font-normal lg:whitespace-normal"
                  >
                    {rule.article} — {rule.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <div className="mb-8 flex gap-4 rounded-xl border border-warning/40 bg-warning/10 p-5 lg:mb-10">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-ochre" aria-hidden />
              <p className="text-sm leading-relaxed text-steel-ink">{content.notice}</p>
            </div>

            <ol className="space-y-6">
              {content.rules.map((rule) => (
                <li
                  key={rule.code}
                  id={anchorId(rule.code)}
                  className="scroll-mt-28 rounded-2xl border border-steel/20 bg-surface p-5 shadow-sm sm:p-7"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-amber/15 px-3 py-1 text-xs font-semibold tracking-wide text-ochre">
                      {rule.article}
                    </span>
                    <span className="text-xs text-ink-muted">
                      Kategori laporan: {REPORT_CATEGORY_LABEL[rule.category] ?? rule.category}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold break-words text-steel-ink">{rule.title}</h3>
                  <p className="mt-3 leading-relaxed break-words text-ink-muted">
                    {rule.description}
                  </p>

                  <p className="mt-5 flex items-start gap-3 border-t border-canvas-line pt-5 text-sm text-ink-muted">
                    <Gavel className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />
                    <span className="min-w-0 break-words">
                      <span className="font-semibold text-steel-ink">Sanksi:</span> {rule.sanction}
                    </span>
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-10 rounded-2xl border border-steel/25 bg-sand p-6 text-center sm:p-8 lg:mt-12">
              <h2 className="text-xl font-bold text-steel-ink">Menemukan pelanggaran?</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-steel-ink/85">
                Laporkan disertai bukti. Identitas pelapor dilindungi, dan setiap laporan
                diperiksa sebelum dipublikasikan.
              </p>
              <Button
                nativeButton={false}
                render={<Link href="/lapor" />}
                className="mt-6 h-11 rounded-full bg-bar px-6 font-semibold text-ink-inverse hover:bg-bar/90"
              >
                Lapor Pelanggaran
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
