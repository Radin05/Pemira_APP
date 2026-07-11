# ERD — Sistem Pelaporan Pelanggaran PEMIRA KM Poltekkes Kemenkes Bandung 2025

Database: **PostgreSQL 16**. Migrasi: **Flyway**. Semua tabel `snake_case`, primary key `BIGSERIAL`, timestamp `TIMESTAMPTZ`.

> Dokumen sebelumnya: [PRD](01-PRD.md) · Selanjutnya: [Arsitektur](03-ARCHITECTURE.md)

---

## 1. Diagram Relasi

```mermaid
erDiagram
    users ||--o{ user_roles : "punya"
    roles ||--o{ user_roles : "diberikan ke"
    users ||--o{ refresh_tokens : "menerbitkan"
    users ||--o{ reports : "melaporkan (nullable)"
    users ||--o{ report_evidences : "mengunggah"
    users ||--o{ report_status_history : "memicu"
    users ||--o{ investigations : "menginvestigasi"
    users ||--o{ approvals : "memutuskan"
    users ||--o{ publications : "mempublikasikan"
    users ||--o{ notifications : "menerima"
    users ||--o{ audit_logs : "melakukan"

    candidates ||--o{ reports : "dilaporkan pada"

    reports ||--o{ report_evidences : "memiliki"
    reports ||--o{ report_status_history : "memiliki"
    reports ||--o| investigations : "menghasilkan"

    investigations ||--o{ investigation_rules : "melanggar"
    violation_rules ||--o{ investigation_rules : "dirujuk oleh"
    investigations ||--o{ investigation_attachments : "melampirkan"
    investigations ||--o{ approvals : "diputuskan lewat"
    investigations ||--o| publications : "dipublikasikan sebagai"

    otp_codes }o--|| users : "opsional milik"

    users {
        bigserial id PK
        varchar npm UK "nullable utk staf non-mhs"
        varchar email UK
        varchar full_name
        varchar password_hash "nullable utk mhs OTP-only"
        varchar study_program
        varchar phone
        boolean is_active
        timestamptz email_verified_at
        int failed_login_count
        timestamptz locked_until
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    roles {
        bigserial id PK
        varchar name UK "MAHASISWA|HUKUM_SEKRETARIAT|KETUA_KP|PDD|ADMIN"
        varchar description
    }

    user_roles {
        bigint user_id PK_FK
        bigint role_id PK_FK
        timestamptz assigned_at
        bigint assigned_by FK
    }

    refresh_tokens {
        bigserial id PK
        bigint user_id FK
        char token_hash "SHA-256, UK"
        timestamptz expires_at
        timestamptz revoked_at
        bigint replaced_by FK "rotasi token"
        varchar user_agent
        inet ip_address
        timestamptz created_at
    }

    otp_codes {
        bigserial id PK
        varchar email
        varchar npm
        char code_hash
        varchar purpose "LOGIN|VERIFY_EMAIL"
        smallint attempt_count
        timestamptz expires_at
        timestamptz consumed_at
        timestamptz created_at
    }

    candidates {
        bigserial id PK
        smallint candidate_number
        varchar election_type "BEM|BPM"
        varchar chief_name
        varchar vice_name
        varchar study_program
        varchar photo_url
        text vision
        text mission
        jsonb work_programs
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    reports {
        bigserial id PK
        varchar ticket_code UK "PMR-2025-XXXXX"
        bigint reporter_id FK "nullable"
        varchar reporter_name_enc "terenkripsi bila anonim"
        varchar reporter_npm_enc
        varchar reporter_email_enc
        boolean is_anonymous
        varchar category "KAMPANYE_DILUAR_JADWAL|MONEY_POLITICS|..."
        bigint reported_candidate_id FK "nullable"
        varchar title
        text description
        date incident_date
        varchar incident_location
        varchar status "enum ReportStatus"
        bigint assignee_id FK "nullable, investigator yg claim"
        timestamptz submitted_at
        timestamptz closed_at
        timestamptz created_at
        timestamptz updated_at
    }

    report_evidences {
        bigserial id PK
        bigint report_id FK
        varchar file_url
        varchar original_filename
        varchar mime_type
        bigint size_bytes
        char checksum_sha256 "64 hex"
        bigint uploaded_by FK
        timestamptz uploaded_at
    }

    report_status_history {
        bigserial id PK
        bigint report_id FK
        varchar from_status "nullable saat pertama"
        varchar to_status
        bigint actor_id FK
        text note
        timestamptz created_at
    }

    investigations {
        bigserial id PK
        bigint report_id FK UK "1:1 dgn report"
        bigint investigator_id FK
        varchar verdict "VALID|HOAX"
        text cross_check_note "temuan cross-check"
        text findings "isi laporan resmi"
        text recommendation
        varchar recommended_sanction "TEGURAN|PENGURANGAN_SUARA|DISKUALIFIKASI|TIDAK_ADA"
        smallint revision_number
        timestamptz verdict_at
        timestamptz submitted_to_chief_at
        timestamptz created_at
        timestamptz updated_at
    }

    investigation_attachments {
        bigserial id PK
        bigint investigation_id FK
        varchar file_url
        char checksum_sha256
        timestamptz uploaded_at
    }

    violation_rules {
        bigserial id PK
        varchar code UK "mis. PASAL_12_AYAT_2"
        varchar title
        text description
        varchar default_sanction
        boolean is_active
    }

    investigation_rules {
        bigint investigation_id PK_FK
        bigint rule_id PK_FK
    }

    approvals {
        bigserial id PK
        bigint investigation_id FK
        bigint approver_id FK
        varchar decision "APPROVED|REJECTED"
        text reason "wajib bila REJECTED"
        smallint revision_number "menunjuk revisi ke-berapa"
        timestamptz decided_at
    }

    publications {
        bigserial id PK
        bigint investigation_id FK UK
        bigint published_by FK
        varchar title
        varchar slug UK
        text summary
        text content
        varchar banner_url
        varchar instagram_url
        varchar status "DRAFT|PUBLISHED|WITHDRAWN"
        text withdrawn_reason
        timestamptz published_at
        timestamptz created_at
        timestamptz updated_at
    }

    notifications {
        bigserial id PK
        bigint user_id FK "nullable bila target role"
        varchar target_role "nullable"
        varchar type
        varchar title
        text message
        varchar reference_type "REPORT|INVESTIGATION|PUBLICATION"
        bigint reference_id
        timestamptz read_at
        timestamptz created_at
    }

    audit_logs {
        bigserial id PK
        bigint actor_id FK "nullable utk aksi sistem"
        varchar action "REPORT_SUBMIT|STATUS_CHANGE|..."
        varchar entity_type
        bigint entity_id
        jsonb old_value
        jsonb new_value
        inet ip_address
        varchar user_agent
        varchar request_id
        timestamptz created_at
    }

    app_settings {
        varchar key PK
        jsonb value
        timestamptz updated_at
        bigint updated_by FK
    }
```

