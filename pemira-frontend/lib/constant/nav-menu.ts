export type NavItem = {
  label: string;
  href: string;
};

/** Menu navbar halaman publik — ARSITEKTUR-PEMIRA.md §7.3. */
export const NAV_MENU: readonly NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Info Pemira", href: "/info" },
  { label: "Aturan Main", href: "/aturan" },
  { label: "Lapor Pelanggaran", href: "/lapor" },
  { label: "Status Laporan", href: "/status" },
  { label: "Transparansi", href: "/publikasi" },
  { label: "Tentang KP", href: "/tentang" },
] as const;
