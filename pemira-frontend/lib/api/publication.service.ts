import { apiGet, apiPostJson } from "@/lib/api/client";
import type { ReportCategory } from "@/lib/types/report.types";

export type PublicItem = {
  slug: string;
  title: string;
  summary: string;
  category: ReportCategory | null;
  conclusion: "VALID" | "HOAX" | null;
  recommendedSanction: string | null;
  reportedCandidate: string | null;
  instagramUrl: string | null;
  publishedAt: string | null;
};

export type PublicDetail = PublicItem & { content: string | null };

export type TransparencyStats = {
  masuk: number;
  diinvestigasi: number;
  dipublikasi: number;
  ditolak: number;
};

export type ReadyReport = {
  reportId: number;
  ticketCode: string;
  reportTitle: string;
  category: ReportCategory;
  conclusion: "VALID" | "HOAX" | null;
  recommendedSanction: string | null;
  findings: string | null;
  reportedCandidate: string | null;
  hasDraft: boolean;
};

export type PublicationAdminItem = {
  id: number;
  reportId: number;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "WITHDRAWN";
  publishedAt: string | null;
};

export type PublicationDraft = {
  title: string;
  summary: string;
  content?: string;
  instagramUrl?: string;
  publish: boolean;
};

/** Endpoint publik (tanpa auth) — halaman Transparansi. */
export const publicationPublic = {
  feed: () => apiGet<PublicItem[]>("/public/publications"),
  detail: (slug: string) => apiGet<PublicDetail>(`/public/publications/${slug}`),
  stats: () => apiGet<TransparencyStats>("/public/stats"),
};

/** Endpoint PDD (butuh auth role PDD). */
export const publicationAdmin = {
  ready: () => apiGet<ReadyReport[]>("/publications/ready", true),
  readyOne: (reportId: number) => apiGet<ReadyReport>(`/publications/ready/${reportId}`, true),
  list: () => apiGet<PublicationAdminItem[]>("/publications", true),
  save: (reportId: number, draft: PublicationDraft) =>
    apiPostJson<{ id: number }>(`/publications/report/${reportId}`, draft, true),
  withdraw: (id: number, reason: string) =>
    apiPostJson<null>(`/publications/${id}/withdraw`, { reason }, true),
};
