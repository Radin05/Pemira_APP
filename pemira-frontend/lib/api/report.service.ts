import { apiGet, apiPostForm, ApiError } from "@/lib/api/client";
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

/** Bentuk payload yang dikirim ke backend (field `anonymous`, bukan `isAnonymous`). */
function toPayload(v: ReportFormValues) {
  return {
    submissionMode: v.submissionMode,
    category: v.category ?? null,
    title: v.title ?? null,
    incidentDate: v.incidentDate || null,
    incidentLocation: v.incidentLocation ?? null,
    reportedCandidate: v.reportedCandidate || null,
    description: v.description ?? null,
    anonymous: v.isAnonymous,
    reporterName: v.isAnonymous ? null : v.reporterName,
    reporterNpm: v.reporterNpm,
    reporterEmail: v.reporterEmail,
  };
}

export const reportService = {
  async submit(values: ReportFormValues, evidence: File[]): Promise<SubmitReportResult> {
    const form = new FormData();
    // Payload dikirim sebagai bagian JSON agar terikat ke @RequestPart di backend.
    form.append(
      "payload",
      new Blob([JSON.stringify(toPayload(values))], { type: "application/json" }),
    );
    for (const file of evidence) {
      form.append("evidence", file);
    }
    return apiPostForm<SubmitReportResult>("/reports", form);
  },

  /** Mengembalikan null bila tiket/NPM tidak cocok (backend membalas 404). */
  async track(ticketCode: string, npm: string): Promise<TrackResult | null> {
    try {
      const params = new URLSearchParams({ ticket: ticketCode.trim(), npm: npm.trim() });
      return await apiGet<TrackResult>(`/reports/track?${params.toString()}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
};
