"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2, UserSquare2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  adminCandidates,
  type Candidate,
  type CandidatePayload,
} from "@/lib/api/admin.service";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const EMPTY: CandidatePayload = {
  candidateNumber: 1,
  electionType: "BEM",
  chiefName: "",
  viceName: "",
  studyProgram: "",
  photoUrl: "",
  vision: "",
  mission: "",
  workPrograms: "",
  active: true,
};

export default function AdminKandidatPage() {
  const allowed = useAuthStore((s) => s.user?.roles.includes("ADMIN") ?? false);
  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<CandidatePayload>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminCandidates.list());
    } catch {
      setError("Gagal memuat kandidat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [allowed, load]);

  function startNew() {
    setForm(EMPTY);
    setEditingId("new");
    setError(null);
  }
  function startEdit(c: Candidate) {
    setForm({
      candidateNumber: c.candidateNumber,
      electionType: c.electionType,
      chiefName: c.chiefName,
      viceName: c.viceName ?? "",
      studyProgram: c.studyProgram ?? "",
      photoUrl: c.photoUrl ?? "",
      vision: c.vision ?? "",
      mission: c.mission ?? "",
      workPrograms: c.workPrograms ?? "",
      active: c.active,
    });
    setEditingId(c.id);
    setError(null);
  }

  async function save() {
    if (form.chiefName.trim().length < 3) {
      setError("Nama ketua wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId === "new") await adminCandidates.create(form);
      else if (editingId != null) await adminCandidates.update(editingId, form);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan kandidat.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Hapus kandidat ini?")) return;
    try {
      await adminCandidates.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus.");
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
          <h1 className="text-page-title text-ink">Kelola Kandidat</h1>
          <p className="mt-2 text-ink-muted">Calon Ketua BEM dan anggota BPM.</p>
        </div>
        {editingId === null && (
          <Button
            onClick={startNew}
            className="h-10 rounded-full bg-primary px-5 font-semibold text-ink-inverse hover:bg-primary/90"
          >
            <Plus className="mr-2 size-4" /> Tambah Kandidat
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Form tambah/edit */}
      {editingId !== null && (
        <div className="mt-6 rounded-2xl border border-canvas-line bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-ink">
            {editingId === "new" ? "Kandidat Baru" : "Edit Kandidat"}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="num">Nomor urut</Label>
              <Input
                id="num"
                type="number"
                min={1}
                value={form.candidateNumber}
                onChange={(e) => setForm({ ...form, candidateNumber: Number(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="type">Jenis pemilihan</Label>
              <select
                id="type"
                value={form.electionType}
                onChange={(e) =>
                  setForm({ ...form, electionType: e.target.value as "BEM" | "BPM" })
                }
                className="mt-1.5 h-9 w-full rounded-md border border-black/15 bg-white px-3 text-sm"
              >
                <option value="BEM">BEM (Ketua)</option>
                <option value="BPM">BPM (Anggota)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="chief">Nama ketua / calon</Label>
              <Input
                id="chief"
                value={form.chiefName}
                onChange={(e) => setForm({ ...form, chiefName: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="vice">Nama wakil (opsional)</Label>
              <Input
                id="vice"
                value={form.viceName}
                onChange={(e) => setForm({ ...form, viceName: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="prodi">Program studi</Label>
              <Input
                id="prodi"
                value={form.studyProgram}
                onChange={(e) => setForm({ ...form, studyProgram: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="vision">Visi</Label>
              <Textarea
                id="vision"
                rows={2}
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                className="mt-1.5 resize-y"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="mission">Misi</Label>
              <Textarea
                id="mission"
                rows={3}
                value={form.mission}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                className="mt-1.5 resize-y"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="wp">Program kerja</Label>
              <Textarea
                id="wp"
                rows={3}
                value={form.workPrograms}
                onChange={(e) => setForm({ ...form, workPrograms: e.target.value })}
                className="mt-1.5 resize-y"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="size-4 accent-[var(--color-primary)]"
              />
              Tampilkan ke publik (aktif)
            </label>
          </div>

          <div className="mt-5 flex gap-3 border-t border-black/10 pt-5">
            <Button
              onClick={save}
              disabled={saving}
              className="h-10 rounded-full bg-primary px-6 font-semibold text-ink-inverse hover:bg-primary/90 disabled:opacity-60"
            >
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Simpan
            </Button>
            <Button
              onClick={() => setEditingId(null)}
              variant="outline"
              className="h-10 rounded-full border-black/15 bg-transparent px-6 font-semibold text-ink-muted hover:bg-black/5"
            >
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Daftar */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-7 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-canvas-line bg-white p-10 text-center shadow-sm">
            <UserSquare2 className="mx-auto size-9 text-ink-muted/40" aria-hidden />
            <p className="mt-3 text-sm text-ink-muted">Belum ada kandidat.</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {items.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-canvas-line bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-ink-inverse">
                      {c.candidateNumber}
                    </span>
                    <div>
                      <p className="font-bold text-ink">{c.chiefName}</p>
                      {c.viceName && <p className="text-sm text-ink-muted">& {c.viceName}</p>}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      c.electionType === "BEM"
                        ? "bg-primary/10 text-primary"
                        : "bg-gold/15 text-gold",
                    )}
                  >
                    {c.electionType}
                  </span>
                </div>
                {c.studyProgram && (
                  <p className="mt-3 text-xs text-ink-muted">{c.studyProgram}</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      c.active ? "text-success" : "text-ink-muted",
                    )}
                  >
                    {c.active ? "Aktif" : "Nonaktif"}
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(c)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Pencil className="size-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline"
                    >
                      <Trash2 className="size-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
