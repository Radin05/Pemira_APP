# Task Breakdown — PEMIRA IKM UI 2025

Cara baca:
- **ID** `T-<epic>-<urut>`. **BE** = backend, **FE** = frontend, **DB** = database, **OPS** = infra/CI.
- **Est** dalam jam kerja efektif (1 hari ≈ 6 jam). Total di bawah ~305 jam ≈ **51 hari-orang**.
- **Dep** = task yang harus selesai lebih dulu.
- Setiap task yang menghasilkan kode punya baris **Test** — testnya bagian dari task, bukan pekerjaan terpisah yang ditunda ke akhir.

> Sebelumnya: [Arsitektur](03-ARCHITECTURE.md) · Selanjutnya: [Rencana Testing](05-TESTING-PLAN.md)

---

## EPIC-01 — Fondasi & Infrastruktur (28 j)

| ID | Task | Tipe | Est | Dep |
|---|---|---|---|---|
| T-01-01 | ✅ Inisialisasi repo (monorepo `pemira-backend/` + `pemira-frontend/`), `.gitignore`, `.editorconfig`, README | OPS | 2 | — |
| T-01-02 | Bootstrap Spring Boot 3.5 (**Java 17**, pakai Maven Wrapper `./mvnw`): `pom.xml` dengan web, jpa, validation, security, postgres, flyway, lombok, mapstruct, springdoc | BE | 3 | T-01-01 |
| T-01-03 | ✅ Bootstrap **Next.js 16** App Router + TypeScript strict + **Tailwind v4** + shadcn/ui | FE | 3 | T-01-01 |
| T-01-04 | ⛔ `docker-compose.yml` untuk Postgres 16 + Redis 7 + MailHog (SMTP lokal) — **BLOCKER: Docker belum ter-install di mesin dev** | OPS | 2 | T-01-01 |
| T-01-05 | Konfigurasi profil `application.yml` / `-dev` / `-prod`; semua secret lewat env var | BE | 2 | T-01-02 |
| T-01-06 | `ApiResponse<T>`, `PagedResponse<T>`, `GlobalExceptionHandler` + exception kustom (`ResourceNotFound`, `BadRequest`, `Forbidden`, `IllegalStateTransition`, `RateLimitExceeded`) | BE | 4 | T-01-02 |
| | └ **Test**: tiap exception termap ke HTTP status & kode error yang benar (`@WebMvcTest`) | | | |
| T-01-07 | Filter `RequestIdFilter` (generate ULID, masukkan ke MDC + response header) + Logback JSON encoder | BE | 3 | T-01-06 |
| T-01-08 | Setup Spotless + google-java-format; ESLint + Prettier; Husky + lint-staged | OPS | 3 | T-01-02, T-01-03 |
| T-01-09 | Setup Swagger/OpenAPI (springdoc), grouping per modul, security scheme bearer | BE | 2 | T-01-02 |
| T-01-10 | GitHub Actions: workflow lint + test + build untuk BE & FE | OPS | 4 | T-01-08 |

**Exit criteria:** `docker compose up` + `mvn spring-boot:run` + `npm run dev` jalan; `/actuator/health` hijau; Swagger UI terbuka; CI hijau di PR pertama.

---

