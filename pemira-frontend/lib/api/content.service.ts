import { apiDelete, apiGet, apiPostForm, apiPut, API_BASE } from "@/lib/api/client";

export const CONTENT_KEYS = ["info", "aturan", "tentang"] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

export type ContentFileUpload = {
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  href: string;
};

export const publicContent = {
  async get<T>(key: ContentKey, fallback: T): Promise<T> {
    try {
      const res = await fetch(`${API_BASE}/public/content/${key}`, { cache: "no-store" });
      const body = await res.json();
      return body?.success && body.data ? (body.data as T) : fallback;
    } catch {
      return fallback;
    }
  },
};

export const adminContent = {
  get: <T>(key: ContentKey) => apiGet<T | null>(`/content/${key}`, true),
  save: <T>(key: ContentKey, payload: T) => apiPut<T>(`/content/${key}`, payload, true),
  reset: (key: ContentKey) => apiDelete<null>(`/content/${key}`, true),
  uploadFile: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiPostForm<ContentFileUpload>("/content/files", form, true);
  },
};