---

## 2. Keputusan Desain Data (dan alasannya)

| # | Keputusan | Alasan |
|---|---|---|
| D1 | `investigations` 1:1 dengan `reports` (unique FK), bukan 1:N | Satu laporan hanya punya satu berkas investigasi. Revisi ditangani lewat `revision_number` + `approvals` yang menyimpan histori keputusan per revisi — bukan bikin baris investigasi baru. |
| D2 | `approvals` 1:N terhadap `investigations` | Ketua bisa reject → investigator revisi → ajukan lagi. Setiap keputusan tersimpan, tidak ditimpa. Keputusan aktif = baris dengan `decided_at` terbaru. |
| D3 | Status disimpan sebagai `VARCHAR` + `CHECK constraint`, bukan tipe `ENUM` Postgres | Menambah status baru di Postgres enum butuh `ALTER TYPE` yang merepotkan di Flyway & rollback. VARCHAR + CHECK lebih fleksibel dan tetap aman. |
| D4 | `report_status_history` append-only, tanpa `updated_at` | Ini alat bukti. Tidak boleh ada jalur update/delete di aplikasi. Ditegakkan lewat trigger `BEFORE UPDATE OR DELETE → RAISE EXCEPTION`. |
| D5 | Identitas pelapor disimpan **dua kali**: FK `reporter_id` + kolom `*_enc` | FK dipakai kalau pelapor punya akun. Kolom terenkripsi dipakai untuk laporan anonim / tanpa akun, sekaligus snapshot identitas saat submit (kalau user dihapus, bukti tetap utuh). |
| D6 | `checksum_sha256` dihitung **server-side** saat upload | Kalau dihitung di klien, penyerang bisa mengirim checksum palsu. Server yang menghitung = server yang menjamin. |
| D7 | `notifications` boleh punya `user_id` NULL bila `target_role` diisi | Notifikasi "laporan baru masuk" ditujukan ke seluruh divisi Hukum & Sekretariat, bukan satu orang. Menghindari fan-out N baris per staf. |
| D8 | Tidak ada `ON DELETE CASCADE` dari `users` ke `reports` | Menghapus user tidak boleh menghapus alat bukti. Pakai soft delete (`users.deleted_at`) dan `ON DELETE RESTRICT`. |
| D9 | `app_settings` sebagai key-value JSONB | Timeline PEMIRA, batas rate limit, dan toggle fitur bisa diubah admin tanpa deploy ulang. |
| D10 | `slug` di `publications` unik | URL publik `/publikasi/{slug}` lebih baik untuk SEO & tautan IG dibanding ID numerik. |

