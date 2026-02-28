-- ============================================================
-- Migration 008 — Correcções Críticas de Schema e Segurança
-- ============================================================
-- Aplica: First Principles + Antifragilidade + RLS real
--
-- O que faz:
--  1. Corrige a tabela generated_content (colunas format, subtype, updated_at, deleted_at)
--  2. Migra os dados existentes do campo platform para format/subtype
--  3. Adiciona trigger updated_at a generated_content
--  4. Adiciona índice para soft delete
--  5. Corrige TODOS os RLS para bloquear anon (apenas service_role passa)
-- ============================================================

-- ── PARTE 1: Melhorar generated_content ──────────────────────

-- 1a. Adicionar colunas novas (idempotente com IF NOT EXISTS)
ALTER TABLE public.generated_content
  ADD COLUMN IF NOT EXISTS format      TEXT,
  ADD COLUMN IF NOT EXISTS subtype     TEXT,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;

-- 1b. Migrar dados existentes: platform "reel/viral7s" → format="reel", subtype="viral7s"
--     Se platform não tem "/" (ex: "instagram"), usa format="post" e subtype=platform
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

-- 1c. Trigger updated_at em generated_content (reutiliza a função já existente)
DROP TRIGGER IF EXISTS trg_generated_content_updated_at ON public.generated_content;
CREATE TRIGGER trg_generated_content_updated_at
  BEFORE UPDATE ON public.generated_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1d. Índice para queries que excluem soft-deleted (o mais comum)
DROP INDEX IF EXISTS idx_generated_content_active;
CREATE INDEX idx_generated_content_active
  ON public.generated_content (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- 1e. Índice no formato para analytics futuras
CREATE INDEX IF NOT EXISTS idx_generated_content_format
  ON public.generated_content (format, subtype);

-- ── PARTE 2: Corrigir RLS — BLOQUEAR ANON em TODAS as tabelas ──

-- Princípio: service_role bypassa RLS sempre.
--            anon/authenticated sem service_role não deve aceder a NADA.
--            USING (true) era decorativo — agora passa a USING (false).

-- 2a. generated_content — remover policies permissivas
DROP POLICY IF EXISTS "utilizador_ve_proprio_conteudo"      ON public.generated_content;
DROP POLICY IF EXISTS "utilizador_insere_proprio_conteudo"  ON public.generated_content;
DROP POLICY IF EXISTS "utilizador_apaga_proprio_conteudo"   ON public.generated_content;

-- 2b. generated_content — nova policy bloqueante (defesa em profundidade)
CREATE POLICY "bloquear_acesso_directo"
  ON public.generated_content
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2c. user_profiles — remover policies permissivas
DROP POLICY IF EXISTS "utilizador_ve_proprio_perfil"        ON public.user_profiles;
DROP POLICY IF EXISTS "utilizador_actualiza_proprio_perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "utilizador_insere_proprio_perfil"    ON public.user_profiles;

-- 2d. user_profiles — nova policy bloqueante
CREATE POLICY "bloquear_acesso_directo"
  ON public.user_profiles
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2e. subscriptions (se existir da migration 004)
DROP POLICY IF EXISTS "utilizador_ve_propria_subscricao" ON public.subscriptions;
CREATE POLICY "bloquear_acesso_directo"
  ON public.subscriptions
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2f. published_content (se existir da migration 005)
DROP POLICY IF EXISTS "utilizador_ve_proprios_posts" ON public.published_content;
CREATE POLICY "bloquear_acesso_directo"
  ON public.published_content
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2g. engagement_metrics (se existir da migration 005)
DROP POLICY IF EXISTS "utilizador_ve_proprias_metricas" ON public.engagement_metrics;
CREATE POLICY "bloquear_acesso_directo"
  ON public.engagement_metrics
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 2h. waitlist (se existir da migration 006)
ALTER TABLE IF EXISTS public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bloquear_acesso_directo" ON public.waitlist;
CREATE POLICY "bloquear_acesso_directo"
  ON public.waitlist
  FOR ALL
  USING (false)
  WITH CHECK (false);