## EPIC-02 — Autentikasi & Otorisasi (34 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-02-01 | Migrasi V1: `users`, `roles`, `user_roles`, `refresh_tokens`, `otp_codes` | DB | 3 | T-01-05 | — |
| T-02-02 | Migrasi V2: seed 5 role | DB | 1 | T-02-01 | — |
| T-02-03 | Entity `User`, `Role`, `RefreshToken`, `OtpCode` + `UserRepository`, `RoleRepository`, `RefreshTokenRepository` | BE | 3 | T-02-01 | — |
| T-02-04 | `JwtTokenProvider` (sign/verify HS256, claim `sub`, `roles`, `jti`, `exp`) | BE | 3 | T-02-03 | US-203 |
| | └ **Test**: token valid ter-parse; token kadaluarsa ditolak; signature dimodifikasi ditolak | | | | |
| T-02-05 | `JwtAuthFilter` + `CustomUserDetailsService` + `SecurityConfig` (stateless, CORS, matcher publik vs terlindungi) | BE | 5 | T-02-04 | US-205 |
| T-02-06 | `POST /auth/login` staf: BCrypt cost 12, hitung `failed_login_count`, kunci 15 menit setelah 5× gagal | BE | 4 | T-02-05 | US-202 |
| | └ **Test**: sukses; password salah; akun terkunci; akun nonaktif | | | | |
| T-02-07 | `POST /auth/otp/request` + `POST /auth/otp/verify`: kode 6 digit di-hash, TTL 10 menit, maks 5 percobaan, respons seragam untuk email tak terdaftar | BE | 5 | T-02-05 | US-201 |
| | └ **Test**: OTP benar; OTP salah; kadaluarsa; percobaan ke-6 ditolak; OTP dipakai ulang ditolak | | | | |
| T-02-08 | `POST /auth/refresh` dengan rotasi + deteksi reuse (token lama dipakai → revoke seluruh chain) | BE | 4 | T-02-04 | US-203 |
| | └ **Test**: rotasi normal; reuse token lama me-revoke keluarga token | | | | |
| T-02-09 | `POST /auth/logout` + `GET /auth/me` | BE | 2 | T-02-08 | US-204 |
| T-02-10 | `@PreAuthorize` di semua controller; integration test matriks role × endpoint | BE | 3 | T-02-05 | US-205 |
| T-02-11 | FE: `apiClient` (axios) + interceptor 401 → auto-refresh → retry, dengan antrean supaya refresh hanya sekali walau banyak request paralel | FE | 5 | T-01-03 | US-203 |
| T-02-12 | FE: `auth.store.ts` (Zustand, access token di memori), `useAuth`, halaman `/login`, halaman OTP | FE | 6 | T-02-11 | US-201/202 |
| T-02-13 | FE: **`proxy.ts`** role guard di edge (Next 16 mengganti nama `middleware.ts` → `proxy.ts`) + guard kedua di `layout.tsx` dashboard. Docs Next eksplisit: proxy hanya untuk *optimistic check*, otorisasi sebenarnya tetap di server | FE | 3 | T-02-12 | US-205 |

**Exit criteria:** Staf bisa login → akses dashboard sesuai role. Mahasiswa bisa verifikasi OTP. Akses lintas role dijawab 403. Token kadaluarsa di-refresh tanpa user sadar.

---

## EPIC-03 — Manajemen User & Kandidat (22 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-03-01 | Migrasi V3: `candidates` | DB | 1 | T-02-01 | — |
| T-03-02 | Modul `candidate`: entity, repo, service (+impl), controller CRUD, DTO, MapStruct mapper | BE | 5 | T-03-01 | US-802 |
| | └ **Test**: CRUD; hanya `ADMIN` yang bisa tulis; publik bisa baca | | | | |
| T-03-03 | Upload foto kandidat ke storage (reuse `FileStorageService` dari T-04-04) | BE | 2 | T-04-04 | US-802 |
| T-03-04 | Modul `user` admin: list/create/update, aktif-nonaktif, assign & revoke role | BE | 5 | T-02-03 | — |
| | └ **Test**: admin tidak bisa mencabut role `ADMIN` terakhir (jangan sampai terkunci di luar sistem) | | | | |
| T-03-05 | FE: dashboard admin — tabel user, dialog assign role | FE | 5 | T-02-13, T-03-04 | — |
| T-03-06 | FE: dashboard admin — CRUD kandidat + upload foto + editor visi/misi/proker | FE | 4 | T-03-02 | — |

---

