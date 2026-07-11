"use client";

import Link from "next/link";
import { FileSearch, Gavel, Megaphone, ShieldCheck, Users } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

/**
 * Landing dashboard sementara. Kartu modul ditampilkan sesuai role. Dashboard
 * spesifik (antrean investigasi, persetujuan, publikasi) menyusul di EPIC-05/06/07.
 */
const MODULES = [
  {
    role: "HUKUM_SEKRETARIAT",
    href: "/hukum-sekretariat",
    icon: FileSearch,
    title: "Investigasi Laporan",
    description: "Antrean laporan masuk, cross-check bukti, tetapkan valid/hoaks.",
  },
  {
    role: "KETUA_KP",
    href: "/ketua",
    icon: Gavel,
    title: "Persetujuan",
    description: "Setujui atau tolak laporan investigasi yang menunggu keputusan.",
  },
  {
    role: "PDD",
    href: "/pdd",
    icon: Megaphone,
    title: "Publikasi",
    description: "Susun dan terbitkan putusan yang telah disetujui.",
  },
  {
    role: "ADMIN",
    href: "/admin",
    icon: Users,
    title: "Administrasi",
    description: "Kelola pengguna, peran, dan data kandidat.",
  },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const visible = MODULES.filter((m) => user.roles.includes(m.role));

  return (
    <div>
      <div className="flex items-center gap-3">
        <ShieldCheck className="size-7 text-primary" aria-hidden />
        <h1 className="text-page-title text-ink">Selamat datang, {user.fullName}</h1>
      </div>
      <p className="mt-2 text-ink-muted">
        Anda masuk sebagai <span className="font-semibold text-primary">{user.roles.join(", ")}</span>.
      </p>

      {visible.length > 0 ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => (
            <li key={m.role}>
              <Link
                href={m.href}
                className="block h-full rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary">
                  <m.icon className="size-5 text-ink-inverse" aria-hidden />
                </span>
                <h2 className="mt-5 text-lg font-bold text-ink">{m.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.description}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary">
                  Buka modul →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-2xl border border-black/10 bg-white p-8 text-center">
          <p className="text-ink-muted">
            Akun mahasiswa. Gunakan menu publik untuk melapor dan melacak laporan Anda.
          </p>
          <Link
            href="/lapor"
            className="mt-5 inline-block rounded-full bg-gold px-6 py-2.5 font-semibold text-navy-dark hover:bg-gold-light"
          >
            Lapor Pelanggaran
          </Link>
        </div>
      )}
    </div>
  );
}
