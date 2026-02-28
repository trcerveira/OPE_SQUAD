-- ============================================================
-- OPE_SQUAD — Migration 003: User Profiles
-- Created: 2026-02-27
-- Purpose: Lightweight user registry synchronised with Clerk
-- Used in: admin panel, analytics, support
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id            text        PRIMARY KEY,   -- Clerk ID (user_xxxxxxx)
  email              text        NOT NULL,
  name               text,
  genius_complete    boolean     DEFAULT false NOT NULL,
  manifesto_complete boolean     DEFAULT false NOT NULL,
  voz_dna_complete   boolean     DEFAULT false NOT NULL,
  created_at         timestamptz DEFAULT now() NOT NULL,
  updated_at         timestamptz DEFAULT now() NOT NULL
);

-- Index for email lookup (admin panel, support)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email
  ON public.user_profiles (email);

-- Function that automatically updates updated_at on each UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger: updates updated_at whenever the profile changes
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user_view_own_profile"
  ON public.user_profiles FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "user_update_own_profile"
  ON public.user_profiles FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "user_insert_own_profile"
  ON public.user_profiles FOR INSERT WITH CHECK (true);

-- Comments
COMMENT ON TABLE  public.user_profiles                    IS 'User profiles synchronised with Clerk';
COMMENT ON COLUMN public.user_profiles.user_id            IS 'Clerk user ID (format: user_xxxxxxx)';
COMMENT ON COLUMN public.user_profiles.genius_complete    IS 'True when the user has completed the Genius Zone';
COMMENT ON COLUMN public.user_profiles.manifesto_complete IS 'True when the user has accepted the Manifesto';
COMMENT ON COLUMN public.user_profiles.voz_dna_complete   IS 'True when the user has defined their Voice DNA';
