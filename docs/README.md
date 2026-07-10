# Dokumentasi PEMIRA KM Poltekkes Kemenkes Bandung 2025

Rantai dokumen perencanaan, dibaca berurutan:

| # | Dokumen | Isi |
|---|---|---|
| 1 | [PRD](01-PRD.md) | Masalah, goals & non-goals, persona, 30+ user story dengan acceptance criteria, state machine, NFR, risiko, rencana rilis |
| 2 | [ERD](02-ERD.md) | 15 tabel, keputusan desain data, constraint & trigger, index, rencana migrasi Flyway |
| 3 | [Arsitektur](03-ARCHITECTURE.md) | 7 ADR, kontrak API lengkap, keamanan upload, deployment, observability |
| — | [Arsitektur Teknis](../ARSITEKTUR-PEMIRA.md) | *(dokumen awal)* struktur folder, coding style, service pattern, design system |
| 4 | [Task Breakdown](04-TASK-BREAKDOWN.md) | 10 epic, ~90 task ber-ID dengan estimasi, dependensi, dan jalur kritis |
| 5 | [Rencana Testing](05-TESTING-PLAN.md) | Piramida test, test yang wajib ada, skenario E2E, uji beban, gate CI |

**Mulai dari mana:** `T-01-01` di Task Breakdown. Jalur kritis melewati `T-04-03` (transisi status atomik) — kerjakan itu lebih awal daripada yang terasa nyaman.