## EPIC-04 — Pelaporan oleh Mahasiswa (46 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-04-01 | Migrasi V4: `reports`, `report_evidences`, `report_status_history` + semua CHECK constraint + trigger append-only | DB | 4 | T-03-01 | — |
| | └ **Test**: `UPDATE` ke `report_status_history` gagal; checksum non-hex ditolak; `is_anonymous` + `reporter_id` terisi ditolak | | | | |
| T-04-02 | Enum `ReportStatus`, `ReportCategory`; kelas `ReportStateMachine` (tabel transisi + role yang berwenang) | BE | 4 | T-01-06 | ADR-002 |
| | └ **Test**: parameterized — semua transisi legal lolos, semua kombinasi ilegal melempar `IllegalStateTransitionException`; `SELESAI` terminal | | | | |
| T-04-03 | `ReportStatusService.transition(reportId, to, actor, note)` — update ber-guard + insert history dalam satu `@Transactional` | BE | 4 | T-04-02 | Invarian #2 |
| | └ **Test**: rollback insert history → status ikut batal; guard mencegah update ganda (test konkuren 2 thread) | | | | |
| T-04-04 | `FileStorageService` (S3/Cloudinary): validasi ukuran, magic-byte lewat Tika, hitung SHA-256 streaming, nama file UUID | BE | 6 | T-01-05 | US-402 |
| | └ **Test**: `.jpg` yang isinya PHP ditolak; file 11 MB ditolak (413); checksum cocok dengan hash yang dihitung manual | | | | |
| T-04-05 | Generator `ticket_code` `PMR-2025-XXXXX` unik & tidak mudah ditebak | BE | 2 | T-04-01 | US-403 |
| T-04-06 | `EncryptionService` AES-256-GCM + `ReporterIdentityService` (dekripsi menulis audit log) | BE | 5 | T-04-01 | US-405, ADR-006 |
| | └ **Test**: enkripsi→dekripsi round-trip; ciphertext beda tiap kali (IV acak); dekripsi menulis 1 baris audit | | | | |
| T-04-07 | `POST /reports` — validasi, enkripsi identitas bila anonim, status awal `DITERIMA`, tulis history, kirim notifikasi ke role | BE | 5 | T-04-03, T-04-05, T-04-06 | US-401 |
| | └ **Test**: happy path; kronologi < 50 char → 400; kandidat tidak dikenal → 400 | | | | |
| T-04-08 | `POST /reports/{id}/evidences` multipart, maks 5 file, hanya pemilik & hanya saat status `DITERIMA` | BE | 4 | T-04-04, T-04-07 | US-402 |
| | └ **Test**: file ke-6 ditolak; user lain → 403; status `DIVERIFIKASI` → 409 | | | | |
| T-04-09 | Rate limit: `RateLimitService` Redis (3/NPM/24 j) + verifikasi ulang `count(*)` ke Postgres bila Redis mati | BE | 4 | T-04-07 | US-406 |
| | └ **Test**: laporan ke-4 dalam 24 jam → 429; Redis down → tetap terbatas lewat Postgres | | | | |
| T-04-10 | `GET /reports/track` — hanya status + timeline, tanpa isi laporan (ADR-007); `GET /reports/mine` | BE | 3 | T-04-07 | US-404 |
| | └ **Test**: response tidak mengandung `description`, `findings`, atau identitas | | | | |
| T-04-11 | FE: halaman `/lapor` — react-hook-form + zod, field bertahap, dropzone bukti dengan preview & progress | FE | 8 | T-02-12 | US-401/402 |
| T-04-12 | FE: halaman sukses (tampilkan kode tiket, tombol salin) + halaman `/status` (input tiket+NPM → timeline vertikal) | FE | 5 | T-04-10 | US-403/404 |
| T-04-13 | FE: `report.service.ts`, `report.types.ts`, `report.schema.ts` (zod), hook `useSubmitReport`, `useTrackReport` | FE | 3 | T-02-11 | — |

**Exit criteria:** Mahasiswa submit laporan + 3 bukti → dapat kode tiket → cek status di `/status` → laporan muncul di antrean investigator.

---

