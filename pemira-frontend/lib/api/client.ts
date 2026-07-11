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

/** Error terstruktur dari backend, membawa status + pesan yang bisa ditampilkan. */
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

async function parseEnvelope<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // Response tanpa body JSON (mis. 500 mentah).
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

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  return parseEnvelope<T>(res);
}

/** POST multipart/form-data. Jangan set Content-Type manual — biar boundary otomatis. */
export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: form,
    headers: { Accept: "application/json" },
  });
  return parseEnvelope<T>(res);
}
