-- ============================================
-- AI Governance Platform - Risk & Control Tables
-- ============================================

-- Drop tables if they already exist (safe to re-run)
DROP TABLE IF EXISTS ai_risks CASCADE;
DROP TABLE IF EXISTS ai_controls CASCADE;
DROP TABLE IF EXISTS cyber_risks CASCADE;
DROP TABLE IF EXISTS nist_controls CASCADE;

-- ─────────────────────────────────────────
-- Table 1: AI Risks (from predefined_risks.xlsx)
-- ─────────────────────────────────────────
CREATE TABLE ai_risks (
    id              SERIAL PRIMARY KEY,
    risk_id         VARCHAR(50)  NOT NULL UNIQUE,
    risk_name       TEXT         NOT NULL,
    base_severity   INTEGER      NOT NULL DEFAULT 3,
    base_likelihood INTEGER      NOT NULL DEFAULT 3,
    mitigation      TEXT,
    target_date     VARCHAR(50),
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Table 2: AI Controls (from predefined_controls.xlsx)
-- ─────────────────────────────────────────
CREATE TABLE ai_controls (
    id           SERIAL PRIMARY KEY,
    code         VARCHAR(50)  NOT NULL UNIQUE,
    section      TEXT         NOT NULL,
    control      TEXT         NOT NULL,
    requirements TEXT,
    created_at   TIMESTAMP    DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Table 3: Cyber Risks (from stride_risks.xlsx)
-- ─────────────────────────────────────────
CREATE TABLE cyber_risks (
    id           SERIAL PRIMARY KEY,
    risk_id      VARCHAR(50)  NOT NULL UNIQUE,
    category     VARCHAR(100),
    description  TEXT         NOT NULL,
    likelihood   VARCHAR(50),
    impact       VARCHAR(50),
    severity     INTEGER      NOT NULL DEFAULT 3,
    mitigation   TEXT,
    created_at   TIMESTAMP    DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Table 4: NIST Controls (from nist_controls.xlsx)
-- ─────────────────────────────────────────
CREATE TABLE nist_controls (
    id              SERIAL PRIMARY KEY,
    control_id      VARCHAR(50)  NOT NULL UNIQUE,
    family          VARCHAR(100),
    control_name    TEXT         NOT NULL,
    control_description TEXT,
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Indexes for faster queries
-- ─────────────────────────────────────────
CREATE INDEX idx_ai_risks_severity    ON ai_risks(base_severity);
CREATE INDEX idx_cyber_risks_severity ON cyber_risks(severity);
CREATE INDEX idx_ai_controls_code     ON ai_controls(code);
CREATE INDEX idx_nist_controls_family ON nist_controls(family);