## EPIC-05 — Investigasi (38 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-05-01 | Migrasi V5: `investigations`, `investigation_attachments`, `violation_rules`, `investigation_rules` | DB | 3 | T-04-01 | — |
| T-05-02 | Migrasi V10: seed `violation_rules` dari tata tertib KP | DB | 2 | T-05-01 | — |
| T-05-03 | Entity + repository modul `investigation` | BE | 3 | T-05-01 | — |
| T-05-04 | `GET /reports` — filter status/kategori/rentang tanggal, pagination, sort | BE | 4 | T-04-07 | US-501 |
| | └ **Test**: filter gabungan; pagination benar; investigator tidak melihat identitas pelapor anonim | | | | |
| T-05-05 | `POST /reports/{id}/claim` — `DITERIMA → DIVERIFIKASI`, set assignee, guard anti-dobel-claim | BE | 3 | T-04-03 | US-502 |
| | └ **Test**: claim kedua → 409 (test konkuren) | | | | |
| T-05-06 | `GET /reports/{id}` detail: bukti + pre-signed URL + checksum + riwayat status | BE | 4 | T-04-08 | US-503 |
| T-05-07 | `POST /investigations` — verdict `VALID`/`HOAX`, catatan ≥50 char. `HOAX` → `DICATAT_HOAX` → `SELESAI` | BE | 5 | T-04-03, T-05-03 | US-504 |
| | └ **Test**: VALID→status VALID; HOAX→SELESAI; catatan pendek → 400; laporan sudah punya investigasi → 409 | | | | |
| T-05-08 | `PUT /investigations/{id}/report` (findings, pasal dilanggar, rekomendasi sanksi) + `POST /investigations/{id}/submit` → `MENUNGGU_PERSETUJUAN_KETUA` | BE | 5 | T-05-07 | US-505 |
| | └ **Test**: submit tanpa findings → 400; submit laporan berstatus HOAX → 409; investigator lain → 403 | | | | |
| T-05-09 | Revisi laporan yang ditolak: `DITOLAK → DIBUAT_LAPORAN_INVESTIGASI`, `revision_number++` | BE | 3 | T-06-03 | US-506 |
| | └ **Test**: `approvals` lama tetap ada setelah revisi | | | | |
| T-05-10 | FE: dashboard `/hukum-sekretariat` — tabel antrean (TanStack Table), filter, badge status, tombol claim | FE | 7 | T-02-13, T-05-04 | US-501/502 |
| T-05-11 | FE: `/hukum-sekretariat/[reportId]` — detail, galeri bukti (lightbox gambar, player video, unduh PDF), tampilkan checksum, timeline status | FE | 6 | T-05-06 | US-503 |
| T-05-12 | FE: form verdict (VALID/HOAX + catatan) & form laporan investigasi (multi-select pasal, rekomendasi sanksi), konfirmasi sebelum submit | FE | 6 | T-05-08 | US-504/505 |

---

## EPIC-06 — Persetujuan Ketua KP (20 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-06-01 | Migrasi V6 bagian `approvals` | DB | 2 | T-05-01 | — |
| T-06-02 | `GET /investigations?status=PENDING` — urut terlama, join data laporan | BE | 3 | T-05-08 | US-601 |
| T-06-03 | `POST /investigations/{id}/approve` dan `/reject` (alasan ≥30 char), tulis `approvals`, transisi status, notifikasi | BE | 5 | T-04-03, T-06-01 | US-602/603 |
| | └ **Test**: approve→DISETUJUI + notif PDD; reject tanpa alasan→400; approve dua kali→409; role selain KETUA_KP→403 | | | | |
| T-06-04 | `GET /approvals/mine` riwayat keputusan | BE | 2 | T-06-03 | US-604 |
| T-06-05 | FE: dashboard `/ketua` — antrean + badge jumlah pending di sidebar | FE | 4 | T-02-13, T-06-02 | US-601 |
| T-06-06 | FE: `/ketua/[investigationId]` — ringkasan laporan + bukti + tombol Setujui / Tolak (dialog alasan wajib) | FE | 4 | T-06-03 | US-602/603 |

---

## EPIC-07 — Publikasi PDD (26 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-07-01 | Migrasi V6 bagian `publications` (+ unique slug) | DB | 2 | T-06-01 | — |
| T-07-02 | Modul `publication`: entity, repo, service, mapper | BE | 3 | T-07-01 | — |
| T-07-03 | `GET /publications/ready` — `DISETUJUI` & belum punya publikasi | BE | 2 | T-06-03 | US-701 |
| T-07-04 | `POST /publications` + `PUT /publications/{id}` (draft), generator slug unik dari judul | BE | 4 | T-07-02 | US-702 |
| | └ **Test**: dua judul sama → slug berbeda (`-2`); edit publikasi yang sudah `PUBLISHED` → 409 | | | | |
| T-07-05 | Upload banner publikasi (reuse `FileStorageService`) | BE | 2 | T-04-04 | US-702 |
| T-07-06 | `POST /publications/{id}/publish` → `DIPUBLIKASI`; `/withdraw` (alasan wajib) → `DITARIK` | BE | 4 | T-04-03, T-07-04 | US-703/705 |
| | └ **Test**: publish dari investigasi belum disetujui→409; withdraw menghilangkan dari feed publik | | | | |
| T-07-07 | Validasi `instagram_url` (harus host instagram.com) | BE | 1 | T-07-04 | US-704 |
| T-07-08 | FE: dashboard `/pdd` — daftar siap-publish + daftar draft | FE | 4 | T-02-13, T-07-03 | US-701 |
| T-07-09 | FE: `/pdd/[publicationId]` — editor draft (judul, ringkasan, konten, upload banner, URL IG), preview kartu, tombol Publish/Withdraw | FE | 6 | T-07-06 | US-702–705 |

