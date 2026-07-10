import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { REPORT_STATUS_LABEL, type ReportStatus } from "@/lib/types/report.types";

/**
 * Pemetaan status → warna. Hijau = selesai baik, merah = ditolak/hoaks,
 * emas = masih berjalan, abu = arsip. Lihat palet di ARSITEKTUR-PEMIRA.md §7.1.
 *
 * Status "berjalan" memakai teks navy di atas tint emas, bukan teks emas:
 * #D4A72C di atas latar terang hanya ~1.9:1, jauh di bawah ambang WCAG AA 4.5:1.
 *
 * Record<ReportStatus, ...> memaksa setiap status punya gaya: menambah status
 * baru di report.types.ts tanpa menambahkannya di sini akan gagal typecheck.
 */
const STATUS_STYLE: Record<ReportStatus, string> = {
  DITERIMA: "bg-warning/15 text-navy border-warning/50",
  DIVERIFIKASI: "bg-warning/15 text-navy border-warning/50",
  DIBUAT_LAPORAN_INVESTIGASI: "bg-warning/15 text-navy border-warning/50",
  MENUNGGU_PERSETUJUAN_KETUA: "bg-warning/15 text-navy border-warning/50",

  VALID: "bg-success/15 text-success border-success/40",
  DISETUJUI: "bg-success/15 text-success border-success/40",
  DIPUBLIKASI: "bg-success/15 text-success border-success/40",

  HOAX: "bg-danger/10 text-danger border-danger/40",
  DICATAT_HOAX: "bg-danger/10 text-danger border-danger/40",
  DITOLAK: "bg-danger/10 text-danger border-danger/40",
  DITARIK: "bg-danger/10 text-danger border-danger/40",

  SELESAI: "bg-muted text-ink-muted border-border",
};

type StatusBadgeProps = {
  status: ReportStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status], className)}>
      {REPORT_STATUS_LABEL[status]}
    </Badge>
  );
}
