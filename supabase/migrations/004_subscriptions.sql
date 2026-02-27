-- ============================================================
-- OPE_SQUAD — Migration 004: Subscrições (V2 — Stripe)
-- Criado em: 2026-02-27
-- Estado: PENDENTE — aplicar quando integrar Stripe
-- ============================================================
-- Modelo de negócio:
--   FREE TRIAL 7 dias → auto-cobra no dia 8 (Stripe)
--   Estados: trial | active | cancelled | past_due
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             text        NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  stripe_customer_id  text        UNIQUE,          -- ID do cliente no Stripe
  stripe_sub_id       text        UNIQUE,          -- ID da subscrição no Stripe
  plan                text        DEFAULT 'trial', -- trial | monthly | yearly
  status              text        DEFAULT 'trial', -- trial | active | cancelled | past_due
  trial_ends_at       timestamptz,                 -- Quando o trial expira (criado_at + 7 dias)
  current_period_end  timestamptz,                 -- Próxima data de cobrança
  cancelled_at        timestamptz,                 -- Quando foi cancelado (se foi)
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT valid_status CHECK (status IN ('trial', 'active', 'cancelled', 'past_due')),
  CONSTRAINT valid_plan   CHECK (plan   IN ('trial', 'monthly', 'yearly'))
);

-- Um utilizador tem apenas uma subscrição activa
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_active
  ON public.subscriptions (user_id)
  WHERE status IN ('trial', 'active');

-- Trigger updated_at (reutiliza função criada em 003)
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "utilizador_ve_propria_subscricao"
  ON public.subscriptions FOR SELECT USING (true);

-- Comentários
COMMENT ON TABLE  public.subscriptions                   IS 'Subscrições dos utilizadores — integração Stripe (V2)';
COMMENT ON COLUMN public.subscriptions.stripe_customer_id IS 'ID do cliente no Stripe Dashboard';
COMMENT ON COLUMN public.subscriptions.trial_ends_at     IS 'Data de fim do trial gratuito (criado_at + 7 dias)';
COMMENT ON COLUMN public.subscriptions.current_period_end IS 'Próxima data de renovação/cobrança';