---

## EPIC-08 — Halaman Publik & Transparansi (30 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-08-01 | ✅ Design system: token warna & tipografi di **`app/globals.css` blok `@theme`** (Tailwind v4 tidak lagi pakai `tailwind.config.ts`), font Inter via `next/font` | FE | 3 | T-01-03 | §7 arsitektur |
| T-08-02 | `components/ui/` dasar: Button, Input, Textarea, Select, Badge status, Card, Dialog, Toast, Skeleton | FE | 6 | T-08-01 | — |
| T-08-03 | `components/layout/Navbar.tsx` (dark bar + pill gold aktif) dari konstanta `NAV_MENU`, versi mobile (drawer) | FE | 4 | T-08-02 | §7.3 |
| T-08-04 | Landing `/` — hero navy+gold, timeline PEMIRA (dari `app_settings`), CTA lapor | FE | 5 | T-08-03 | US-801 |
| T-08-05 | `/kandidat` grid + `/kandidat/[id]` detail visi/misi/proker (SSR/ISR) | FE | 4 | T-03-02, T-08-03 | US-802 |
| T-08-06 | `/aturan` — render markdown tata tertib, anchor per pasal, daftar isi | FE | 3 | T-08-03 | US-803 |
| T-08-07 | `GET /public/publications` + `/{slug}` (backend) | BE | 3 | T-07-06 | US-804 |
| T-08-08 | `/publikasi` feed kartu + filter kandidat/kategori; `/publikasi/[slug]` detail + tautan IG | FE | 5 | T-08-07 | US-804 |
| T-08-09 | `/tentang` profil KP & struktur divisi | FE | 2 | T-08-03 | — |
| T-08-10 | SEO: metadata per halaman, OG image, `sitemap.xml`, `robots.txt` | FE | 3 | T-08-08 | — |
| T-08-11 | Audit aksesibilitas: kontras ≥4.5:1, navigasi keyboard, `aria-label`, focus ring | FE | 3 | T-08-08 | NFR |

---

## EPIC-09 — Notifikasi & Audit Trail (24 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-09-01 | Migrasi V7: `notifications`, `audit_logs`, `outbox_messages` + trigger append-only audit | DB | 3 | T-04-01 | — |
| T-09-02 | `NotificationService.notifyUser()` / `.notifyRole()`; `GET /notifications`, `POST /{id}/read` | BE | 4 | T-09-01 | US-901 |
| | └ **Test**: user hanya melihat notif miliknya atau role-nya; menandai baca notif orang lain → 403 | | | | |
| T-09-03 | Pola Outbox: tulis pesan dalam transaksi bisnis; `@Scheduled` poller kirim email dengan retry + backoff | BE | 6 | T-09-01 | ADR-004, US-902 |
| | └ **Test**: SMTP mati → laporan tetap tersimpan, pesan tetap di outbox, dicoba lagi | | | | |
| T-09-04 | Template email (OTP, laporan diterima, status berubah) — HTML + plaintext fallback | BE | 4 | T-09-03 | US-902 |
| T-09-05 | `@Aspect` / `ApplicationEventListener` untuk menulis `audit_logs` di semua aksi tulis; simpan `old_value`/`new_value` JSONB | BE | 5 | T-09-01 | US-903 |
| | └ **Test**: setiap perubahan status menghasilkan 1 baris audit; audit tidak bisa di-update/delete | | | | |
| T-09-06 | `GET /audit-logs` (ADMIN, KETUA_KP) dengan filter entitas + FE halaman audit sederhana | BE+FE | 4 | T-09-05 | US-903 |
| T-09-07 | FE: komponen bell + badge unread + polling 60 detik + dropdown daftar notifikasi | FE | 4 | T-09-02 | US-901 |

---

## EPIC-10 — Hardening, QA & Deployment (37 j)

