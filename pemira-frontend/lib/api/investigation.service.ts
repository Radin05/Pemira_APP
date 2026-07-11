import { apiGet, apiPostJson, ApiError } from "@/lib/api/client";
import type { ReportCategory, ReportStatus } from "@/lib/types/report.types";

export type ReportSummary = {
  id: number;
  ticketCode: string;
  category: ReportCategory;
  status: ReportStatus;
  title: string;
  incidentDate: string;
  incidentLocation: string;
  reportedCandidate: string | null;
  anonymous: boolean;
  assigneeId: number | null;
  submittedAt: string;
};

export type Paged<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type ReportDetail = {
  id: number;
  ticketCode: string;
  category: ReportCategory;
  status: ReportStatus;
  title: string;
  description: string;
  incidentDate: string;
  incidentLocation: string;
  reportedCandidate: string | null;
  anonymous: boolean;
  assigneeId: number | null;
  submittedAt: string;
  evidences: {
    id: number;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    checksumSha256: string;
    uploadedAt: string;
  }[];
  history: {
    fromStatus: ReportStatus | null;
    toStatus: ReportStatus;
    note: string | null;
    createdAt: string;
  }[];
  investigation: {
    verdict: "VALID" | "HOAX" | null;
    crossCheckNote: string | null;
    findings: string | null;
    recommendedSanction: string | null;
    verdictAt: string | null;
    submittedToChiefAt: string | null;
  } | null;
};

export const SANCTION_OPTIONS = [
  { value: "TEGURAN", label: "Teguran Tertulis" },
  { value: "PENGURANGAN_SUARA", label: "Pengurangan Suara" },
  { value: "DISKUALIFIKASI", label: "Diskualifikasi" },
  { value: "TIDAK_ADA", label: "Tanpa Sanksi" },
] as const;

export const SANCTION_LABEL: Record<string, string> = Object.fromEntries(
  SANCTION_OPTIONS.map((o) => [o.value, o.label]),
);

export const investigationService = {
  list: (params: { status?: ReportStatus; category?: ReportCategory; page?: number }) => {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.category) q.set("category", params.category);
    q.set("page", String(params.page ?? 0));
    return apiGet<Paged<ReportSummary>>(`/reports?${q.toString()}`, true);
  },

  detail: (id: number) => apiGet<ReportDetail>(`/reports/${id}`, true),

  claim: (id: number) => apiPostJson<null>(`/reports/${id}/claim`, {}, true),

  setVerdict: (id: number, verdict: "VALID" | "HOAX", crossCheckNote: string) =>
    apiPostJson<null>(`/reports/${id}/verdict`, { verdict, crossCheckNote }, true),

  submitToChief: (id: number, findings: string, recommendedSanction: string) =>
    apiPostJson<null>(`/reports/${id}/submit-to-chief`, { findings, recommendedSanction }, true),
};

/** Aksi Ketua KP (EPIC-06). */
export const approvalService = {
  approve: (id: number) => apiPostJson<null>(`/reports/${id}/approve`, {}, true),
  reject: (id: number, reason: string) =>
    apiPostJson<null>(`/reports/${id}/reject`, { reason }, true),
};

export { ApiError };
