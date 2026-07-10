import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusTracker } from "@/components/domain/report/status-tracker";

export const metadata: Metadata = {
  title: "Status Laporan",
  description:
    "Lacak perkembangan laporan pelanggaran PEMIRA menggunakan kode tiket dan NPM.",
};

export default function StatusPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Pelacakan Laporan"
        title="Status Laporan"
        description="Masukkan kode tiket dan NPM yang Anda gunakan saat melapor untuk melihat perkembangan penanganan laporan."
      />

      <section className="bg-navy-dark py-14 lg:py-20">
        <div className="mx-auto max-w-2xl px-6">
          {/* useSearchParams butuh Suspense boundary di Next 16. */}
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/[0.03]" />}>
            <StatusTracker />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
