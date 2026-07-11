# Task Breakdown — PEMIRA KM Poltekkes Kemenkes Bandung 2025

Cara baca:
- **ID** `T-<epic>-<urut>`. **BE** = backend, **FE** = frontend, **DB** = database, **OPS** = infra/CI.
- **Est** dalam jam kerja efektif (1 hari ≈ 6 jam). Total di bawah ~308 jam ≈ **51 hari-orang**.
- **Dep** = task yang harus selesai lebih dulu.
- Setiap task yang menghasilkan kode punya baris **Test** — testnya bagian dari task, bukan pekerjaan terpisah yang ditunda ke akhir.

> Sebelumnya: [Arsitektur](03-ARCHITECTURE.md) · Selanjutnya: [Rencana Testing](05-TESTING-PLAN.md)

---

## EPIC-01 — Fondasi & Infrastruktur (28 j)

| ID | Task | Tipe | Est | Dep |
|---|---|---|---|---|
| T-01-01 | ✅ Inisialisasi repo (monorepo `pemira-backend/` + `pemira-frontend/`), `.gitignore`, `.editorconfig`, README | OPS | 2 | — |
| T-01-02 | ✅ Bootstrap **Spring Boot 3.5.16** (**Java 17**, Maven Wrapper `./mvnw`): `pom.xml` dengan web, jpa, validation, security, postgres, flyway, lombok, mapstruct, springdoc | BE | 3 | T-01-01 |
| T-01-03 | ✅ Bootstrap **Next.js 16** App Router + TypeScript strict + **Tailwind v4** + shadcn/ui | FE | 3 | T-01-01 |
| T-01-04 | 🔵 `docker-compose.yml` untuk Postgres 16 + Redis 7 + MailHog — **DITUNDA**: dev pakai Postgres lokal user (`pemira_app` @ 5435). Docker hanya perlu untuk Testcontainers | OPS | 2 | T-01-01 |
| T-01-05 | ✅ Konfigurasi profil `application.yml` / `-dev` / `-prod`; semua secret lewat env var | BE | 2 | T-01-02 |
| T-01-06 | ✅ `ApiResponse<T>`, `PagedResponse<T>`, `GlobalExceptionHandler` + exception kustom (`ResourceNotFound`, `BadRequest`, `Forbidden`, `IllegalStateTransition`, `RateLimitExceeded`) | BE | 4 | T-01-02 |
| | └ **Test**: tiap exception termap ke HTTP status & kode error yang benar (`@WebMvcTest`) — *belum ditulis* | | | |
| T-01-07 | ✅ Filter `RequestIdFilter` (id per request → MDC + header `X-Request-Id`). Logback JSON encoder *belum* | BE | 3 | T-01-06 |
| T-01-08 | Setup Spotless + google-java-format; ESLint + Prettier; Husky + lint-staged | OPS | 3 | T-01-02, T-01-03 |
| T-01-09 | ✅ Setup Swagger/OpenAPI (springdoc) — UI di `/swagger-ui.html`. Grouping per modul + security scheme bearer menyusul di EPIC-02 | BE | 2 | T-01-02 |
| T-01-10 | GitHub Actions: workflow lint + test + build untuk BE & FE | OPS | 4 | T-01-08 |

**Exit criteria:** ✅ `./mvnw spring-boot:run` + `npm run dev` jalan; `/actuator/health` UP; Swagger UI terbuka; backend tersambung ke `pemira_app`. Belum: CI, formatter, JSON logging.

---

