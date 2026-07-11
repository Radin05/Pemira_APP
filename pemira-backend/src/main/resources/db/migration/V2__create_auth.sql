-- Autentikasi & otorisasi (EPIC-02). Lihat docs/02-ERD.md.

CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(40)  NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    npm                 VARCHAR(30),
    email               VARCHAR(150) NOT NULL,
    full_name           VARCHAR(150) NOT NULL,
    password_hash       VARCHAR(100),           -- null utk mahasiswa OTP-only
    study_program       VARCHAR(150),
    phone               VARCHAR(30),
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verified_at   TIMESTAMPTZ,
    failed_login_count  INT          NOT NULL DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);

-- Email & NPM unik hanya untuk baris yang belum dihapus (soft delete).
CREATE UNIQUE INDEX idx_users_email ON users (lower(email)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_npm ON users (npm) WHERE npm IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE user_roles (
    user_id     BIGINT      NOT NULL REFERENCES users (id),
    role_id     BIGINT      NOT NULL REFERENCES roles (id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    assigned_by BIGINT,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users (id),
    token_hash  VARCHAR(64)  NOT NULL UNIQUE,   -- SHA-256 hex dari token
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked_at  TIMESTAMPTZ,
    replaced_by BIGINT,                          -- id token pengganti (rotasi)
    user_agent  VARCHAR(255),
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_refresh_token_hash CHECK (token_hash ~ '^[a-f0-9]{64}$')
);
CREATE INDEX idx_refresh_user ON refresh_tokens (user_id);

CREATE TABLE otp_codes (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(150) NOT NULL,
    npm           VARCHAR(30),
    code_hash     VARCHAR(64)  NOT NULL,          -- SHA-256 hex dari kode 6 digit
    purpose       VARCHAR(20)  NOT NULL,
    attempt_count SMALLINT     NOT NULL DEFAULT 0,
    expires_at    TIMESTAMPTZ  NOT NULL,
    consumed_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_otp_purpose CHECK (purpose IN ('LOGIN', 'VERIFY_EMAIL'))
);
CREATE INDEX idx_otp_email ON otp_codes (lower(email), created_at DESC);

-- Sekarang users ada, pasang FK yang ditunda dari V1.
ALTER TABLE reports
    ADD CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users (id);

-- Seed 5 role (reference data).
INSERT INTO roles (name, description) VALUES
    ('MAHASISWA',        'Mahasiswa pelapor'),
    ('HUKUM_SEKRETARIAT','Divisi Hukum & Sekretariat — investigasi laporan'),
    ('KETUA_KP',         'Ketua Komite Pengawasan — memutus laporan investigasi'),
    ('PDD',              'Publikasi, Dokumentasi & Desain — publikasi putusan'),
    ('ADMIN',            'Administrator sistem');
