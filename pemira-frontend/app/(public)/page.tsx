import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/domain/report/status-badge";

export default function Home() {
  return (
    <main className="flex flex-1 items-center bg-navy">
      <div className="mx-auto w-full max-w-5xl px-6 py-24">
        <p className="mb-4 text-sm font-semibold tracking-widest text-gold uppercase">
          Komisi Pemilihan IKM UI
        </p>
        <h1 className="max-w-3xl text-hero text-ink-inverse text-balance">
          Kanal resmi pelaporan pelanggaran{" "}
          <span className="text-gold">PEMIRA 2025</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-inverse/80">
          Setiap laporan tercatat, diverifikasi divisi Hukum &amp; Sekretariat,
          dan diputuskan Ketua KP. Jejaknya tidak bisa dihapus.
        </p>

        {/* Base UI memakai prop `render` untuk polimorfisme, bukan `asChild` seperti Radix. */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Button
            render={<Link href="/lapor" />}
            className="h-12 rounded-full bg-gold px-6 text-base font-semibold text-surface-dark hover:bg-gold-light"
          >
            Lapor Pelanggaran
          </Button>
          <Button
            variant="outline"
            render={<Link href="/status" />}
            className="h-12 rounded-full border-ink-inverse/30 bg-transparent px-6 text-base font-semibold text-ink-inverse hover:bg-ink-inverse/10 hover:text-ink-inverse"
          >
            Lacak Status Laporan
          </Button>
        </div>

        {/* Sementara: bukti visual bahwa token status terbaca benar. Dihapus di T-08-04. */}
        <div className="mt-16 flex flex-wrap gap-2 rounded-xl bg-white p-4">
          <StatusBadge status="DITERIMA" />
          <StatusBadge status="DIVERIFIKASI" />
          <StatusBadge status="VALID" />
          <StatusBadge status="HOAX" />
          <StatusBadge status="DISETUJUI" />
          <StatusBadge status="DITOLAK" />
          <StatusBadge status="DIPUBLIKASI" />
          <StatusBadge status="SELESAI" />
        </div>
      </div>
    </main>
  );
}
