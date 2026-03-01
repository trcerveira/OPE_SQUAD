-- ============================================================
-- SCRIPT COMBINADO — Executar no Supabase Dashboard → SQL Editor
-- Ordem: 008 → 009 → 010 (copiar TUDO e colar de uma vez)
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 008 — Schema Fixes + RLS
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.generated_content
  ADD COLUMN IF NOT EXISTS format      TEXT,
  ADD COLUMN IF NOT EXISTS subtype     TEXT,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;

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

DROP TRIGGER IF EXISTS trg_generated_content_updated_at ON public.generated_content;
CREATE TRIGGER trg_generated_content_updated_at
  BEFORE UPDATE ON public.generated_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP INDEX IF EXISTS idx_generated_content_active;
CREATE INDEX idx_generated_content_active
  ON public.generated_content (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_generated_content_format
  ON public.generated_content (format, subtype);

DROP POLICY IF EXISTS "user_view_own_content"      ON public.generated_content;
DROP POLICY IF EXISTS "user_insert_own_content"    ON public.generated_content;
DROP POLICY IF EXISTS "user_delete_own_content"    ON public.generated_content;
DROP POLICY IF EXISTS "block_direct_access"        ON public.generated_content;
CREATE POLICY "block_direct_access"
  ON public.generated_content FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "user_view_own_profile"      ON public.user_profiles;
DROP POLICY IF EXISTS "user_update_own_profile"    ON public.user_profiles;
DROP POLICY IF EXISTS "user_insert_own_profile"    ON public.user_profiles;
DROP POLICY IF EXISTS "block_direct_access"        ON public.user_profiles;
CREATE POLICY "block_direct_access"
  ON public.user_profiles FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "user_view_own_subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "block_direct_access"        ON public.subscriptions;
CREATE POLICY "block_direct_access"
  ON public.subscriptions FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "user_view_own_posts"        ON public.published_content;
DROP POLICY IF EXISTS "block_direct_access"        ON public.published_content;
CREATE POLICY "block_direct_access"
  ON public.published_content FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "user_view_own_metrics"      ON public.engagement_metrics;
DROP POLICY IF EXISTS "block_direct_access"        ON public.engagement_metrics;
CREATE POLICY "block_direct_access"
  ON public.engagement_metrics FOR ALL USING (false) WITH CHECK (false);

ALTER TABLE IF EXISTS public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_direct_access" ON public.waitlist;
CREATE POLICY "block_direct_access"
  ON public.waitlist FOR ALL USING (false) WITH CHECK (false);

-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 009 — Voice Profiles Backup Table
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_voice_profiles (
  user_id             TEXT        PRIMARY KEY
                                  REFERENCES public.user_profiles(user_id)
                                  ON DELETE CASCADE,
  voz_dna             JSONB,
  genius_profile      JSONB,
  manifesto_answers   JSONB,
  editorial_lines     JSONB,
  voz_dna_version     INTEGER     DEFAULT 1,
  genius_version      INTEGER     DEFAULT 1,
  manifesto_version   INTEGER     DEFAULT 1,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_user_voice_profiles_updated_at ON public.user_voice_profiles;
CREATE TRIGGER trg_user_voice_profiles_updated_at
  BEFORE UPDATE ON public.user_voice_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_voice_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_direct_access" ON public.user_voice_profiles;
CREATE POLICY "block_direct_access"
  ON public.user_voice_profiles FOR ALL USING (false) WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_voice_profiles_has_voz_dna
  ON public.user_voice_profiles (user_id)
  WHERE voz_dna IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 010 — Audit Log + Rate Limits
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT        NOT NULL,
  action      TEXT        NOT NULL,
  metadata    JSONB,
  success     BOOLEAN     DEFAULT true NOT NULL,
  error_msg   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_direct_access" ON public.audit_log;
CREATE POLICY "block_direct_access"
  ON public.audit_log FOR ALL USING (false) WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON public.audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON public.audit_log (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_date
  ON public.audit_log (created_at DESC);

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT        NOT NULL,
  endpoint    TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_direct_access" ON public.rate_limits;
CREATE POLICY "block_direct_access"
  ON public.rate_limits FOR ALL USING (false) WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint_day
  ON public.rate_limits (user_id, endpoint, created_at DESC);

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

-- ═══════════════════════════════════════════════════════════════
-- DONE! Migrations 008 + 009 + 010 applied.
-- ═══════════════════════════════════════════════════════════════
