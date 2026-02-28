-- ============================================================
-- Migration 010 — Audit Log + Rate Limits
-- ============================================================
-- Two problems solved:
--
--  1. AUDIT LOG — immutable record of critical system actions
--     (who generated what and when, who deleted, who changed DNA)
--     → Antifragility: allows reconstructing state at any point in time
--
--  2. RATE LIMITS — Claude API consumption control per user
--     → Each row = 1 call to a paid API
--     → Aggregated by user_id + endpoint + day
-- ============================================================

-- ── PART 1: Audit Log ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Who
  user_id     TEXT        NOT NULL,

  -- What
  action      TEXT        NOT NULL,
  -- Examples: 'content.generate', 'content.delete', 'voz_dna.generate',
  --           'manifesto.generate', 'profile.update', 'editorial.generate'

  -- Optional details (no sensitive PII)
  metadata    JSONB,
  -- Ex: { "format": "reel", "subtype": "viral7s", "topic": "...", "tokens": 1234 }

  -- Result
  success     BOOLEAN     DEFAULT true NOT NULL,
  error_msg   TEXT,       -- populated if success = false

  -- When
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.audit_log IS
  'Immutable record of all critical system actions. '
  'Never deleted — used for debugging, billing and state recovery.';

-- Indexes for most common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON public.audit_log (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON public.audit_log (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_date
  ON public.audit_log (created_at DESC);

-- RLS — immutable: service_role can INSERT and SELECT, never UPDATE/DELETE
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_direct_access"
  ON public.audit_log
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ── PART 2: Rate Limits ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Who and where
  user_id     TEXT        NOT NULL,
  endpoint    TEXT        NOT NULL,
  -- Values: 'generate', 'manifesto', 'voz-dna', 'editorial',
  --         'calendario', 'viral-research', 'generate-caption'

  -- When (exact date for daily aggregation)
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.rate_limits IS
  'One row per call to a paid API (Claude API). '
  'Limits configured per endpoint: generate=20/day, manifesto=3/day, etc. '
  'Automatic cleanup: rows older than 7 days are disposable.';

-- Composite index for the count query (user + endpoint + today)
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint_day
  ON public.rate_limits (user_id, endpoint, created_at DESC);

-- RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_direct_access"
  ON public.rate_limits
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ── PART 3: Rate limits cleanup function (housekeeping) ──────

-- Function to delete rate_limits older than 30 days (keep the DB clean)
-- Called manually or via cron job in the Supabase Dashboard
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < now() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_rate_limits() IS
  'Deletes rate_limits records older than 30 days. '
  'Call periodically via Supabase Dashboard → Edge Functions → Cron.';
