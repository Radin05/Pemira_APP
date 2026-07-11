/**
 * Base URL backend. Dev: http://localhost:8080. Override lewat env
 * NEXT_PUBLIC_API_BASE saat deploy.
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/api/v1";

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors?: { field: string; message: string }[] | null;
  requestId?: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Jembatan token ────────────────────────────────────────────────────────
// Access token disimpan di memori oleh auth.store (ADR-003). Untuk menghindari
// import melingkar store↔client, store mendaftarkan pengambil & penyegar token
// di sini lewat configureAuth().
let getAccessToken: () => string | null = () => null;
let refreshSession: () => Promise<string | null> = async () => null;

export function configureAuth(opts: {
  getAccessToken: () => string | null;
  refreshSession: () => Promise<string | null>;
}) {
  getAccessToken = opts.getAccessToken;
  refreshSession = opts.refreshSession;
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // Response tanpa body JSON.
  }
  if (!res.ok || !body?.success) {
    throw new ApiError(
      res.status,
      body?.message ?? "Terjadi kesalahan pada server",
      body?.errors ?? undefined,
    );
  }
  return body.data as T;
}

type RequestOptions = {
  method?: string;
  body?: BodyInit | null;
  json?: unknown;
  auth?: boolean; // lampirkan Bearer token
  retryOn401?: boolean; // coba refresh sekali lalu ulangi
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, json, auth = false, retryOn401 = auth } = opts;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (json !== undefined) headers["Content-Type"] = "application/json";
  const token = auth ? getAccessToken() : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : body,
    credentials: "include", // kirim/terima cookie refresh (httpOnly)
  });

  // Access token kedaluwarsa → refresh sekali, lalu ulangi request asli.
  if (res.status === 401 && retryOn401) {
    const newToken = await refreshSession();
    if (newToken) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      const retry = await fetch(`${API_BASE}${path}`, {
        method,
        headers: retryHeaders,
        body: json !== undefined ? JSON.stringify(json) : body,
        credentials: "include",
      });
      return parseEnvelope<T>(retry);
    }
  }
  return parseEnvelope<T>(res);
}

export const apiGet = <T>(path: string, auth = false) => request<T>(path, { auth });

export const apiPostJson = <T>(path: string, json: unknown, auth = false) =>
  request<T>(path, { method: "POST", json, auth });

export const apiPostForm = <T>(path: string, form: FormData, auth = false) =>
  request<T>(path, { method: "POST", body: form, auth });

/** Panggilan auth tanpa retry (login/refresh sendiri tidak boleh memicu refresh). */
export const authPost = <T>(path: string, json?: unknown) =>
  request<T>(path, { method: "POST", json, auth: false, retryOn401: false });
