# PEMIRA KM Poltekkes Kemenkes Bandung 2025 — Sistem Pelaporan Pelanggaran

Kanal resmi tunggal untuk **pelaporan → investigasi → persetujuan → publikasi** pelanggaran PEMIRA, dengan jejak audit yang tidak bisa dimanipulasi.

> Ini **bukan** sistem e-voting. Aplikasi ini tidak menghitung suara.

## Dokumentasi

Baca berurutan sebelum menulis kode: **[docs/README.md](docs/README.md)**

| Dokumen | Isi |
|---|---|
| [PRD](docs/01-PRD.md) | Masalah, user story, state machine, NFR |
| [ERD](docs/02-ERD.md) | Skema database, constraint, index |
| [Arsitektur](docs/03-ARCHITECTURE.md) | ADR, kontrak API, deployment |
| [Task Breakdown](docs/04-TASK-BREAKDOWN.md) | 10 epic, ~90 task ber-ID |
| [Rencana Testing](docs/05-TESTING-PLAN.md) | Piramida test, E2E, gate CI |

## Struktur

```
pemira-frontend/   Next.js 15 + TypeScript + Tailwind + shadcn/ui
pemira-backend/    Spring Boot 3.5 + Java 17 + PostgreSQL   (belum dimulai)
docs/              Dokumen perencanaan
```

## Prasyarat

| Tool | Versi | Catatan |
|---|---|---|
| Node.js | ≥ 20 | Frontend |
| JDK | 17 | Backend. Maven **tidak perlu** di-install — pakai `./mvnw` |
| Docker | terbaru | Postgres + Redis + Testcontainers. **Belum di-setup** — lihat catatan di bawah |

## Menjalankan

```bash
# Frontend
cd pemira-frontend
npm install
npm run dev          # http://localhost:3000
```

Backend belum ada. Lihat `docs/04-TASK-BREAKDOWN.md` untuk urutan pengerjaan.

## Status Pengerjaan

Progres per epic ada di [Task Breakdown](docs/04-TASK-BREAKDOWN.md).

**Blocker aktif:** Docker belum ter-install. Ini harus diselesaikan sebelum EPIC-02 (Auth) karena
Testcontainers adalah fondasi strategi integration test — [Rencana Testing §1](docs/05-TESTING-PLAN.md)
melarang penggunaan H2 sebagai pengganti Postgres.

## Konvensi

- Commit: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Branch: `feat/T-XX-YY-deskripsi-singkat` (pakai ID task)
- Semua UI dan pesan error dalam Bahasa Indonesia
