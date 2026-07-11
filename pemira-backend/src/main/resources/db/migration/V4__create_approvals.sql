-- Persetujuan Ketua KP (EPIC-06). Satu investigasi bisa punya banyak keputusan
-- (tolak → revisi → ajukan lagi → setuju), semua tersimpan (tidak ditimpa).

CREATE TABLE approvals (
    id               BIGSERIAL PRIMARY KEY,
    investigation_id BIGINT      NOT NULL REFERENCES investigations (id),
    approver_id      BIGINT      NOT NULL REFERENCES users (id),
    decision         VARCHAR(10) NOT NULL,
    reason           TEXT,
    revision_number  SMALLINT    NOT NULL DEFAULT 0,
    decided_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_approval_decision CHECK (decision IN ('APPROVED', 'REJECTED')),
    -- Penolakan wajib beralasan (ERD chk_reject_needs_reason).
    CONSTRAINT chk_reject_needs_reason
        CHECK (decision <> 'REJECTED' OR (reason IS NOT NULL AND length(trim(reason)) >= 30))
);

CREATE INDEX idx_approvals_investigation ON approvals (investigation_id, decided_at DESC);
