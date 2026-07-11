-- Modul investigasi (EPIC-05). Satu laporan → satu berkas investigasi (1:1).
-- Untuk irisan ini yang dipakai: verdict + cross_check_note + investigator_id.
-- Kolom findings/recommendation/rules disiapkan untuk laporan resmi ke Ketua (EPIC-06).

CREATE TABLE investigations (
    id                     BIGSERIAL PRIMARY KEY,
    report_id              BIGINT       NOT NULL UNIQUE REFERENCES reports (id),
    investigator_id        BIGINT       NOT NULL REFERENCES users (id),
    verdict                VARCHAR(10),
    cross_check_note       TEXT,
    findings               TEXT,
    recommendation         TEXT,
    recommended_sanction   VARCHAR(30),
    revision_number        SMALLINT     NOT NULL DEFAULT 0,
    verdict_at             TIMESTAMPTZ,
    submitted_to_chief_at  TIMESTAMPTZ,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_investigation_verdict CHECK (verdict IS NULL OR verdict IN ('VALID', 'HOAX'))
);

CREATE INDEX idx_investigations_pending ON investigations (submitted_to_chief_at)
    WHERE submitted_to_chief_at IS NOT NULL;
