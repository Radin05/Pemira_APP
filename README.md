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
pemira-frontend/   Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui
pemira-backend/    Spring Boot 3.5.16 + Java 17 + PostgreSQL
docs/              Dokumen perencanaan
```

## Prasyarat

| Tool | Versi | Catatan |
|---|---|---|
| Node.js | ≥ 20 | Frontend |
| JDK | 17 | Backend. Maven **tidak perlu** di-install — pakai `./mvnw` |
| PostgreSQL | 16 | Database. Dev lokal: database `pemira_app` di port `5435` |
| Docker | terbaru | Hanya untuk Testcontainers (integration test). **Opsional** sampai EPIC-02 selesai |

## Menjalankan

Aplikasi ini **dua proses terpisah** yang harus jalan bersamaan. `npm run dev` saja
**tidak cukup** — itu hanya menyalakan frontend. Buka dua terminal:

```bash
# Terminal 1 — Backend (Spring Boot, port 8080)
cd pemira-backend
./mvnw spring-boot:run
# atau dari root: npm run dev:be

# Terminal 2 — Frontend (Next.js, port 3000)
cd pemira-frontend
npm run dev
# atau dari root: npm run dev
```

Selain itu, **PostgreSQL harus sudah berjalan** dengan database `pemira_app`.
Backend menyambung ke `127.0.0.1:5435` secara default (bisa dioverride lewat env var
`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`).

Verifikasi backend hidup:
- Ping: <http://localhost:8080/api/v1/public/ping>
- Health: <http://localhost:8080/actuator/health>
- Swagger UI: <http://localhost:8080/swagger-ui.html>

## Status Pengerjaan

Progres per epic ada di [Task Breakdown](docs/04-TASK-BREAKDOWN.md).

Frontend halaman publik dan fondasi backend (config, exception handler, security dasar)
sudah jalan. Selanjutnya: EPIC-02 (autentikasi) dan modul laporan.

## Konvensi

- Commit: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Branch: `feat/T-XX-YY-deskripsi-singkat` (pakai ID task)
- Semua UI dan pesan error dalam Bahasa Indonesia
