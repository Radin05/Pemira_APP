"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, ShieldCheck, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminUsers,
  ROLE_OPTIONS,
  ROLE_LABEL,
  type AdminUser,
} from "@/lib/api/admin.service";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

function RoleChecks({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (role: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ROLE_OPTIONS.map((r) => (
        <label
          key={r.value}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors",
            selected.includes(r.value)
              ? "border-primary bg-primary/5 text-primary"
              : "border-black/10 text-ink-muted hover:border-primary/40",
          )}
        >
          <input
            type="checkbox"
            checked={selected.includes(r.value)}
            onChange={() => onToggle(r.value)}
            className="size-4 accent-[var(--color-primary)]"
          />
          {r.label}
        </label>
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const me = useAuthStore((s) => s.user);
  const allowed = me?.roles.includes("ADMIN") ?? false;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ email: "", fullName: "", password: "", studyProgram: "" });
  const [newRoles, setNewRoles] = useState<string[]>(["HUKUM_SEKRETARIAT"]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit roles dialog
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await adminUsers.list());
    } catch {
      setError("Gagal memuat daftar pengguna.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [allowed, load]);

  async function createUser() {
    setFormError(null);
    if (form.password.length < 8 || newRoles.length === 0) {
      setFormError("Password minimal 8 karakter dan pilih minimal satu peran.");
      return;
    }
    setSaving(true);
    try {
      await adminUsers.create({ ...form, roles: newRoles });
      setCreateOpen(false);
      setForm({ email: "", fullName: "", password: "", studyProgram: "" });
      setNewRoles(["HUKUM_SEKRETARIAT"]);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Gagal membuat akun.");
    } finally {
      setSaving(false);
    }
  }

  async function saveRoles() {
    if (!editUser || editRoles.length === 0) return;
    setBusyId(editUser.id);
    try {
      await adminUsers.updateRoles(editUser.id, editRoles);
      setEditUser(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memperbarui peran.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(u: AdminUser) {
    setBusyId(u.id);
    setError(null);
    try {
      await adminUsers.setActive(u.id, !u.active);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengubah status.");
    } finally {
      setBusyId(null);
    }
  }

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-canvas-line bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-ink">Akses ditolak</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" /> Administrasi
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title text-ink">Kelola Pengguna</h1>
          <p className="mt-2 text-ink-muted">Akun staf KP dan mahasiswa terverifikasi.</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="h-10 rounded-full bg-primary px-5 font-semibold text-ink-inverse hover:bg-primary/90"
        >
          <UserPlus className="mr-2 size-4" /> Tambah Pengguna
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-canvas-line bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/10 bg-black/[0.02] text-xs tracking-wide text-ink-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nama</th>
                  <th className="px-5 py-3 font-semibold">Peran</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-black/[0.015]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">
                        {u.fullName}
                        {u.id === me?.id && (
                          <span className="ml-2 text-xs text-primary">(Anda)</span>
                        )}
                      </p>
                      <p className="text-xs text-ink-muted">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            {ROLE_LABEL[r] ?? r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          u.active ? "bg-success/10 text-success" : "bg-black/5 text-ink-muted",
                        )}
                      >
                        {u.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setEditUser(u);
                            setEditRoles(u.roles);
                          }}
                          disabled={busyId === u.id}
                          className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                        >
                          Peran
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={busyId === u.id || u.id === me?.id}
                          className={cn(
                            "text-xs font-semibold hover:underline disabled:opacity-40",
                            u.active ? "text-danger" : "text-success",
                          )}
                        >
                          {busyId === u.id ? "…" : u.active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog tambah pengguna */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Tambah Pengguna
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@poltekkesbandung.ac.id"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="fullName">Nama lengkap</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Password sementara</Label>
              <Input
                id="password"
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimal 8 karakter"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Peran</Label>
              <div className="mt-1.5">
                <RoleChecks
                  selected={newRoles}
                  onToggle={(r) =>
                    setNewRoles((prev) =>
                      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
                    )
                  }
                />
              </div>
            </div>
            {formError && <p className="text-sm text-danger">{formError}</p>}
          </div>
          <DialogFooter>
            <Button
              onClick={createUser}
              disabled={saving}
              className="rounded-full bg-primary px-6 font-semibold text-ink-inverse hover:bg-primary/90 disabled:opacity-60"
            >
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Buat Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog edit peran */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" /> Peran — {editUser?.fullName}
            </DialogTitle>
          </DialogHeader>
          <RoleChecks
            selected={editRoles}
            onToggle={(r) =>
              setEditRoles((prev) =>
                prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
              )
            }
          />
          <DialogFooter>
            <Button
              onClick={saveRoles}
              disabled={busyId === editUser?.id || editRoles.length === 0}
              className="rounded-full bg-primary px-6 font-semibold text-ink-inverse hover:bg-primary/90 disabled:opacity-60"
            >
              Simpan Peran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
