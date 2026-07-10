"use client";

import { useRef, useState } from "react";
import { FileText, Film, ImageIcon, Paperclip, UploadCloud, X } from "lucide-react";
import {
  ALLOWED_EVIDENCE_EXT,
  ALLOWED_EVIDENCE_TYPES,
  MAX_EVIDENCE_FILES,
  MAX_EVIDENCE_SIZE_BYTES,
  MAX_EVIDENCE_SIZE_MB,
  formatFileSize,
} from "@/lib/constant/evidence";
import { cn } from "@/lib/utils";

function fileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Film;
  return FileText;
}

type EvidenceDropzoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

export function EvidenceDropzone({ files, onChange, disabled }: EvidenceDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [rejections, setRejections] = useState<string[]>([]);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const errors: string[] = [];
    const accepted: File[] = [...files];

    for (const file of Array.from(incoming)) {
      if (accepted.length >= MAX_EVIDENCE_FILES) {
        errors.push(`Maksimal ${MAX_EVIDENCE_FILES} berkas. "${file.name}" tidak ditambahkan.`);
        continue;
      }
      if (!ALLOWED_EVIDENCE_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" bertipe tidak didukung.`);
        continue;
      }
      if (file.size > MAX_EVIDENCE_SIZE_BYTES) {
        errors.push(`"${file.name}" melebihi ${MAX_EVIDENCE_SIZE_MB} MB.`);
        continue;
      }
      // Cegah duplikat berdasarkan nama + ukuran.
      if (accepted.some((f) => f.name === file.name && f.size === file.size)) continue;
      accepted.push(file);
    }

    setRejections(errors);
    onChange(accepted);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Unggah bukti"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver ? "border-gold bg-gold/10" : "border-white/20 hover:border-gold/50",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <UploadCloud className="size-8 text-gold" aria-hidden />
        <p className="mt-3 text-sm font-medium text-ink-inverse">
          Seret berkas ke sini, atau klik untuk memilih
        </p>
        <p className="mt-1 text-xs text-ink-inverse/50">
          JPG, PNG, WEBP, MP4, atau PDF · maks {MAX_EVIDENCE_SIZE_MB} MB · hingga{" "}
          {MAX_EVIDENCE_FILES} berkas
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_EVIDENCE_EXT}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {rejections.length > 0 && (
        <ul className="mt-3 space-y-1">
          {rejections.map((r, i) => (
            <li key={i} className="text-xs text-danger">
              {r}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => {
            const Icon = fileIcon(file.type);
            return (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
              >
                <Icon className="size-5 shrink-0 text-gold" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-inverse">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-ink-inverse/50">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label={`Hapus ${file.name}`}
                  className="shrink-0 rounded-md p-1 text-ink-inverse/60 hover:bg-danger/20 hover:text-danger"
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 flex items-center gap-2 text-xs text-ink-inverse/50">
        <Paperclip className="size-3.5" aria-hidden />
        Bukti disimpan dengan checksum sehingga tidak dapat diubah setelah dikirim.
      </p>
    </div>
  );
}
