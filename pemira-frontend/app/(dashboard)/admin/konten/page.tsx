"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FileCog,
  FileText,
  Gavel,
  Network,
  Plus,
  RotateCcw,
  Save,
  ScrollText,
  Trash2,
} from "lucide-react";
import { adminContent, type ContentKey } from "@/lib/api/content.service";
import {
  DEFAULT_ATURAN_CONTENT,
  DEFAULT_INFO_CONTENT,
  DEFAULT_TENTANG_CONTENT,
  type AturanContent,
  type Division,
  type FormTemplate,
  type InfoContent,
  type ProcessStep,
  type TentangContent,
  type TimelinePhase,
  type ViolationRule,
} from "@/lib/constant/page-content";
import { REPORT_CATEGORY_LABEL, type ReportCategory } from "@/lib/types/report.types";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SECTIONS = [
  {
    key: "info",
    title: "Info Pemira",
    description: "Ubah jadwal/tahapan dan Instrumen & Formulir di /info.",
    template: DEFAULT_INFO_CONTENT,
  },
  {
    key: "aturan",
    title: "Aturan Main",
    description: "Ubah daftar pasal, kategori, isi aturan, dan sanksi di /aturan.",
    template: DEFAULT_ATURAN_CONTENT,
  },
  {
    key: "tentang",
    title: "Tentang KP",
    description: "Ubah mandat, Struktur Divisi, dan Alur Penanganan Laporan di /tentang.",
    template: DEFAULT_TENTANG_CONTENT,
  },
] as const;

type PageContent = InfoContent | AturanContent | TentangContent;

type SectionPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
};

const STATUS_OPTIONS: { value: TimelinePhase["status"]; label: string }[] = [
  { value: "akan-datang", label: "Akan Datang" },
  { value: "berlangsung", label: "Sedang Berlangsung" },
  { value: "selesai", label: "Selesai" },
];

const FORM_ICON_OPTIONS: { value: FormTemplate["icon"]; label: string }[] = [
  { value: "file", label: "Dokumen" },
  { value: "search", label: "Pencarian" },
];

const FORM_COLOR_OPTIONS = [
  { value: "bg-steel-deep", label: "Biru" },
  { value: "bg-maroon", label: "Merah" },
  { value: "bg-amber", label: "Kuning" },
];

const DIVISION_ICON_OPTIONS: { value: Division["icon"]; label: string }[] = [
  { value: "users", label: "Pengurus" },
  { value: "scroll", label: "Sekretariat" },
  { value: "gavel", label: "Hukum" },
  { value: "wallet", label: "Keuangan" },
  { value: "map", label: "Lapangan" },
  { value: "megaphone", label: "Publikasi" },
];

const CATEGORY_OPTIONS = Object.entries(REPORT_CATEGORY_LABEL) as [ReportCategory, string][];

