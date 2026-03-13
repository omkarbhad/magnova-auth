-- Astrova — Neon (PostgreSQL) Schema
-- Run this against your Neon database to initialize all tables.
-- psql $DATABASE_URL -f neon-schema.sql
-- NOTE: Table names match api/_lib/db.ts (no astrova_ prefix)

-- ── users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid  TEXT UNIQUE,
  email         TEXT NOT NULL DEFAULT '',
  name          TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user',
  is_banned     BOOLEAN NOT NULL DEFAULT false,
  credits       INTEGER NOT NULL DEFAULT 10,
  credits_used  INTEGER NOT NULL DEFAULT 0,
  github_token  TEXT,
  github_username TEXT,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration: add GitHub token columns (run if table already exists)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS github_token TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS github_username TEXT;

-- ── credit_transactions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  type        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id, created_at DESC);

-- ── knowledge_base ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_base (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  category   TEXT NOT NULL,
  content    TEXT NOT NULL,
  tags       JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active  INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── admin_config ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_config (
  config_key   TEXT PRIMARY KEY,
  config_value JSONB NOT NULL DEFAULT 'null'::jsonb,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── user_settings ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  default_timezone TEXT,
  chart_style      TEXT,
  ayanamsa         TEXT,
  preferences      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── chat_sessions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT 'New Chat',
  messages     JSONB NOT NULL DEFAULT '[]'::jsonb,
  model_used   TEXT,
  session_type TEXT NOT NULL DEFAULT 'astrology',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id, updated_at DESC);

-- ── saved_charts ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_charts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  birth_data    JSONB NOT NULL,
  kundali_data  JSONB,
  location_name TEXT,
  coordinates   JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_saved_charts_user ON saved_charts(user_id, created_at DESC);

-- ── enabled_models ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enabled_models (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id     TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  provider     TEXT NOT NULL,
  is_enabled   INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 99
);
