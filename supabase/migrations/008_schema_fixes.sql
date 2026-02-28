-- ============================================================
-- Migration 008 — Critical Schema and Security Fixes
-- ============================================================
-- Applies: First Principles + Antifragility + Real RLS
--
-- What it does:
--  1. Fixes the generated_content table (format, subtype, updated_at, deleted_at columns)
--  2. Migrates existing data from the platform field to format/subtype
--  3. Adds updated_at trigger to generated_content
--  4. Adds index for soft delete
--  5. Fixes ALL RLS policies to block anon (only service_role passes)
-- ============================================================

-- ── PART 1: Improve generated_content ────────────────────────

-- 1a. Add new columns (idempotent with IF NOT EXISTS)
ALTER TABLE public.generated_content
  ADD COLUMN IF NOT EXISTS format      TEXT,
  ADD COLUMN IF NOT EXISTS subtype     TEXT,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;

-- 1b. Migrate existing data: platform "reel/viral7s" → format="reel", subtype="viral7s"
--     If platform has no "/" (e.g. "instagram"), use format="post" and subtype=platform
UPDATE public.generated_content
SET
  format  = CASE
              WHEN platform LIKE '%/%' THEN split_part(platform, '/', 1)
              ELSE 'post'
            END,
  subtype = CASE
              WHEN platform LIKE '%/%' THEN split_part(platform, '/', 2)
              ELSE platform
            END
WHERE format IS NULL;

-- 1c. updated_at trigger on generated_content (reuses the existing function)
DROP TRIGGER IF EXISTS trg_generated_content_updated_at ON public.generated_content;
CREATE TRIGGER trg_generated_content_updated_at
  BEFORE UPDATE ON public.generated_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1d. Index for queries that exclude soft-deleted records (most common case)
DROP INDEX IF EXISTS idx_generated_content_active;
CREATE INDEX idx_generated_content_active
  ON public.generated_content (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- 1e. Index on format for future analytics
CREATE INDEX IF NOT EXISTS idx_generated_content_format
  ON public.generated_content (format, subtype);

-- ── PART 2: Fix RLS — BLOCK ANON on ALL tables ───────────────

-- Principle: service_role always bypasses RLS.
--            anon/authenticated without service_role must access NOTHING.
--            USING (true) was decorative — now changed to USING (false).

-- 2a. generated_content — remove permissive policies
DROP POLICY IF EXISTS "user_view_own_content"      ON public.generated_content;
DROP POLICY IF EXISTS "user_insert_own_content"    ON public.generated_content;
DROP POLICY IF EXISTS "user_delete_own_content"    ON public.generated_content;

-- 2b. generated_content — new blocking policy (defence in depth)
CREATE POLICY "block_direct_access"
  ON public.generated_content
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2c. user_profiles — remove permissive policies
DROP POLICY IF EXISTS "user_view_own_profile"      ON public.user_profiles;
DROP POLICY IF EXISTS "user_update_own_profile"    ON public.user_profiles;
DROP POLICY IF EXISTS "user_insert_own_profile"    ON public.user_profiles;

-- 2d. user_profiles — new blocking policy
CREATE POLICY "block_direct_access"
  ON public.user_profiles
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2e. subscriptions (if it exists from migration 004)
DROP POLICY IF EXISTS "user_view_own_subscription" ON public.subscriptions;
CREATE POLICY "block_direct_access"
  ON public.subscriptions
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2f. published_content (if it exists from migration 005)
DROP POLICY IF EXISTS "user_view_own_posts" ON public.published_content;
CREATE POLICY "block_direct_access"
  ON public.published_content
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2g. engagement_metrics (if it exists from migration 005)
DROP POLICY IF EXISTS "user_view_own_metrics" ON public.engagement_metrics;
CREATE POLICY "block_direct_access"
  ON public.engagement_metrics
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2h. waitlist (if it exists from migration 006)
ALTER TABLE IF EXISTS public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_direct_access" ON public.waitlist;
CREATE POLICY "block_direct_access"
  ON public.waitlist
  FOR ALL
  USING (false)
  WITH CHECK (false);
