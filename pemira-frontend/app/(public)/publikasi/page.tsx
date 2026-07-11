import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PublikasiFeed } from "@/components/domain/publication/publikasi-feed";

export const metadata: Metadata = {
  title: "Transparansi",
  description:
    "Rekap putusan pelanggaran PEMIRA yang telah diverifikasi dan dipublikasikan Komite Pengawasan.",
};

export default function PublikasiPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Akuntabilitas Publik"
        title="Transparansi"
        description="Rekap putusan pelanggaran yang telah diverifikasi dan disetujui. Hanya kasus yang telah berkekuatan tetap yang ditampilkan di sini."
      />
      <PublikasiFeed />
    </main>
  );
}
