import type { ReportFormValues } from "@/lib/validators/report.schema";
import type { ReportStatus } from "@/lib/types/report.types";

export type SubmitReportResult = {
  ticketCode: string;
  submittedAt: string;
};

/**
 * Hasil pelacakan. Sesuai ADR-007, HANYA status + tanggal yang dikembalikan —
 * tidak ada isi laporan, kronologi, atau identitas kandidat.
 */
export type TrackTimelineEntry = {
  status: ReportStatus;
  at: string; // ISO
  note?: string;
};

export type TrackResult = {
  ticketCode: string;
  currentStatus: ReportStatus;
  timeline: TrackTimelineEntry[];
};

/**
 * MODE PREVIEW. Endpoint `POST /api/v1/reports` belum ada — itu dikerjakan di
 * EPIC-04 (T-04-07). Sampai saat itu, submit disimulasikan di klien supaya alur
 * form bisa dicoba end-to-end.
 *
 * Saat backend siap, ganti isi fungsi ini dengan panggilan nyata ke apiClient
 * (multipart: field laporan + berkas bukti) dan hapus PREVIEW_MODE.
 */
const PREVIEW_MODE = true;

export const reportService = {
  async submit(values: ReportFormValues, evidence: File[]): Promise<SubmitReportResult> {
    if (PREVIEW_MODE) {
      // Jeda kecil supaya state loading terlihat, lalu tiket contoh.
      await new Promise((r) => setTimeout(r, 800));
      const rand = Math.floor(10000 + Math.random() * 90000);
      return {
        ticketCode: `PMR-2025-${rand}`,
        submittedAt: new Date().toISOString(),
      };
    }

    // TODO(T-04-07): implementasi nyata.
    // const form = new FormData();
    // form.append("payload", JSON.stringify(values));
    // evidence.forEach((f) => form.append("evidence", f));
    // const { data } = await apiClient.post("/reports", form);
    // return data;
    throw new Error("Belum terhubung ke backend");
  },

  /**
   * MODE PREVIEW. Nanti memanggil GET /api/v1/reports/track?ticket=&npm= (T-04-10).
   * Untuk sekarang mengembalikan timeline contoh untuk format tiket yang valid,
   * atau null bila format salah (mensimulasikan "tidak ditemukan").
   */
  async track(ticketCode: string, npm: string): Promise<TrackResult | null> {
    await new Promise((r) => setTimeout(r, 600));
    const validFormat = /^PMR-2025-\d{5}$/.test(ticketCode.trim()) && /^\d{6,}$/.test(npm.trim());
    if (!validFormat) return null;

    return {
      ticketCode: ticketCode.trim(),
      currentStatus: "DIVERIFIKASI",
      timeline: [
        { status: "DITERIMA", at: "2025-09-20T08:15:00+07:00", note: "Laporan diterima sistem" },
        {
          status: "DIVERIFIKASI",
          at: "2025-09-21T10:00:00+07:00",
          note: "Sedang diperiksa divisi Hukum & Sekretariat",
        },
      ],
    };
  },
};
