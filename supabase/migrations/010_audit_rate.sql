-- ============================================================
-- Migration 010 — Audit Log + Rate Limits
-- ============================================================
-- Dois problemas resolvidos:
--
--  1. AUDIT LOG — registo imutável de acções críticas do sistema
--     (quem gerou o quê e quando, quem apagou, quem mudou DNA)
--     → Antifragilidade: permite reconstruir o estado em qualquer momento
--
--  2. RATE LIMITS — controlo de consumo da Claude API por utilizador
--     → Cada linha = 1 chamada a uma API com custo
--     → Agregamos por user_id + endpoint + dia
-- ============================================================

-- ── PARTE 1: Audit Log ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Quem fez
  user_id     TEXT        NOT NULL,

  -- O quê
  action      TEXT        NOT NULL,
  -- Exemplos: 'content.generate', 'content.delete', 'voz_dna.generate',
  --           'manifesto.generate', 'profile.update', 'editorial.generate'

  -- Detalhes opcionais (sem PII sensível)
  metadata    JSONB,
  -- Ex: { "format": "reel", "subtype": "viral7s", "topic": "...", "tokens": 1234 }

  -- Resultado
  success     BOOLEAN     DEFAULT true NOT NULL,
  error_msg   TEXT,       -- preenchido se success = false

  -- Quando
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.audit_log IS
  'Registo imutável de todas as acções críticas do sistema. '
  'Nunca se apaga — serve para debugging, billing e recuperação de estado.';

-- Índices para queries mais comuns
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON public.audit_log (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON public.audit_log (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_date
  ON public.audit_log (created_at DESC);

-- RLS — imutável: service_role pode INSERT e SELECT, nunca UPDATE/DELETE
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloquear_acesso_directo"
  ON public.audit_log
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ── PARTE 2: Rate Limits ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Quem e onde
  user_id     TEXT        NOT NULL,
  endpoint    TEXT        NOT NULL,
  -- Valores: 'generate', 'manifesto', 'voz-dna', 'editorial',
  --          'calendario', 'viral-research', 'generate-caption'

  -- Quando (data exacta para agregação por dia)
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.rate_limits IS
  'Uma linha por chamada a uma API com custo (Claude API). '
  'Limites configurados por endpoint: generate=20/dia, manifesto=3/dia, etc. '
  'Limpeza automática: rows com mais de 7 dias são descartáveis.';

-- Índice composto para a query de contagem (user + endpoint + today)
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint_day
  ON public.rate_limits (user_id, endpoint, created_at DESC);

-- RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloquear_acesso_directo"
  ON public.rate_limits
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ── PARTE 3: Função de limpeza de rate_limits (housekeeping) ─

-- Função para apagar rate_limits com mais de 30 dias (manter base limpa)
-- Chamada manualmente ou via cron job no Supabase Dashboard
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
  'Apaga registos de rate_limits com mais de 30 dias. '
  'Chamar periodicamente via Supabase Dashboard → Edge Functions → Cron.';
