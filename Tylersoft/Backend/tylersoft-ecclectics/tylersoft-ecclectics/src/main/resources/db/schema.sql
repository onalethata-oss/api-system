-- ================================================================
-- Tylersoft Ecclectics — PostgreSQL Schema
-- ================================================================

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password        VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL DEFAULT 'USER'
                        CHECK (role IN ('ADMIN','USER')),
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    failed_attempts INT           NOT NULL DEFAULT 0,
    locked_until    TIMESTAMP     NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── API RESOURCES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_resources (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    endpoint_url    VARCHAR(500)  NOT NULL,
    description     TEXT,
    documentation   TEXT,
    parsed_documentation TEXT,
    created_by      BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── USER ↔ API ASSIGNMENTS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_api_assignments (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT        NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    api_id          BIGINT        NOT NULL REFERENCES api_resources(id) ON DELETE CASCADE,
    assigned_by     BIGINT        REFERENCES users(id)                 ON DELETE SET NULL,
    assigned_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_user_api UNIQUE (user_id, api_id)
);

-- ── AUDIT LOG ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGSERIAL PRIMARY KEY,
    actor_email     VARCHAR(150),
    action          VARCHAR(100)  NOT NULL,
    entity          VARCHAR(100),
    entity_id       BIGINT,
    detail          TEXT,
    ip_address      VARCHAR(45),
    performed_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_assignments_user     ON user_api_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_api      ON user_api_assignments(api_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor          ON audit_log(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_performed_at   ON audit_log(performed_at);

-- ── DEFAULT ADMIN (password: Admin@123) ─────────────────────
-- Generated with BCryptPasswordEncoder strength 12
-- CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN
INSERT INTO users (name, email, password, role)
VALUES (
    'System Admin',
    'admin@tylersoft.com',
    '$2a$12$gFMKuafs2RRLykDBnWKqb.sLBUm9Koe0ZIxHyIUo9a6gGCudI354.',
    'ADMIN'
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- ── DEFAULT USER (password: Admin@123) ──────────────────────
INSERT INTO users (name, email, password, role)
VALUES (
    'Test User',
    'user@tylersoft.com',
    '$2a$12$F7hEBuAuW62Fwq3SAnRmwOsB5aHOagupHC2k2R5FxBoOWounnmV/u',
    'USER'
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
