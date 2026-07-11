"use client";

import Link from "next/link";
import { Users, UserSquare2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const CARDS = [
  {
    href: "/admin/users",
    icon: Users,
    title: "Kelola Pengguna",
    description: "Buat akun staf KP, atur peran, dan aktif-nonaktifkan akun.",
  },
  {
    href: "/admin/kandidat",
    icon: UserSquare2,
    title: "Kelola Kandidat",
    description: "Kelola data calon Ketua BEM dan anggota BPM beserta visi-misinya.",
  },
];

export default function AdminPage() {
  const allowed = useAuthStore((s) => s.user?.roles.includes("ADMIN") ?? false);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-canvas-line bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-ink">Akses ditolak</p>
        <p className="mt-2 text-sm text-ink-muted">Halaman ini khusus administrator.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-page-title text-ink">Administrasi</h1>
      <p className="mt-2 text-ink-muted">Kelola pengguna sistem dan data kandidat.</p>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {CARDS.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block h-full rounded-2xl border border-canvas-line bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary">
                <c.icon className="size-5 text-ink-inverse" aria-hidden />
              </span>
              <h2 className="mt-5 text-lg font-bold text-ink">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.description}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-primary">
                Buka →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