## EPIC-02 — Autentikasi & Otorisasi (34 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-02-01 | ✅ Migrasi **V2** (users setelah reports): `users`, `roles`, `user_roles`, `refresh_tokens`, `otp_codes` + FK `reports.reporter_id`→users | DB | 3 | — | — |
| T-02-02 | ✅ Seed 5 role di V2. Akun staf uji lewat `DevDataSeeder` (profil dev, password `Test@1234`) | DB | 1 | T-02-01 | — |
| T-02-03 | ✅ Entity `User` (ManyToMany roles), `Role`, `RefreshToken`, `OtpCode` + repository | BE | 3 | T-02-01 | — |
| T-02-04 | ✅ `JwtService` (jjwt HS256, claim `sub`, `roles`, `email`, `exp`, TTL 15 mnt) | BE | 3 | T-02-03 | US-203 |
| | └ **Test**: JUnit belum ditulis (diverifikasi manual: token valid parse, kadaluarsa/tanda tangan rusak → anonim) | | | | |
| T-02-05 | ✅ `JwtAuthFilter` + `UserPrincipal` + `SecurityConfig` (stateless, CORS, entry point 401, matcher publik vs terlindungi) | BE | 5 | T-02-04 | US-205 |
| T-02-06 | ✅ `POST /auth/login` staf: BCrypt cost 12, `failed_login_count`, kunci 15 menit setelah 5× gagal, pesan seragam | BE | 4 | T-02-05 | US-202 |
| T-02-07 | ✅ `POST /auth/otp/request` + `/otp/verify`: kode 6 digit di-hash, TTL 10 mnt, maks 5 percobaan, respons seragam. **OTP dicetak ke log dev** (SMTP belum ada — T-09-03/04) | BE | 5 | T-02-05 | US-201 |
| T-02-08 | ✅ `POST /auth/refresh` rotasi + deteksi reuse (token revoked dipakai lagi → revoke seluruh chain) | BE | 4 | T-02-04 | US-203 |
| T-02-09 | ✅ `POST /auth/logout` (revoke + clear cookie) + `GET /auth/me` | BE | 2 | T-02-08 | US-204 |
| T-02-10 | 🟡 `@EnableMethodSecurity` aktif; endpoint terlindungi butuh token (401 tanpa). `@PreAuthorize` per-role & matriks test belum (menyusul saat endpoint role-spesifik EPIC-05/06/07) | BE | 3 | T-02-05 | US-205 |
| T-02-11 | ✅ FE `lib/api/client.ts` (fetch + Bearer + 401 → auto-refresh → retry + credentials cookie) | FE | 5 | — | US-203 |
| T-02-12 | ✅ FE `store/auth.store.ts` (Zustand, token di memori, bootstrap silent-refresh), `auth.service.ts`, halaman `/login` (staf) + `/masuk` (OTP mahasiswa) + shell `/dashboard` dengan filter role | FE | 6 | T-02-11 | US-201/202 |
| T-02-13 | 🔵 **`proxy.ts` guard edge DITUNDA** — di dev, frontend (`:3000`) & backend (`:8080`) beda origin, cookie refresh httpOnly milik backend tak terlihat oleh middleware Next. Guard nyata: **sisi klien di `(dashboard)/layout.tsx`** (redirect ke `/login` bila tak ada sesi) + `@PreAuthorize` backend. Sesuai ADR-010 (proxy hanya optimistic) | FE | 3 | T-02-12 | US-205 |

