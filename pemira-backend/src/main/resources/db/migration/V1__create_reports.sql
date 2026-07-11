-- Modul laporan (EPIC-04). Lihat docs/02-ERD.md.
--
-- Catatan penyimpangan dari ERD untuk irisan pertama ini:
--   * reporter_id & assignee_id BIGINT nullable TANPA foreign key — tabel users
--     belum ada (EPIC-02). FK ditambahkan di migrasi berikutnya.
--   * reported_candidate_text menggantikan reported_candidate_id FK — tabel
--     candidates belum ada, dan form mengirim teks bebas. Nanti diresolusi ke id.
--   * Identitas pelapor disimpan terenkripsi (kolom *_enc). reporter_npm_hash
--     adalah SHA-256 deterministik untuk pelacakan & rate-limit tanpa dekripsi.

CREATE TABLE reports (
    id                       BIGSERIAL PRIMARY KEY,
    ticket_code              VARCHAR(20)  NOT NULL UNIQUE,
    reporter_id              BIGINT,
    reporter_name_enc        TEXT,
    reporter_npm_enc         TEXT         NOT NULL,
    reporter_email_enc       TEXT         NOT NULL,
    reporter_npm_hash        VARCHAR(64)     NOT NULL,
    is_anonymous             BOOLEAN      NOT NULL DEFAULT FALSE,
    category                 VARCHAR(40)  NOT NULL,
    reported_candidate_text  VARCHAR(150),
    title                    VARCHAR(150) NOT NULL,
    description              TEXT         NOT NULL,
    incident_date            DATE         NOT NULL,
    incident_location        VARCHAR(255) NOT NULL,
    status                   VARCHAR(40)  NOT NULL,
    assignee_id              BIGINT,
    submitted_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    closed_at                TIMESTAMPTZ,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_reports_category CHECK (category IN (
        'KAMPANYE_DILUAR_JADWAL', 'POLITIK_UANG', 'KAMPANYE_HITAM',
        'PERUSAKAN_ATRIBUT', 'PELIBATAN_PIHAK_TERLARANG',
        'PELANGGARAN_MEDIA_SOSIAL', 'INTIMIDASI', 'LAINNYA'
    )),
    CONSTRAINT chk_reports_status CHECK (status IN (
        'DITERIMA', 'DIVERIFIKASI', 'VALID', 'HOAX', 'DICATAT_HOAX',
        'DIBUAT_LAPORAN_INVESTIGASI', 'MENUNGGU_PERSETUJUAN_KETUA',
        'DISETUJUI', 'DITOLAK', 'DIPUBLIKASI', 'DITARIK', 'SELESAI'
    )),
    CONSTRAINT chk_reports_npm_hash CHECK (reporter_npm_hash ~ '^[a-f0-9]{64}$'),
    -- Laporan anonim tidak boleh terkait akun pelapor (ERD chk_anonymous_no_reporter_fk).
    CONSTRAINT chk_reports_anon CHECK (NOT is_anonymous OR reporter_id IS NULL)
);

CREATE TABLE report_evidences (
    id                 BIGSERIAL PRIMARY KEY,
    report_id          BIGINT       NOT NULL REFERENCES reports (id),
    storage_key        VARCHAR(255) NOT NULL,
    original_filename  VARCHAR(255) NOT NULL,
    mime_type          VARCHAR(100) NOT NULL,
    size_bytes         BIGINT       NOT NULL,
    checksum_sha256    VARCHAR(64)     NOT NULL,
    uploaded_by        BIGINT,
    uploaded_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_evidence_size CHECK (size_bytes > 0 AND size_bytes <= 10485760),
    CONSTRAINT chk_evidence_checksum CHECK (checksum_sha256 ~ '^[a-f0-9]{64}$')
);

CREATE TABLE report_status_history (
    id           BIGSERIAL PRIMARY KEY,
    report_id    BIGINT      NOT NULL REFERENCES reports (id),
    from_status  VARCHAR(40),
    to_status    VARCHAR(40) NOT NULL,
    actor_id     BIGINT,
    note         TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index yang menjawab query nyata (docs/02-ERD.md §4).
CREATE INDEX idx_reports_status_submitted ON reports (status, submitted_at DESC);
CREATE INDEX idx_reports_npm_hash ON reports (reporter_npm_hash, submitted_at DESC);
CREATE INDEX idx_history_report ON report_status_history (report_id, created_at);
CREATE INDEX idx_evidence_report ON report_evidences (report_id);

-- Append-only: tabel bukti & riwayat tidak boleh diubah/dihapus lewat aplikasi.
-- Ini alat bukti saat sengketa (docs/02-ERD.md §3, ADR di §8 PRD).
CREATE OR REPLACE FUNCTION forbid_mutation() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Tabel % bersifat append-only', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_history_immutable
    BEFORE UPDATE OR DELETE ON report_status_history
    FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TRIGGER trg_evidence_immutable
    BEFORE UPDATE OR DELETE ON report_evidences
    FOR EACH ROW EXECUTE FUNCTION forbid_mutation();
