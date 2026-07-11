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
    verdictAt: string | null;
  } | null;
};

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
};

export { ApiError };
