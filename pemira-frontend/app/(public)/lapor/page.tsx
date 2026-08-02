import type { Metadata } from "next";
import Link from "next/link";
import { FileDown, ShieldCheck } from "lucide-react";
import { ReportForm } from "@/components/domain/report/report-form";

export const metadata: Metadata = {
  title: "Lapor Pelanggaran",
  description:
    "Formulir resmi pelaporan dugaan pelanggaran PEMIRA KM Poltekkes Kemenkes Bandung. Identitas pelapor dilindungi.",
};

export default function LaporPage() {
  return (
    <main className="flex-1">
      {/* Hero — aksen maroon untuk nuansa "hotline", dipakai secukupnya (palet §7.1). */}
      <section className="relative overflow-hidden border-b border-steel/25 bg-sky">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-sand/60 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center lg:py-20">
          {/* Nuansa "hotline" dibawa oleh garis + tint maroon, bukan oleh warna
              teksnya: maroon yang cukup gelap untuk jadi teks di tema terang
              terlalu gelap di tema gelap, dan kalau dicerahkan ikon putih di
              chip bg-maroon yang gagal. Teks ikut token yang dibalik. */}
          <span className="inline-block rounded-full border border-maroon/40 bg-maroon/10 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-steel-ink uppercase">
            Kanal Pengaduan
          </span>
          <h1 className="mt-6 text-3xl font-extrabold text-steel-ink sm:text-4xl lg:text-5xl">
            Melapor adalah tindakan keberanian
          </h1>
          <p className="mt-5 text-lg font-medium text-steel-deep">
            Identitas Anda dilindungi sepenuhnya.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-steel-ink/80">
            Jika Anda menyaksikan atau mengetahui dugaan pelanggaran dalam proses PEMIRA,
            laporkan lewat formulir resmi di bawah. Setiap laporan diperiksa secara
            profesional dan tidak dipublikasikan sebelum diverifikasi.
          </p>
        </div>
      </section>

      <section className="bg-ivory py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-6">
          {/* Pengingat template formulir (Intelligence Hub) */}
          <div className="mb-10 flex flex-col gap-4 rounded-xl border border-steel/20 bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FileDown className="mt-0.5 size-5 shrink-0 text-steel" aria-hidden />
              <p className="text-sm leading-relaxed text-ink-muted">
                Perlu menyusun kronologi terlebih dahulu? Unduh template Formulir Laporan
                (A-1) di halaman Info Pemira, lampirkan sebagai bukti pendukung.
              </p>
            </div>
            <Link
              href="/info#formulir"
              className="shrink-0 rounded-full border border-steel/40 px-4 py-2 text-center text-sm font-semibold text-steel-deep transition-colors hover:bg-amber/15"
            >
              Lihat Template
            </Link>
          </div>

          <ReportForm />

          <p className="mt-10 flex items-center justify-center gap-2 text-xs text-ink-muted">
            <ShieldCheck className="size-4 text-success" aria-hidden />
            Data Anda dienkripsi dan setiap perubahan status laporan tercatat permanen.
          </p>
        </div>
      </section>
    </main>
  );
}