| ID | Task | Tipe | Est | Dep |
|---|---|---|---|---|
| T-10-01 | Security header: HSTS, CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` | BE+FE | 3 | EPIC-08 |
| T-10-02 | Rate limit IP global (100 req/menit) di filter + Cloudflare rule | BE+OPS | 3 | T-04-09 |
| T-10-03 | Captcha (Turnstile/hCaptcha) di form `/lapor` dan `/auth/otp/request` | BE+FE | 4 | T-04-11 |
| T-10-04 | Dependency scan: OWASP dependency-check (Maven) + `npm audit` di CI, gagal bila ada HIGH | OPS | 3 | T-01-10 |
| T-10-05 | Sweep manual OWASP Top 10 (A01 broken access control, A02 crypto, A03 injection, A05 misconfig, A07 auth) | BE | 6 | EPIC-07 |
| T-10-06 | Uji beban k6: 500 VU di `/publikasi` & `/api/reports`, verifikasi p95 sesuai NFR | OPS | 4 | EPIC-08 |
| T-10-07 | E2E Playwright: 5 alur utama (lihat [Rencana Testing](05-TESTING-PLAN.md) §4) | QA | 8 | EPIC-07 |
| T-10-08 | Backup Postgres harian + uji restore ke database kosong (backup yang belum pernah di-restore bukan backup) | OPS | 3 | T-01-04 |
| T-10-09 | Dockerfile multi-stage BE; deploy staging; smoke test otomatis | OPS | 4 | T-01-10 |
| T-10-10 | Deploy produksi + Cloudflare + sertifikat TLS + `/actuator/prometheus` + alert | OPS | 4 | T-10-09 |
| T-10-11 | Seed data produksi: user staf KP, kandidat, `violation_rules`, `app_settings` | OPS | 2 | T-10-10 |
| T-10-12 | UAT bersama KP + perbaikan temuan; runbook operasional & panduan singkat per role | QA | 6 | T-10-10 |

---

## Ringkasan & Jalur Kritis

| Epic | Est (j) | Kumulatif |
|---|---|---|
| 01 Fondasi | 28 | 28 |
| 02 Auth | 34 | 62 |
| 03 User & Kandidat | 22 | 84 |
| 04 Pelaporan | 46 | 130 |
| 05 Investigasi | 38 | 168 |
| 06 Persetujuan | 20 | 188 |
| 07 Publikasi | 26 | 214 |
| 08 Halaman Publik | 30 | 244 |
| 09 Notifikasi & Audit | 24 | 268 |
| 10 Hardening & Deploy | 37 | 305 |
| **Total** | **305 j** | **≈ 51 hari-orang** |

**Jalur kritis** (tidak bisa diparalelkan):
```
T-01-02 → T-02-01 → T-02-05 → T-04-01 → T-04-02 → T-04-03 → T-04-07
        → T-05-07 → T-05-08 → T-06-03 → T-07-06 → T-08-07 → T-10-07 → T-10-10
```
`T-04-03` (transisi status atomik) menyentuh hampir semua epic setelahnya. Kerjakan lebih dulu dan dengan test paling ketat — bug di sini muncul sebagai data korup di semua modul.

**Yang bisa jalan paralel sejak awal:** EPIC-08 T-08-01/02/03 (design system) tidak bergantung pada backend sama sekali. Kalau ada 2 orang, satu mulai dari sana sementara satunya mengerjakan jalur kritis.

**Urutan sprint (2 minggu/sprint, asumsi 2 developer):**

| Sprint | Isi | Milestone |
|---|---|---|
| S1 | EPIC-01, EPIC-02 | M1 — Fondasi |
| S2 | EPIC-04 + T-08-01/02/03 | — |
| S3 | EPIC-05, EPIC-06 | M2 — Alur inti jalan ujung ke ujung |
| S4 | EPIC-07, EPIC-03, sisa EPIC-08 | M3 — Publikasi & publik |
| S5 | EPIC-09, EPIC-10, UAT | M4 — Produksi |

**Kalau waktu mepet, potong sesuai urutan ini** (semuanya P1/P2, tidak merusak alur inti): US-604 riwayat keputusan ketua → US-705 unpublish → US-506 revisi laporan ditolak → US-902 notifikasi email (in-app cukup) → US-502 claim laporan → US-405 laporan anonim.

**Yang TIDAK boleh dipotong walau mepet:** T-04-02/03 (state machine + transisi atomik), T-04-04 (validasi upload), T-09-05 (audit log), T-10-05 (sweep OWASP). Empat ini adalah alasan aplikasi ini ada — tanpa mereka, KP tidak punya alat bukti saat sengketa dan lebih baik pakai Google Form.
