-- Data calon BEM/BPM (EPIC-03). Dikelola ADMIN, dibaca publik.

CREATE TABLE candidates (
    id                BIGSERIAL PRIMARY KEY,
    candidate_number  SMALLINT     NOT NULL,
    election_type     VARCHAR(10)  NOT NULL,
    chief_name        VARCHAR(150) NOT NULL,
    vice_name         VARCHAR(150),
    study_program     VARCHAR(150),
    photo_url         VARCHAR(500),
    vision            TEXT,
    mission           TEXT,
    work_programs     TEXT,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_candidate_election CHECK (election_type IN ('BEM', 'BPM')),
    CONSTRAINT uq_candidate_number UNIQUE (election_type, candidate_number)
);

CREATE INDEX idx_candidates_active ON candidates (election_type, candidate_number)
    WHERE is_active = TRUE;
