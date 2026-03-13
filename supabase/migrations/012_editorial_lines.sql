-- ============================================================
-- Migration 012: Editorial Lines table + editorial_complete flag
-- PUBLYQ MVP — Story 1.8 (Dashboard Pipeline — 4 steps)
-- ============================================================

-- Add editorial_complete to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS editorial_complete BOOLEAN NOT NULL DEFAULT false;

-- Create editorial_lines table
CREATE TABLE IF NOT EXISTS editorial_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  resumo TEXT,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | confirmed
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at
CREATE TRIGGER set_editorial_lines_updated_at
  BEFORE UPDATE ON editorial_lines
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_editorial_lines_user ON editorial_lines(user_id);

-- RLS (block direct access — service_role bypasses)
ALTER TABLE editorial_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY block_direct_access ON editorial_lines USING (false);

-- ============================================================
-- HOW TO APPLY:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy-paste this entire file
-- 3. Click "Run"
-- ============================================================
