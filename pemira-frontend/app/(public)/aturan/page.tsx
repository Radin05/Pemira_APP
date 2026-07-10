import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Gavel } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { VIOLATION_RULES } from "@/lib/constant/rules";
import { REPORT_CATEGORY_LABEL } from "@/lib/types/report.types";

export const metadata: Metadata = {
  title: "Aturan Main",
  description:
    "Tata tertib kampanye dan dasar hukum pelanggaran PEMIRA KM Poltekkes Kemenkes Bandung.",
};

/** Anchor id dari kode pasal: PASAL_5_AYAT_1 → pasal-5-ayat-1 */
function anchorId(code: string): string {
  return code.toLowerCase().replaceAll("_", "-");
}

export default function AturanPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Dasar Hukum"
        title="Aturan Main"
        description="Tata tertib kampanye yang mengikat seluruh kandidat dan tim kampanye. Setiap laporan pelanggaran diperiksa dengan merujuk pasal-pasal di bawah ini."
      />

      <section className="bg-navy-dark py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[16rem_1fr] lg:gap-16">
          <nav aria-label="Daftar isi" className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="mb-5 border-b border-gold/30 pb-2 text-xs font-bold tracking-[0.2em] text-gold uppercase">
              Daftar Pasal
            </h2>
            <ul className="space-y-3">
              {VIOLATION_RULES.map((rule) => (
                <li key={rule.code}>
                  <a
                    href={`#${anchorId(rule.code)}`}
                    className="text-sm text-ink-inverse/70 transition-colors hover:text-gold"
                  >
                    {rule.article} — {rule.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <div className="mb-10 flex gap-4 rounded-xl border border-warning/40 bg-warning/10 p-5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
              <p className="text-sm leading-relaxed text-ink-inverse/80">
                Rumusan pasal di halaman ini masih menunggu pengesahan naskah resmi
                Komite Pengawasan. Gunakan sebagai rujukan awal, bukan sebagai dasar
                keberatan formal.
              </p>
            </div>

            <ol className="space-y-6">
              {VIOLATION_RULES.map((rule) => (
                <li
                  key={rule.code}
                  id={anchorId(rule.code)}
                  className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-7"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold tracking-wide text-gold">
                      {rule.article}
                    </span>
                    <span className="text-xs text-ink-inverse/50">
                      Kategori laporan: {REPORT_CATEGORY_LABEL[rule.category]}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-ink-inverse">{rule.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink-inverse/70">
                    {rule.description}
                  </p>

                  <p className="mt-5 flex items-start gap-3 border-t border-white/10 pt-5 text-sm text-ink-inverse/60">
                    <Gavel className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                    <span>
                      <span className="font-semibold text-ink-inverse/80">Sanksi:</span>{" "}
                      {rule.sanction}
                    </span>
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-12 rounded-2xl border border-white/10 bg-navy p-8 text-center">
              <h2 className="text-xl font-bold text-ink-inverse">
                Menemukan pelanggaran?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-inverse/70">
                Laporkan disertai bukti. Identitas pelapor dilindungi, dan setiap laporan
                diperiksa sebelum dipublikasikan.
              </p>
              <Button
                nativeButton={false}
                render={<Link href="/lapor" />}
                className="mt-6 h-11 rounded-full bg-gold px-6 font-semibold text-navy-dark hover:bg-gold-light"
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
