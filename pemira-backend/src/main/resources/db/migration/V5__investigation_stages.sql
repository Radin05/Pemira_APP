-- Tahapan investigasi di dalam status DIVERIFIKASI (permintaan: 4 tahap).
-- Alur: VERIFIKASI → PENYELIDIKAN → PENYIDIKAN → GELAR_PERKARA, tiap tahap dicatat
-- notanya. Setelah gelar perkara selesai, Hukum mengisi template laporan resmi
-- (findings + kesimpulan/verdict + rekomendasi sanksi) lalu diajukan ke Ketua.

ALTER TABLE investigations
    ADD COLUMN stage               VARCHAR(20),
    ADD COLUMN stages_completed_at TIMESTAMPTZ;

ALTER TABLE investigations
    ADD CONSTRAINT chk_inv_stage CHECK (
        stage IS NULL OR stage IN ('VERIFIKASI', 'PENYELIDIKAN', 'PENYIDIKAN', 'GELAR_PERKARA'));

-- Audit tiap tahap: siapa, kapan, catatan apa. Tidak boleh diubah setelah dibuat.
CREATE TABLE investigation_stages (
    id               BIGSERIAL PRIMARY KEY,
    investigation_id BIGINT      NOT NULL REFERENCES investigations (id),
    stage            VARCHAR(20) NOT NULL,
    note             TEXT        NOT NULL,
    investigator_id  BIGINT      NOT NULL REFERENCES users (id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_invstage_value CHECK (
        stage IN ('VERIFIKASI', 'PENYELIDIKAN', 'PENYIDIKAN', 'GELAR_PERKARA'))
);

CREATE INDEX idx_invstages_inv ON investigation_stages (investigation_id, created_at);

-- Append-only seperti riwayat & bukti (fungsi forbid_mutation dari V1).
CREATE TRIGGER trg_invstage_immutable
    BEFORE UPDATE OR DELETE ON investigation_stages
    FOR EACH ROW EXECUTE FUNCTION forbid_mutation();