**Exit criteria:** ✅ Staf login (email+password) → dashboard sesuai role; mahasiswa OTP → dashboard; `/dashboard` tanpa sesi → redirect `/login`; token kadaluarsa auto-refresh; endpoint terlindungi 401 tanpa token. Diverifikasi end-to-end (Playwright + curl). Belum: `@PreAuthorize` per-role granular, JUnit, SMTP OTP.

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
| T-04-01 | ✅ Migrasi **V1** (bukan V4 — modul laporan dibangun lebih dulu): `reports`, `report_evidences`, `report_status_history` + CHECK constraint + trigger append-only. Penyimpangan: FK ke users/candidates ditunda (tabel belum ada); `reported_candidate_text` menggantikan FK; `reporter_npm_hash` untuk lookup | DB | 4 | — | — |
| | └ **Test**: ✅ diverifikasi manual (UPDATE/DELETE history & evidence ditolak trigger). Test JUnit belum ditulis | | | | |
| T-04-02 | ✅ Enum `ReportStatus`, `ReportCategory`; kelas `ReportStateMachine` (tabel transisi + role) | BE | 4 | T-01-06 | ADR-002 |
| | └ **Test**: parameterized state machine — *belum ditulis* (butuh Testcontainers utk yg DB) | | | | |
| T-04-03 | 🟡 Pembuatan awal + baris history pertama (null→DITERIMA) dalam satu `@Transactional` sudah ada di submit. **Belum**: `ReportStatusService.transition()` ber-guard untuk perubahan status berikutnya (claim/verdict/approve) — dikerjakan saat EPIC-05/06 | BE | 4 | T-04-02 | Invarian #2 |
| T-04-04 | 🟡 `FileStorageService`: validasi ukuran+tipe, SHA-256 streaming server-side, nama UUID, cegah path traversal. **Ditunda**: magic-byte via Tika + storage S3/Cloudinary (kini disk lokal `./storage/evidence`) | BE | 6 | T-01-05 | US-402 |
| T-04-05 | ✅ Generator `ticket_code` `PMR-2025-XXXXX` (5 digit acak SecureRandom, cek unik ke DB) | BE | 2 | T-04-01 | US-403 |
| T-04-06 | 🟡 `EncryptionService` AES-256-GCM (IV acak per enkripsi) — identitas pelapor terenkripsi at-rest. **Belum**: `ReporterIdentityService` (dekripsi + tulis audit) — butuh tabel audit (EPIC-09) | BE | 5 | T-04-01 | US-405, ADR-006 |
| T-04-07 | ✅ `POST /api/v1/reports` (multipart: payload JSON + bukti) — validasi Bean Validation, enkripsi identitas, status awal DITERIMA, tulis history + simpan bukti atomik. **Sementara publik** (TODO: kunci ke MAHASISWA saat auth ada). Notifikasi role belum | BE | 5 | T-04-03, T-04-05, T-04-06 | US-401 |
| T-04-08 | Bukti diunggah bersama submit (bagian multipart yang sama), bukan endpoint terpisah — cukup untuk alur mahasiswa | BE | 4 | T-04-04, T-04-07 | US-402 |
| T-04-09 | Rate limit Redis (3/NPM/24 j). Belum — kolom `reporter_npm_hash` sudah disiapkan untuk ini | BE | 4 | T-04-07 | US-406 |
| T-04-10 | ✅ `GET /api/v1/reports/track?ticket=&npm=` — hanya status + timeline (ADR-007). Verifikasi kepemilikan lewat hash NPM; tiket tak ada / NPM salah → 404 seragam (cegah probing) | BE | 3 | T-04-07 | US-404 |
| T-04-11 | ✅ FE `/lapor` — react-hook-form + zod, dropzone bukti, **tersambung ke API nyata** (bukan lagi preview) | FE | 8 | T-04-07 | US-401/402 |
| T-04-12 | ✅ FE panel sukses + `/status` — **tersambung ke API nyata** (`GET /reports/track`) | FE | 5 | T-04-10 | US-403/404 |
| T-04-13 | ✅ `lib/api/client.ts` (fetch + ApiError), `report.service.ts`, `report.schema.ts`, `report.types.ts` | FE | 3 | — | — |

**Exit criteria:** ✅ Mahasiswa submit laporan (+ bukti) lewat `/lapor` → dapat kode tiket → data tersimpan di `pemira_app` (reports + history + evidence) → lacak di `/status`. Diverifikasi end-to-end. Belum: rate limit, notifikasi, lock role MAHASISWA.

---

## EPIC-05 — Investigasi (38 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-05-01 | 🟡 Migrasi **V3** `investigations` (kolom lengkap ERD). `investigation_attachments`, `violation_rules`, `investigation_rules` belum (dipakai saat laporan resmi ke Ketua / EPIC-06) | DB | 3 | — | — |
| T-05-02 | Seed `violation_rules` dari tata tertib KP — belum (pasal masih di `lib/constant/rules.ts` frontend) | DB | 2 | T-05-01 | — |
| T-05-03 | ✅ Entity `Investigation` + repository | BE | 3 | T-05-01 | — |
| T-05-04 | ✅ `GET /reports` (`@PreAuthorize HUKUM_SEKRETARIAT`) — filter status/kategori, pagination. Identitas pelapor TIDAK disertakan (aman default) | BE | 4 | T-04-07 | US-501 |
| T-05-05 | ✅ `POST /reports/{id}/claim` — `DITERIMA→DIVERIFIKASI` + assignee, guard anti-dobel-claim (409). `ReportStatusService.transition` ber-guard dibangun di sini (T-04-03) | BE | 3 | — | US-502 |
| T-05-06 | ✅ `GET /reports/{id}` detail: kronologi + bukti (metadata + checksum) + riwayat + hasil investigasi. Pre-signed URL unduh bukti belum | BE | 4 | — | US-503 |
| T-05-07 | 🟡 `POST /reports/{id}/verdict` — VALID/HOAX + catatan ≥50 char, hanya oleh assignee. VALID→VALID, HOAX→HOAX. Lanjutan `HOAX→DICATAT_HOAX→SELESAI` & guard "sudah punya verdict" belum | BE | 5 | — | US-504 |
| T-05-08 | Laporan resmi ke Ketua (findings, pasal, rekomendasi) + submit → MENUNGGU_PERSETUJUAN_KETUA. Belum (EPIC-06) | BE | 5 | T-05-07 | US-505 |
| T-05-09 | Revisi laporan ditolak. Belum (EPIC-06) | BE | 3 | T-06-03 | US-506 |
| T-05-10 | ✅ FE `/hukum-sekretariat` — tabel antrean (filter status, badge, tombol Ambil). Pakai tabel HTML biasa, bukan TanStack | FE | 7 | T-02-12, T-05-04 | US-501/502 |
| T-05-11 | 🟡 FE `/hukum-sekretariat/[reportId]` — detail, bukti (metadata + checksum), timeline status. Galeri/lightbox/unduh belum (butuh endpoint unduh) | FE | 6 | T-05-06 | US-503 |
| T-05-12 | 🟡 FE form verdict (VALID/HOAX + catatan, hanya assignee). Form laporan resmi ke Ketua belum (EPIC-06) | FE | 6 | T-05-07 | US-504/505 |

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

