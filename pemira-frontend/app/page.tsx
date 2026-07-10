import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center bg-primary">
      <div className="mx-auto w-full max-w-5xl px-6 py-24">
        <p className="mb-4 text-sm font-semibold tracking-widest text-accent uppercase">
          Komisi Pemilihan IKM UI
        </p>
        <h1 className="max-w-3xl text-hero text-ink-inverse text-balance">
          Kanal resmi pelaporan pelanggaran{" "}
          <span className="text-accent">PEMIRA 2025</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-inverse/80">
          Setiap laporan tercatat, diverifikasi divisi Hukum &amp; Sekretariat,
          dan diputuskan Ketua KP. Jejaknya tidak bisa dihapus.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/lapor"
            className="rounded-full bg-accent px-6 py-3 font-semibold text-surface-dark transition-colors hover:bg-accent-light"
          >
            Lapor Pelanggaran
          </Link>
          <Link
            href="/status"
            className="rounded-full border border-ink-inverse/30 px-6 py-3 font-semibold text-ink-inverse transition-colors hover:bg-ink-inverse/10"
          >
            Lacak Status Laporan
          </Link>
        </div>
      </div>
    </main>
  );
}