function patchAt<T>(items: T[], index: number, patch: Partial<T>) {
  return items.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

function removeAt<T>(items: T[], index: number) {
  return items.filter((_, i) => i !== index);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-semibold text-ink">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SectionPanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  count,
  action,
  children,
}: SectionPanelProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-steel/20 bg-surface shadow-sm">
      <div className="border-b border-canvas-line bg-canvas/60 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber text-on-amber">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-steel-deep/10 px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-steel-deep uppercase">
                  {eyebrow}
                </span>
                {typeof count === "number" && (
                  <span className="rounded-full bg-surface px-2.5 py-1 text-[0.65rem] font-semibold text-ink-muted ring-1 ring-canvas-line">
                    {count} item
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-lg font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Block({ title, onRemove, children }: { title: string; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-canvas-line bg-ivory/60 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-semibold text-ink">{title}</p>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/10"
        >
          <Trash2 className="size-3.5" aria-hidden /> Hapus
        </button>
      </div>
      {children}
    </div>
  );
}

function AddButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-steel/30 bg-surface px-4 text-sm font-semibold text-steel-deep hover:bg-amber/15 sm:w-auto"
    >
      <Plus className="size-4" aria-hidden /> {children}
    </button>
  );
}

function InfoEditor({ value, onChange }: { value: InfoContent; onChange: (value: InfoContent) => void }) {
  return (
    <div className="space-y-6">
      <SectionPanel
        eyebrow="Halaman /info"
        title="Jadwal / Tahapan"
        description="Bagian ini tampil sebagai timeline tahapan Pemira. Ubah catatan, tanggal, status, dan deskripsi setiap tahap."
        icon={CalendarDays}
        count={value.timeline.length}
        action={
          <AddButton
            onClick={() =>
              onChange({
                ...value,
                timeline: [
                  ...value.timeline,
                  {
                    phase: "Tahap Baru",
                    period: "Tanggal belum ditentukan",
                    description: "Deskripsi tahap.",
                    status: "akan-datang",
                  },
                ],
              })
            }
          >
            Tambah Tahap
          </AddButton>
        }
      >
        <Field label="Catatan Jadwal">
          <Textarea value={value.note} onChange={(e) => onChange({ ...value, note: e.target.value })} />
        </Field>

        {value.timeline.map((item, index) => (
          <Block
            key={index}
            title={`Tahap ${index + 1}: ${item.phase || "Belum diberi nama"}`}
            onRemove={() => onChange({ ...value, timeline: removeAt(value.timeline, index) })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Tahap">
                <Input
                  value={item.phase}
                  onChange={(e) =>
                    onChange({ ...value, timeline: patchAt(value.timeline, index, { phase: e.target.value }) })
                  }
                />
              </Field>
              <Field label="Periode / Tanggal">
                <Input
                  value={item.period}
                  onChange={(e) =>
                    onChange({ ...value, timeline: patchAt(value.timeline, index, { period: e.target.value }) })
                  }
                />
              </Field>
              <Field label="Status">
                <select
                  value={item.status}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      timeline: patchAt(value.timeline, index, {
                        status: e.target.value as TimelinePhase["status"],
                      }),
                    })
                  }
                  className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Deskripsi">
                  <Textarea
                    value={item.description}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        timeline: patchAt(value.timeline, index, { description: e.target.value }),
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          </Block>
        ))}
      </SectionPanel>

      <SectionPanel
        eyebrow="Halaman /info"
        title="Instrumen & Formulir"
        description="Bagian ini tampil sebagai kartu unduhan formulir. Isi kode, judul, link file, ikon, dan deskripsi."
        icon={FileText}
        count={value.forms.length}
        action={
          <AddButton
            onClick={() =>
              onChange({
                ...value,
                forms: [
                  ...value.forms,
                  {
                    code: "A-3",
                    icon: "file",
                    iconBg: "bg-steel-deep",
                    title: "Formulir Baru",
                    description: "Deskripsi formulir.",
                    href: "/templates/formulir-baru.txt",
                  },
                ],
              })
            }
          >
            Tambah Formulir
          </AddButton>
        }
      >
        {value.forms.map((item, index) => (
          <Block
            key={index}
            title={`Formulir ${index + 1}: ${item.title || "Belum diberi judul"}`}
            onRemove={() => onChange({ ...value, forms: removeAt(value.forms, index) })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kode">
                <Input
                  value={item.code}
                  onChange={(e) => onChange({ ...value, forms: patchAt(value.forms, index, { code: e.target.value }) })}
                />
              </Field>
              <Field label="Judul">
                <Input
                  value={item.title}
                  onChange={(e) => onChange({ ...value, forms: patchAt(value.forms, index, { title: e.target.value }) })}
                />
              </Field>
              <Field label="Link File">
                <Input
                  value={item.href}
                  onChange={(e) => onChange({ ...value, forms: patchAt(value.forms, index, { href: e.target.value }) })}
                />
              </Field>
              <Field label="Ikon">
                <select
                  value={item.icon}
                  onChange={(e) =>
                    onChange({ ...value, forms: patchAt(value.forms, index, { icon: e.target.value as FormTemplate["icon"] }) })
                  }
                  className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                >
                  {FORM_ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Warna Ikon">
                <select
                  value={item.iconBg}
                  onChange={(e) => onChange({ ...value, forms: patchAt(value.forms, index, { iconBg: e.target.value }) })}
                  className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                >
                  {FORM_COLOR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Deskripsi">
                  <Textarea
                    value={item.description}
                    onChange={(e) =>
                      onChange({ ...value, forms: patchAt(value.forms, index, { description: e.target.value }) })
                    }
                  />
                </Field>
              </div>
            </div>
          </Block>
        ))}
      </SectionPanel>
    </div>
  );
}

function AturanEditor({ value, onChange }: { value: AturanContent; onChange: (value: AturanContent) => void }) {
  return (
    <div className="space-y-6">
      <SectionPanel
        eyebrow="Halaman /aturan"
        title="Catatan Halaman"
        description="Teks peringatan yang tampil di atas daftar aturan main."
        icon={ScrollText}
      >
        <Field label="Catatan Halaman Aturan">
          <Textarea value={value.notice} onChange={(e) => onChange({ ...value, notice: e.target.value })} />
        </Field>
      </SectionPanel>

      <SectionPanel
        eyebrow="Halaman /aturan"
        title="Daftar Aturan Main"
        description="Setiap item tampil sebagai kartu pasal lengkap dengan kategori laporan dan sanksi."
        icon={Gavel}
        count={value.rules.length}
        action={
          <AddButton
            onClick={() =>
              onChange({
                ...value,
                rules: [
                  ...value.rules,
                  {
                    code: "PASAL_BARU",
                    article: "Pasal Baru",
                    title: "Judul Aturan Baru",
                    description: "Isi aturan.",
                    category: "LAINNYA",
                    sanction: "Sanksi menyesuaikan keputusan KP.",
                  } satisfies ViolationRule,
                ],
              })
            }
          >
            Tambah Aturan
          </AddButton>
        }
      >
        {value.rules.map((item, index) => (
          <Block
            key={index}
            title={`${item.article || "Aturan"}: ${item.title || "Belum diberi judul"}`}
            onRemove={() => onChange({ ...value, rules: removeAt(value.rules, index) })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kode Internal">
                <Input
                  value={item.code}
                  onChange={(e) => onChange({ ...value, rules: patchAt(value.rules, index, { code: e.target.value }) })}
                />
              </Field>
              <Field label="Pasal">
                <Input
                  value={item.article}
                  onChange={(e) => onChange({ ...value, rules: patchAt(value.rules, index, { article: e.target.value }) })}
                />
              </Field>
              <Field label="Judul">
                <Input
                  value={item.title}
                  onChange={(e) => onChange({ ...value, rules: patchAt(value.rules, index, { title: e.target.value }) })}
                />
              </Field>
              <Field label="Kategori Laporan">
                <select
                  value={item.category}
                  onChange={(e) =>
                    onChange({ ...value, rules: patchAt(value.rules, index, { category: e.target.value as ReportCategory }) })
                  }
                  className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                >
                  {CATEGORY_OPTIONS.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Isi Aturan">
                  <Textarea
                    value={item.description}
                    onChange={(e) =>
                      onChange({ ...value, rules: patchAt(value.rules, index, { description: e.target.value }) })
                    }
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Sanksi">
                  <Textarea
                    value={item.sanction}
                    onChange={(e) => onChange({ ...value, rules: patchAt(value.rules, index, { sanction: e.target.value }) })}
                  />
                </Field>
              </div>
            </div>
          </Block>
        ))}
      </SectionPanel>
    </div>
  );
}

function TentangEditor({ value, onChange }: { value: TentangContent; onChange: (value: TentangContent) => void }) {
  return (
    <div className="space-y-6">
      <SectionPanel
        eyebrow="Halaman /tentang"
        title="Mandat Kami"
        description="Paragraf pembuka tentang tugas dan posisi Komite Pengawasan."
        icon={ScrollText}
        count={value.mandate.length}
        action={
          <AddButton onClick={() => onChange({ ...value, mandate: [...value.mandate, "Paragraf baru."] })}>
            Tambah Paragraf
          </AddButton>
        }
      >
        {value.mandate.map((paragraph, index) => (
          <Block
            key={index}
            title={`Paragraf ${index + 1}`}
            onRemove={() => onChange({ ...value, mandate: removeAt(value.mandate, index) })}
          >
            <Textarea
              value={paragraph}
              onChange={(e) =>
                onChange({
                  ...value,
                  mandate: value.mandate.map((p, i) => (i === index ? e.target.value : p)),
                })
              }
            />
          </Block>
        ))}
      </SectionPanel>

      <SectionPanel
        eyebrow="Halaman /tentang"
        title="Struktur Divisi"
        description="Setiap item tampil sebagai kartu divisi di halaman Tentang KP."
        icon={Network}
        count={value.divisions.length}
        action={
          <AddButton
            onClick={() =>
              onChange({
                ...value,
                divisions: [
                  ...value.divisions,
                  {
                    icon: "users",
                    name: "Divisi Baru",
                    role: "Peran singkat divisi.",
                    detail: "Detail tugas divisi.",
                  },
                ],
              })
            }
          >
            Tambah Divisi
          </AddButton>
        }
      >
        {value.divisions.map((item, index) => (
          <Block
            key={index}
            title={item.name || `Divisi ${index + 1}`}
            onRemove={() => onChange({ ...value, divisions: removeAt(value.divisions, index) })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Divisi">
                <Input
                  value={item.name}
                  onChange={(e) => onChange({ ...value, divisions: patchAt(value.divisions, index, { name: e.target.value }) })}
                />
              </Field>
              <Field label="Ikon">
                <select
                  value={item.icon}
                  onChange={(e) =>
                    onChange({ ...value, divisions: patchAt(value.divisions, index, { icon: e.target.value as Division["icon"] }) })
                  }
                  className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                >
                  {DIVISION_ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Peran Singkat">
                  <Input
                    value={item.role}
                    onChange={(e) => onChange({ ...value, divisions: patchAt(value.divisions, index, { role: e.target.value }) })}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Detail">
                  <Textarea
                    value={item.detail}
                    onChange={(e) => onChange({ ...value, divisions: patchAt(value.divisions, index, { detail: e.target.value }) })}
                  />
                </Field>
              </div>
            </div>
          </Block>
        ))}
      </SectionPanel>

      <SectionPanel
        eyebrow="Halaman /tentang"
        title="Alur Penanganan Laporan"
        description="Setiap item tampil sebagai langkah bernomor di bagian alur laporan."
        icon={CalendarDays}
        count={value.processSteps.length}
        action={
          <AddButton
            onClick={() =>
              onChange({
                ...value,
                processSteps: [
                  ...value.processSteps,
                  { title: "Langkah Baru", detail: "Detail langkah." } satisfies ProcessStep,
                ],
              })
            }
          >
            Tambah Langkah
          </AddButton>
        }
      >
        {value.processSteps.map((item, index) => (
          <Block
            key={index}
            title={`Langkah ${index + 1}: ${item.title || "Belum diberi judul"}`}
            onRemove={() => onChange({ ...value, processSteps: removeAt(value.processSteps, index) })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Judul Langkah">
                <Input
                  value={item.title}
                  onChange={(e) =>
                    onChange({ ...value, processSteps: patchAt(value.processSteps, index, { title: e.target.value }) })
                  }
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Detail">
                  <Textarea
                    value={item.detail}
                    onChange={(e) =>
                      onChange({ ...value, processSteps: patchAt(value.processSteps, index, { detail: e.target.value }) })
                    }
                  />
                </Field>
              </div>
            </div>
          </Block>
        ))}
      </SectionPanel>
    </div>
  );
}

export default function KontenPage() {
  const allowed = useAuthStore((s) => s.user?.roles.includes("ADMIN") ?? false);
  const [active, setActive] = useState<ContentKey>("info");
  const section = useMemo(() => SECTIONS.find((s) => s.key === active)!, [active]);
  const [content, setContent] = useState<PageContent>(DEFAULT_INFO_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    adminContent
      .get(active)
      .then((data) => alive && setContent((data ?? section.template) as PageContent))
      .catch(() => alive && setContent(section.template as PageContent))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [active, section.template]);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-canvas-line bg-surface p-8 text-center shadow-sm">
        <p className="font-semibold text-ink">Akses ditolak</p>
        <p className="mt-2 text-sm text-ink-muted">Halaman ini khusus administrator.</p>
      </div>
    );
  }

  async function save() {
    setSaving(true);
    try {
      await adminContent.save(active, content);
      toast.success("Konten disimpan");
    } catch {
      toast.error("Gagal menyimpan konten");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    try {
      await adminContent.reset(active);
      setContent(section.template as PageContent);
      toast.success("Dikembalikan ke template dummy");
    } catch {
      toast.error("Gagal reset konten");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-page-title text-ink">Pengaturan Konten</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Edit konten publik tanpa kode. Pilih halaman, ubah bagian yang ditandai, lalu simpan.
        </p>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => {
              if (s.key === active) return;
              setLoading(true);
              setActive(s.key);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active === s.key
                ? "bg-amber text-on-amber shadow-sm"
                : "border border-canvas-line bg-surface text-steel-deep hover:bg-amber/15"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-canvas-line bg-surface p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary">
              <FileCog className="size-5 text-ink-inverse" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">{section.title}</h2>
              <p className="mt-1 text-sm text-ink-muted">{section.description}</p>
            </div>
          </div>
          <div className="grid gap-2 min-[420px]:grid-cols-3 lg:flex lg:justify-end">
            <Button
              type="button"
              onClick={save}
              disabled={saving || loading}
              className="h-10 rounded-full bg-primary px-5 font-semibold text-ink-inverse hover:bg-primary/90"
            >
              <Save className="mr-2 size-4" aria-hidden />
              Simpan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setContent(section.template as PageContent)}
              disabled={saving || loading}
              className="h-10 rounded-full px-5 font-semibold"
            >
              Pakai Template
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={reset}
              disabled={saving || loading}
              className="h-10 rounded-full px-5 font-semibold"
            >
              <RotateCcw className="mr-2 size-4" aria-hidden />
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-6 border-t border-canvas-line pt-6">
          {loading ? (
            <p className="rounded-xl bg-canvas p-6 text-sm text-ink-muted">Memuat konten...</p>
          ) : active === "info" ? (
            <InfoEditor value={content as InfoContent} onChange={setContent} />
          ) : active === "aturan" ? (
            <AturanEditor value={content as AturanContent} onChange={setContent} />
          ) : (
            <TentangEditor value={content as TentangContent} onChange={setContent} />
          )}
        </div>
      </section>
    </div>
  );
}
