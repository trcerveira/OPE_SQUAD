-- ============================================================
-- Migration 011 — PUBLYQ MVP Schema
-- ============================================================
-- Story: 1.4 — Database Schema for PUBLYQ MVP
-- PRD: PRD-PUBLYQ v2.0 (Brand DNA + Voice DNA + Carousel)
-- Architecture: ARCH-PUBLYQ Section 4
--
-- SAFETY: All CREATE TABLE use IF NOT EXISTS. Safe to run multiple times.
-- NOTE: No FK constraints — security enforced at API route level (service_role).
-- ============================================================


-- ── PART 0: Ensure set_updated_at() function exists ───────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ── PART 1: Extend user_profiles ───────────────────────────────

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS brand_dna_complete BOOLEAN DEFAULT FALSE;


-- ── PART 2: brand_profiles (NEW) ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.brand_profiles (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           TEXT        UNIQUE NOT NULL,

  brand_name        TEXT,
  mission           TEXT,
  values            JSONB,
  target_audience   TEXT,
  positioning       TEXT,
  personality       JSONB,
  differentiator    TEXT,

  brand_dna_output  JSONB,

  version           INT         DEFAULT 1,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_brand_profiles_updated_at ON public.brand_profiles;
CREATE TRIGGER trg_brand_profiles_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── PART 3: voice_profiles (NEW) ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.voice_profiles (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           TEXT        UNIQUE NOT NULL,

  answers           JSONB       NOT NULL,
  voice_dna         JSONB,

  version           INT         DEFAULT 1,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_voice_profiles_updated_at ON public.voice_profiles;
CREATE TRIGGER trg_voice_profiles_updated_at
  BEFORE UPDATE ON public.voice_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── PART 4: generated_carousels (NEW) ─────────────────────────

CREATE TABLE IF NOT EXISTS public.generated_carousels (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           TEXT        NOT NULL,

  topic             TEXT        NOT NULL,
  slides            JSONB       NOT NULL,
  keywords          TEXT[],
  palette           JSONB,

  status            TEXT        DEFAULT 'draft',
  exported_at       TIMESTAMPTZ,

  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- ── PART 5: rate_limits (may exist from migration 010) ────────

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           TEXT        NOT NULL,
  endpoint          TEXT        NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- ── PART 6: audit_log (may exist from migration 010) ──────────

CREATE TABLE IF NOT EXISTS public.audit_log (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           TEXT,
  action            TEXT        NOT NULL,
  metadata          JSONB,
  success           BOOLEAN     DEFAULT true NOT NULL,
  error_msg         TEXT,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- ── PART 7: RLS — Block direct access ─────────────────────────

ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_carousels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "block_direct_access" ON public.brand_profiles;
DROP POLICY IF EXISTS "block_direct_access" ON public.voice_profiles;
DROP POLICY IF EXISTS "block_direct_access" ON public.generated_carousels;
DROP POLICY IF EXISTS "block_direct_access" ON public.rate_limits;
DROP POLICY IF EXISTS "block_direct_access" ON public.audit_log;

CREATE POLICY "block_direct_access"
  ON public.brand_profiles FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "block_direct_access"
  ON public.voice_profiles FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "block_direct_access"
  ON public.generated_carousels FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "block_direct_access"
  ON public.rate_limits FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "block_direct_access"
  ON public.audit_log FOR ALL USING (false) WITH CHECK (false);


-- ── PART 8: Indexes ───────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_brand_profiles_user
  ON public.brand_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_voice_profiles_user
  ON public.voice_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_carousels_user
  ON public.generated_carousels (user_id);

CREATE INDEX IF NOT EXISTS idx_carousels_user_status
  ON public.generated_carousels (user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint_day
  ON public.rate_limits (user_id, endpoint, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON public.audit_log (user_id, created_at DESC);


-- ── PART 9: Verify waitlist ───────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'waitlist'
  ) THEN
    RAISE NOTICE 'WARNING: waitlist table not found.';
  ELSE
    RAISE NOTICE 'OK: waitlist table exists.';
  END IF;
END $$;


-- ============================================================
-- DONE. Tables created:
--   brand_profiles, voice_profiles, generated_carousels,
--   rate_limits, audit_log
-- Column added: user_profiles.brand_dna_complete
-- ============================================================