---

## 3. Enum & Constraint

```sql
-- ReportStatus (kolom reports.status)
CHECK (status IN (
  'DITERIMA', 'DIVERIFIKASI', 'VALID', 'HOAX', 'DICATAT_HOAX',
  'DIBUAT_LAPORAN_INVESTIGASI', 'MENUNGGU_PERSETUJUAN_KETUA',
  'DISETUJUI', 'DITOLAK', 'DIPUBLIKASI', 'DITARIK', 'SELESAI'
))

-- ReportCategory
CHECK (category IN (
  'KAMPANYE_DILUAR_JADWAL', 'POLITIK_UANG', 'KAMPANYE_HITAM',
  'PERUSAKAN_ATRIBUT', 'PELIBATAN_PIHAK_TERLARANG',
  'PELANGGARAN_MEDIA_SOSIAL', 'INTIMIDASI', 'LAINNYA'
))

-- Aturan integritas antar-kolom
ALTER TABLE reports ADD CONSTRAINT chk_anonymous_no_reporter_fk
  CHECK (NOT is_anonymous OR reporter_id IS NULL);

ALTER TABLE approvals ADD CONSTRAINT chk_reject_needs_reason
  CHECK (decision <> 'REJECTED' OR (reason IS NOT NULL AND length(trim(reason)) >= 30));

ALTER TABLE investigations ADD CONSTRAINT chk_verdict_valid
  CHECK (verdict IN ('VALID', 'HOAX'));

ALTER TABLE publications ADD CONSTRAINT chk_published_needs_timestamp
  CHECK (status <> 'PUBLISHED' OR published_at IS NOT NULL);

ALTER TABLE report_evidences ADD CONSTRAINT chk_checksum_format
  CHECK (checksum_sha256 ~ '^[a-f0-9]{64}$');

ALTER TABLE report_evidences ADD CONSTRAINT chk_size_limit
  CHECK (size_bytes > 0 AND size_bytes <= 10485760);  -- 10 MB
```

**Trigger append-only untuk tabel bukti:**
```sql
CREATE OR REPLACE FUNCTION forbid_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Tabel % bersifat append-only', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_history_immutable
  BEFORE UPDATE OR DELETE ON report_status_history
  FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TRIGGER trg_audit_immutable
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TRIGGER trg_evidence_immutable
  BEFORE UPDATE OR DELETE ON report_evidences
  FOR EACH ROW EXECUTE FUNCTION forbid_mutation();
```

---

## 4. Index

Index bukan hiasan — tiap baris di bawah ini menjawab satu query nyata dari PRD.

```sql
-- US-501: antrean laporan investigator, difilter status + urut terlama
CREATE INDEX idx_reports_status_submitted ON reports (status, submitted_at DESC);

-- US-404: tracking pakai kode tiket
CREATE UNIQUE INDEX idx_reports_ticket ON reports (ticket_code);

-- Dashboard "laporan yang saya tangani"
CREATE INDEX idx_reports_assignee ON reports (assignee_id) WHERE assignee_id IS NOT NULL;

-- US-406: rate limit 3 laporan/NPM/24 jam
CREATE INDEX idx_reports_reporter_submitted ON reports (reporter_id, submitted_at DESC);

-- Publik: feed publikasi terbaru
CREATE INDEX idx_publications_published ON publications (published_at DESC) WHERE status = 'PUBLISHED';
CREATE UNIQUE INDEX idx_publications_slug ON publications (slug);

-- Timeline status di halaman tracking
CREATE INDEX idx_history_report ON report_status_history (report_id, created_at);

-- US-601: antrean ketua
CREATE INDEX idx_investigations_pending ON investigations (submitted_to_chief_at)
  WHERE submitted_to_chief_at IS NOT NULL;

-- Bell notification: unread milik user / role
CREATE INDEX idx_notif_user_unread ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX idx_notif_role_unread ON notifications (target_role, created_at DESC) WHERE read_at IS NULL;

-- Lookup auth
CREATE UNIQUE INDEX idx_users_email ON users (lower(email)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_npm ON users (npm) WHERE npm IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_refresh_token_hash ON refresh_tokens (token_hash);

-- Audit: telusuri jejak satu entitas
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id, created_at DESC);
```

