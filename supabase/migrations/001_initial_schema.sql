-- ============================================================
-- OPE_SQUAD — Migration 001: Schema inicial
-- Criado em: 2026-02-27
-- Tabelas: generated_content
-- ============================================================

-- Tabela principal: conteúdo gerado pelo motor de IA
-- O user_id é o ID do utilizador no Clerk (não Supabase Auth)
CREATE TABLE IF NOT EXISTS public.generated_content (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     text        NOT NULL,  -- ID do utilizador (Clerk)
  platform    text        NOT NULL,  -- instagram | linkedin | twitter | email
  topic       text        NOT NULL,  -- tema do post
  content     text        NOT NULL,  -- conteúdo gerado
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Índice para acelerar queries por utilizador (mais comum)
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id
  ON public.generated_content (user_id);

-- Índice para ordenar por data (usado em GET /api/content)
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at
  ON public.generated_content (created_at DESC);

-- Comentários para documentação
COMMENT ON TABLE  public.generated_content          IS 'Conteúdo gerado pelo Content Factory para cada utilizador';
COMMENT ON COLUMN public.generated_content.user_id  IS 'ID do utilizador no Clerk (formato: user_xxxxxxx)';
COMMENT ON COLUMN public.generated_content.platform IS 'Plataforma destino: instagram, linkedin, twitter, email';
COMMENT ON COLUMN public.generated_content.topic    IS 'Tema ou ideia-base fornecida pelo utilizador';
COMMENT ON COLUMN public.generated_content.content  IS 'Conteúdo completo gerado pela IA, pronto a publicar';
