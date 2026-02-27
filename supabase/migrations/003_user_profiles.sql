-- ============================================================
-- OPE_SQUAD — Migration 003: Perfis de Utilizador
-- Criado em: 2026-02-27
-- Propósito: Registo leve de utilizadores sincronizado com Clerk
-- Usado em: painel de admin, analytics, suporte
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id            text        PRIMARY KEY,   -- ID do Clerk (user_xxxxxxx)
  email              text        NOT NULL,
  name               text,
  genius_complete    boolean     DEFAULT false NOT NULL,
  manifesto_complete boolean     DEFAULT false NOT NULL,
  voz_dna_complete   boolean     DEFAULT false NOT NULL,
  created_at         timestamptz DEFAULT now() NOT NULL,
  updated_at         timestamptz DEFAULT now() NOT NULL
);

-- Índice para pesquisar por email (admin panel, suporte)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email
  ON public.user_profiles (email);

-- Função que actualiza updated_at automaticamente em cada UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger: actualiza updated_at sempre que o perfil é alterado
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "utilizador_ve_proprio_perfil"
  ON public.user_profiles FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "utilizador_actualiza_proprio_perfil"
  ON public.user_profiles FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "utilizador_insere_proprio_perfil"
  ON public.user_profiles FOR INSERT WITH CHECK (true);

-- Comentários
COMMENT ON TABLE  public.user_profiles                    IS 'Perfis de utilizador sincronizados com Clerk';
COMMENT ON COLUMN public.user_profiles.user_id            IS 'ID do utilizador no Clerk (formato: user_xxxxxxx)';
COMMENT ON COLUMN public.user_profiles.genius_complete    IS 'True quando o utilizador completou a Genius Zone';
COMMENT ON COLUMN public.user_profiles.manifesto_complete IS 'True quando o utilizador aceitou o Manifesto';
COMMENT ON COLUMN public.user_profiles.voz_dna_complete   IS 'True quando o utilizador definiu o Voz & DNA';