---

## 5. Rencana Migrasi Flyway

> ⚠️ **Urutan aktual berbeda dari rencana awal.** Modul laporan dibangun lebih dulu
> (permintaan user), jadi migrasi pertama yang benar-benar dibuat adalah
> `V1__create_reports.sql`, bukan users. Karena `reporter_id`/`assignee_id` belum
> punya FK ke `users` (dan `reported_candidate_text` menggantikan FK ke `candidates`),
> urutan ini aman. FK ditambahkan di migrasi berikutnya saat tabel tujuannya lahir.
> Tabel rencana di bawah adalah target akhir, bukan urutan penomoran yang terjadi.

**Sudah dibuat:**

| Versi | File | Isi |
|---|---|---|
| V1 | ✅ `V1__create_reports.sql` | `reports`, `report_evidences`, `report_status_history` + CHECK + trigger append-only |
| V2 | ✅ `V2__create_auth.sql` | `users`, `roles`, `user_roles`, `refresh_tokens`, `otp_codes` + seed 5 role + FK `reports.reporter_id` |
| V3 | ✅ `V3__create_investigations.sql` | `investigations` (1:1 dgn reports) |
| V4 | ✅ `V4__create_approvals.sql` | `approvals` (+ CHECK reject wajib alasan) |
| V5 | ✅ `V5__investigation_stages.sql` | `investigations.stage` + `stages_completed_at`; tabel `investigation_stages` (4 tahap, append-only). Lihat [ADR-015](03-ARCHITECTURE.md) |
| V6 | ✅ `V6__create_publications.sql` | `publications` (1:1 dgn report, unique slug, status DRAFT/PUBLISHED/WITHDRAWN) |
| V7 | ✅ `V7__create_candidates.sql` | `candidates` (unique nomor urut per election_type BEM/BPM) |

**Rencana berikutnya:**

| Versi | File | Isi |
|---|---|---|
| Vn | `link_reported_candidate.sql` | FK `reports.reported_candidate_id` → candidates (resolusi `reported_candidate_text`) |
| Vn | `create_notifications_audit.sql` | `notifications`, `audit_logs`, `outbox_messages` (EPIC-09) |
| V5 | `V5__create_investigations.sql` | `investigations`, `investigation_attachments`, `violation_rules`, `investigation_rules` |
| V6 | `V6__create_approvals_publications.sql` | `approvals`, `publications` |
| V7 | `V7__create_notifications_audit.sql` | `notifications`, `audit_logs` + trigger append-only |
| V8 | `V8__create_indexes.sql` | Semua index di bagian 4 |
| V9 | `V9__create_app_settings.sql` | `app_settings` + seed default |
| V10 | `V10__seed_violation_rules.sql` | Daftar pasal dari tata tertib KP |

**Aturan:** `spring.jpa.hibernate.ddl-auto=validate` di semua environment. Tidak ada `update`, tidak ada `create-drop` kecuali di test.

---

## 6. Contoh Query Kritis

**Rate limit submit (US-406):**
```sql
SELECT count(*) FROM reports
WHERE reporter_id = :userId AND submitted_at > now() - interval '24 hours';
-- >= 3 → tolak dengan 429
```

**Antrean Ketua KP (US-601):**
```sql
SELECT i.*, r.ticket_code, r.title, r.category
FROM investigations i
JOIN reports r ON r.id = i.report_id
WHERE r.status = 'MENUNGGU_PERSETUJUAN_KETUA'
ORDER BY i.submitted_to_chief_at ASC
LIMIT 20 OFFSET :offset;
```

**Transisi status atomik (invarian #2 PRD):**
```sql
BEGIN;
  UPDATE reports SET status = :toStatus, updated_at = now()
   WHERE id = :reportId AND status = :expectedFromStatus;   -- optimistic guard
  -- rowcount = 0 → race condition atau transisi ilegal → ROLLBACK + 409
  INSERT INTO report_status_history (report_id, from_status, to_status, actor_id, note)
  VALUES (:reportId, :expectedFromStatus, :toStatus, :actorId, :note);
COMMIT;
```
Guard `AND status = :expectedFromStatus` inilah yang mencegah dua investigator meng-update laporan yang sama secara bersamaan. Jangan andalkan pengecekan `if (report.getStatus() == ...)` di Java saja — itu bocor saat request paralel.
