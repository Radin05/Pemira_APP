/**
 * Batasan unggah bukti. Cermin dari validasi server (docs/01-PRD.md US-402,
 * docs/03-ARCHITECTURE.md §4). Nilai di sini hanya untuk UX cepat — server tetap
 * memvalidasi ulang, karena batasan di klien bisa diakali.
 */
export const MAX_EVIDENCE_FILES = 5;
export const MAX_EVIDENCE_SIZE_MB = 10;
export const MAX_EVIDENCE_SIZE_BYTES = MAX_EVIDENCE_SIZE_MB * 1024 * 1024;

export const ALLOWED_EVIDENCE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "application/pdf",
];

export const ALLOWED_EVIDENCE_EXT = ".jpg,.jpeg,.png,.webp,.mp4,.pdf";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
