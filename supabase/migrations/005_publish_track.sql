-- ============================================================
-- OPE_SQUAD — Migration 005: Publish & Track (V2)
-- Criado em: 2026-02-27
-- Estado: PENDENTE — aplicar quando construir Auto-Publish
-- ============================================================
-- Funcionalidade:
--   - Agendar posts nas redes sociais
--   - Registar posts publicados
--   - Tracking de engagement (likes, comentários, partilhas)
-- ============================================================

-- Tabela de publicações agendadas e realizadas
CREATE TABLE IF NOT EXISTS public.published_content (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               text        NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  generated_content_id  uuid        REFERENCES public.generated_content(id) ON DELETE SET NULL,
  platform              text        NOT NULL,        -- instagram | linkedin | twitter | email
  status                text        DEFAULT 'draft', -- draft | scheduled | published | failed
  scheduled_for         timestamptz,                 -- Quando está agendado para publicar
  published_at          timestamptz,                 -- Quando foi efectivamente publicado
  social_post_id        text,                        -- ID do post na rede social (para tracking)
  error_message         text,                        -- Motivo de falha (se status = failed)
  created_at            timestamptz DEFAULT now() NOT NULL,
  updated_at            timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT valid_platform CHECK (platform IN ('instagram', 'linkedin', 'twitter', 'email')),
  CONSTRAINT valid_status   CHECK (status   IN ('draft', 'scheduled', 'published', 'failed'))
);

-- Índice para buscar posts agendados (cron job de publicação)
CREATE INDEX IF NOT EXISTS idx_published_content_scheduled
  ON public.published_content (scheduled_for)
  WHERE status = 'scheduled';

-- Índice para histórico por utilizador
CREATE INDEX IF NOT EXISTS idx_published_content_user
  ON public.published_content (user_id, created_at DESC);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_published_content_updated_at ON public.published_content;
CREATE TRIGGER trg_published_content_updated_at
  BEFORE UPDATE ON public.published_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabela de métricas de engagement
CREATE TABLE IF NOT EXISTS public.engagement_metrics (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  published_content_id  uuid        NOT NULL REFERENCES public.published_content(id) ON DELETE CASCADE,
  likes                 integer     DEFAULT 0 NOT NULL,
  comments              integer     DEFAULT 0 NOT NULL,
  shares                integer     DEFAULT 0 NOT NULL,
  views                 integer     DEFAULT 0 NOT NULL,
  clicks                integer     DEFAULT 0 NOT NULL,
  synced_at             timestamptz DEFAULT now() NOT NULL -- Última sincronização com a rede social
);

-- RLS
ALTER TABLE public.published_content  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "utilizador_ve_proprios_posts"
  ON public.published_content FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "utilizador_ve_proprias_metricas"
  ON public.engagement_metrics FOR SELECT USING (true);

-- Comentários
COMMENT ON TABLE  public.published_content                IS 'Posts agendados e publicados nas redes sociais (V2)';
COMMENT ON COLUMN public.published_content.social_post_id IS 'ID do post na rede social (Instagram, LinkedIn, etc.) para sincronizar métricas';
COMMENT ON TABLE  public.engagement_metrics               IS 'Métricas de engagement sincronizadas das redes sociais (V2)';
