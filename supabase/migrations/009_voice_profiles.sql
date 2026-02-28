-- ============================================================
-- Migration 009 — Tabela user_voice_profiles (Antifragilidade)
-- ============================================================
-- Problema: vozDNA, geniusProfile, manifestoAnswers existem APENAS
--           em Clerk unsafeMetadata — sem backup, sem auditoria,
--           sem recuperação se a conta Clerk for comprometida.
--
-- Solução: Guardar estes dados também no Supabase como fonte
--          secundária de verdade e backup completo.
--
-- Princípio de antifragilidade: o sistema fica mais forte quando
-- há redundância estratégica nos dados críticos do utilizador.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_voice_profiles (
  -- Chave primária ligada ao perfil do utilizador
  user_id             TEXT        PRIMARY KEY
                                  REFERENCES public.user_profiles(user_id)
                                  ON DELETE CASCADE,

  -- DNA de Voz (gerado pelo /api/voz-dna com Claude)
  voz_dna             JSONB,

  -- Perfil Genius Zone (7 frameworks: Hendricks, Hamilton, etc.)
  genius_profile      JSONB,

  -- Respostas ao Manifesto (9 perguntas)
  manifesto_answers   JSONB,

  -- Linha Editorial (3 editorias estruturadas)
  editorial_lines     JSONB,

  -- Versioning: quantas vezes cada perfil foi regenerado
  voz_dna_version     INTEGER     DEFAULT 1,
  genius_version      INTEGER     DEFAULT 1,
  manifesto_version   INTEGER     DEFAULT 1,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.user_voice_profiles IS
  'Backup e fonte de verdade para dados críticos do solopreneur: '
  'vozDNA, geniusProfile e manifestoAnswers. '
  'Espelho do Clerk unsafeMetadata com auditoria completa via updated_at.';

COMMENT ON COLUMN public.user_voice_profiles.voz_dna IS
  'JSON completo do DNA de Voz: arquetipo, tom, vocabulario, frases assinatura, regras de estilo';
COMMENT ON COLUMN public.user_voice_profiles.genius_profile IS
  'JSON do perfil Genius Zone: hendricksZone, wealthProfile, kolbeMode, fascinationAdvantage, etc.';
COMMENT ON COLUMN public.user_voice_profiles.voz_dna_version IS
  'Quantas vezes o DNA de Voz foi regenerado — para tracking de evolução';

-- Trigger updated_at (reutiliza função da migration 003)
DROP TRIGGER IF EXISTS trg_user_voice_profiles_updated_at ON public.user_voice_profiles;
CREATE TRIGGER trg_user_voice_profiles_updated_at
  BEFORE UPDATE ON public.user_voice_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS — bloquear acesso directo (só service_role passa)
ALTER TABLE public.user_voice_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloquear_acesso_directo"
  ON public.user_voice_profiles
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Índice para queries admin (ver quem tem vozDNA vs não)
CREATE INDEX IF NOT EXISTS idx_voice_profiles_has_voz_dna
  ON public.user_voice_profiles (user_id)
  WHERE voz_dna IS NOT NULL;
