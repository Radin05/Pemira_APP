-- Publikasi PDD (EPIC-07). Satu laporan → satu publikasi (1:1).
-- Hanya laporan berstatus DISETUJUI yang boleh disusun jadi publikasi, dan hanya
-- yang berstatus PUBLISHED yang tampil ke publik (ADR-007).

CREATE TABLE publications (
    id                BIGSERIAL PRIMARY KEY,
    report_id         BIGINT       NOT NULL UNIQUE REFERENCES reports (id),
    published_by      BIGINT       REFERENCES users (id),
    title             VARCHAR(200) NOT NULL,
    slug              VARCHAR(220) NOT NULL UNIQUE,
    summary           TEXT         NOT NULL,
    content           TEXT,
    banner_url        VARCHAR(500),
    instagram_url     VARCHAR(500),
    status            VARCHAR(12)  NOT NULL DEFAULT 'DRAFT',
    withdrawn_reason  TEXT,
    published_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_pub_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'WITHDRAWN')),
    CONSTRAINT chk_pub_published_at CHECK (status <> 'PUBLISHED' OR published_at IS NOT NULL)
);

-- Feed publik: hanya yang PUBLISHED, terbaru dulu.
CREATE INDEX idx_pub_published ON publications (published_at DESC) WHERE status = 'PUBLISHED';
