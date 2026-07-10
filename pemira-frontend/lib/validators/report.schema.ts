import { z } from "zod";
import { REPORT_CATEGORY } from "@/lib/types/report.types";

/**
 * Skema form pelaporan. Aturan di sini mengikuti acceptance criteria US-401/402
 * di docs/01-PRD.md — kalau salah satu diubah, sesuaikan juga validasi Bean
 * Validation di backend (T-04-07) supaya keduanya konsisten.
 *
 * Bukti (file) TIDAK divalidasi di sini; File object ditangani di komponen
 * dropzone karena zod tidak nyaman untuk FileList lintas SSR.
 */
export const reportSchema = z
  .object({
    category: z.enum(REPORT_CATEGORY, {
      message: "Pilih kategori pelanggaran",
    }),
    title: z
      .string()
      .trim()
      .min(10, "Judul minimal 10 karakter")
      .max(150, "Judul maksimal 150 karakter"),
    incidentDate: z
      .string()
      .min(1, "Tanggal kejadian wajib diisi")
      .refine((v) => new Date(v) <= new Date(), "Tanggal kejadian tidak boleh di masa depan"),
    incidentLocation: z
      .string()
      .trim()
      .min(3, "Lokasi kejadian wajib diisi"),
    reportedCandidate: z.string().trim().max(150).optional(),
    description: z
      .string()
      .trim()
      .min(50, "Kronologi minimal 50 karakter agar dapat ditindaklanjuti")
      .max(5000, "Kronologi maksimal 5000 karakter"),
    isAnonymous: z.boolean(),
    reporterName: z.string().trim().max(100).optional(),
    reporterNpm: z
      .string()
      .trim()
      .regex(/^\d{6,}$/, "NPM berupa angka, minimal 6 digit"),
    reporterEmail: z
      .string()
      .trim()
      .email("Format email tidak valid")
      .refine(
        (v) => v.endsWith("@poltekkesbandung.ac.id"),
        "Gunakan email kampus (@poltekkesbandung.ac.id)",
      ),
  })
  .refine((data) => data.isAnonymous || (data.reporterName?.trim().length ?? 0) >= 3, {
    message: "Nama wajib diisi bila tidak melapor secara anonim",
    path: ["reporterName"],
  });

export type ReportFormValues = z.infer<typeof reportSchema>;