## EPIC-08 — Halaman Publik & Transparansi (33 j)

| ID | Task | Tipe | Est | Dep | Story |
|---|---|---|---|---|---|
| T-08-01 | ✅ Design system: token warna & tipografi di **`app/globals.css` blok `@theme`** (Tailwind v4 tidak lagi pakai `tailwind.config.ts`), font Inter via `next/font` | FE | 3 | T-01-03 | §7 arsitektur |
| T-08-02 | ✅ `components/ui/` dasar via shadcn: Button, Input, Textarea, Select, Card, Dialog, Badge, Skeleton, Label, Toast (sonner). Plus `components/domain/report/status-badge.tsx` + `lib/types/report.types.ts` | FE | 6 | T-08-01 | — |
| T-08-03 | ✅ `components/layout/navbar.tsx` (dark bar + pill gold aktif) dari konstanta `NAV_MENU`, versi mobile (drawer), route group `app/(public)/` | FE | 4 | T-08-02 | §7.3 |
| T-08-04 | Landing `/` — hero navy+gold, timeline PEMIRA (dari `app_settings`), CTA lapor | FE | 5 | T-08-03 | US-801 |
| T-08-05 | `/kandidat` grid + `/kandidat/[id]` detail visi/misi/proker (SSR/ISR) | FE | 4 | T-03-02, T-08-03 | US-802 |
| T-08-06 | ✅ `/aturan` — daftar pasal dari `lib/constant/rules.ts` (bukan markdown; kode pasal harus sinkron dengan `violation_rules.code`), anchor per pasal, daftar isi sticky | FE | 3 | T-08-03 | US-803 |
| T-08-07 | `GET /public/publications` + `/{slug}` (backend) | BE | 3 | T-07-06 | US-804 |
| T-08-08 | 🟡 `/publikasi` (Transparansi) — dashboard statistik + feed berita/putusan. **UI selesai** dengan data placeholder (`lib/constant/publications.ts`); belum baca dari API. Filter & halaman detail `[slug]` menyusul | FE | 5 | T-08-07 | US-804 |
| T-08-13 | 🟡 Halaman `/info#formulir` — unduh template Formulir A-1 (Laporan) & A-2 (Temuan). File `.txt` placeholder, ganti dengan formulir resmi KP | FE | 1 | T-08-12 | — |
| T-08-09 | ✅ `/tentang` profil KP, mandat, struktur divisi, alur penanganan laporan | FE | 2 | T-08-03 | — |
| T-08-12 | ✅ `/info` timeline tahapan PEMIRA + `components/layout/page-header.tsx` (header seragam halaman publik) | FE | 3 | T-08-03 | — |
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
| 08 Halaman Publik | 33 | 247 |
| 09 Notifikasi & Audit | 24 | 271 |
| 10 Hardening & Deploy | 37 | 308 |
| **Total** | **308 j** | **≈ 51 hari-orang** |

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
