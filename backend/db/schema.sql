-- ============================================================================
-- Apex Intel — Reference SQL Schema
-- ============================================================================
-- This file is a HUMAN-READABLE REFERENCE that mirrors the SQLAlchemy ORM
-- models in  backend/db/models.py.
--
-- In production, tables are managed by Alembic migrations.  This file is
-- useful for:
--   • Quick manual setup of a fresh database.
--   • Code reviews — DBAs can read SQL faster than Python ORM definitions.
--   • Debugging — paste into pgAdmin / psql to inspect the schema.
-- ============================================================================

-- Enable UUID generation if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────────────────
-- 1. reports  (central entity)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    input_type              VARCHAR(10)     NOT NULL,           -- 'url' or 'text'
    input_content           TEXT            NOT NULL,           -- raw user input
    status                  VARCHAR(20)     NOT NULL DEFAULT 'queued',

    -- Agent output blobs (JSONB for indexing & performance)
    company_brief           JSONB,
    market_analysis         JSONB,
    competitor_analysis     JSONB,
    skeptic_analysis        JSONB,
    assumptions             JSONB,
    execution_feasibility   JSONB,
    contradictions          JSONB,
    synthesized_memo        JSONB,

    -- Aggregate scores
    overall_confidence_score DOUBLE PRECISION,
    red_flags               JSONB,
    investment_signal       VARCHAR(20),    -- STRONG / MODERATE / WEAK

    -- Timestamps
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Error tracking
    error_log               JSONB
);

-- Index on status for quick filtering of queued / in-progress reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);

-- Index on created_at for chronological listing
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);


-- ──────────────────────────────────────────────────────────────────────────
-- 2. score_breakdowns  (one per report)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS score_breakdowns (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id               UUID            NOT NULL UNIQUE
                                            REFERENCES reports (id) ON DELETE CASCADE,

    total_score             DOUBLE PRECISION NOT NULL,
    market_opportunity      DOUBLE PRECISION NOT NULL,
    competition_intensity   DOUBLE PRECISION NOT NULL,
    execution_feasibility   DOUBLE PRECISION NOT NULL,
    risk_exposure           DOUBLE PRECISION NOT NULL,

    investment_signal       VARCHAR(20)     NOT NULL,   -- STRONG / MODERATE / WEAK
    justification           TEXT            NOT NULL     -- plain-English explanation
);


-- ──────────────────────────────────────────────────────────────────────────
-- 3. competitors  (many per report)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitors (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id               UUID            NOT NULL
                                            REFERENCES reports (id) ON DELETE CASCADE,

    name                    VARCHAR(255)    NOT NULL,
    pricing                 VARCHAR(500),
    positioning             VARCHAR(500),
    strengths               JSONB           NOT NULL DEFAULT '[]'::JSONB,
    weaknesses              JSONB           NOT NULL DEFAULT '[]'::JSONB,
    source                  VARCHAR(500)    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_competitors_report ON competitors (report_id);


-- ──────────────────────────────────────────────────────────────────────────
-- 4. assumptions  (many per report)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assumptions (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id               UUID            NOT NULL
                                            REFERENCES reports (id) ON DELETE CASCADE,

    assumption              TEXT            NOT NULL,
    validation_difficulty   VARCHAR(20)     NOT NULL,   -- easy / moderate / hard / very_hard
    impact_if_false         VARCHAR(20)     NOT NULL,   -- negligible / low / moderate / high / catastrophic
    source                  VARCHAR(500)    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assumptions_report ON assumptions (report_id);


-- ──────────────────────────────────────────────────────────────────────────
-- 5. risk_analyses  (many per report)
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_analyses (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id               UUID            NOT NULL
                                            REFERENCES reports (id) ON DELETE CASCADE,

    risk                    TEXT            NOT NULL,
    severity                VARCHAR(20)     NOT NULL,   -- low / medium / high / critical
    rationale               TEXT            NOT NULL,
    source                  VARCHAR(500)    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_risk_analyses_report ON risk_analyses (report_id);


-- ──────────────────────────────────────────────────────────────────────────
-- Helper: auto-update `updated_at` on every UPDATE
-- ──────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
