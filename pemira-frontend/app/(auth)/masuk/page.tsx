import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MasukMahasiswaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-inverse">Mahasiswa Tidak Perlu Login</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-inverse/65">
        Pelaporan dibuat terbuka agar mahasiswa bisa langsung mengirim laporan tanpa akun.
        Setelah laporan terkirim, simpan kode tiket dan gunakan NPM untuk melacak statusnya.
      </p>

      <div className="mt-8 grid gap-3">
        <Button
          nativeButton={false}
          render={<Link href="/lapor" />}
          className="h-11 rounded-full bg-gold font-semibold text-navy-dark hover:bg-gold-light"
        >
          <FileText className="mr-2 size-4" /> Buat Laporan
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/status" />}
          className="h-11 rounded-full border-ink-inverse/25 bg-transparent font-semibold text-ink-inverse hover:bg-ink-inverse/10 hover:text-ink-inverse"
        >
          <Search className="mr-2 size-4" /> Lacak Status Laporan
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-ink-inverse/45">
        Login hanya digunakan untuk staf Komite Pengawasan. {" "}
        <Link href="/login" className="text-gold hover:underline">
          Masuk staf
        </Link>
      </p>
    </div>
  );
}
