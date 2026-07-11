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
    submissionMode: z.enum(["DIRECT", "TEMPLATE"]),
    category: z.enum(REPORT_CATEGORY, {
      message: "Pilih kategori pelanggaran",
    }).optional(),
    title: z.string().trim().max(150, "Judul maksimal 150 karakter").optional(),
    incidentDate: z
      .string()
      .optional()
      .refine(
        (v) => !v || new Date(v) <= new Date(),
        "Tanggal kejadian tidak boleh di masa depan",
      ),
    incidentLocation: z.string().trim().optional(),
    reportedCandidate: z.string().trim().max(150).optional(),
    description: z.string().trim().max(5000, "Kronologi maksimal 5000 karakter").optional(),
    isAnonymous: z.boolean(),
    reporterName: z.string().trim().max(100).optional(),
    reporterNpm: z
      .string()
      .trim()
      .regex(/^\d{6,}$/, "NPM berupa angka, minimal 6 digit"),
    reporterEmail: z.string().trim().email("Format email tidak valid"),
  })
  .refine((data) => data.submissionMode === "TEMPLATE" || !!data.category, {
    message: "Pilih kategori pelanggaran",
    path: ["category"],
  })
  .refine(
    (data) => data.submissionMode === "TEMPLATE" || (data.title?.trim().length ?? 0) >= 10,
    {
      message: "Judul minimal 10 karakter",
      path: ["title"],
    },
  )
  .refine((data) => data.submissionMode === "TEMPLATE" || !!data.incidentDate, {
    message: "Tanggal kejadian wajib diisi",
    path: ["incidentDate"],
  })
  .refine(
    (data) => data.submissionMode === "TEMPLATE" || (data.incidentLocation?.trim().length ?? 0) >= 3,
    {
      message: "Lokasi kejadian wajib diisi",
      path: ["incidentLocation"],
    },
  )
  .refine(
    (data) => data.submissionMode === "TEMPLATE" || (data.description?.trim().length ?? 0) >= 50,
    {
      message: "Kronologi minimal 50 karakter agar dapat ditindaklanjuti",
      path: ["description"],
    },
  )
  .refine((data) => data.isAnonymous || (data.reporterName?.trim().length ?? 0) >= 3, {
    message: "Nama wajib diisi bila tidak melapor secara anonim",
    path: ["reporterName"],
  });

export type ReportFormValues = z.infer<typeof reportSchema>;
