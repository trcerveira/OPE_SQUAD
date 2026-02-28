-- ============================================================
-- OPE_SQUAD — Migration 004: Subscriptions (V2 — Stripe)
-- Created: 2026-02-27
-- Status: PENDING — apply when integrating Stripe
-- ============================================================
-- Business model:
--   FREE TRIAL 7 days → auto-charge on day 8 (Stripe)
--   Statuses: trial | active | cancelled | past_due
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             text        NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  stripe_customer_id  text        UNIQUE,          -- Stripe customer ID
  stripe_sub_id       text        UNIQUE,          -- Stripe subscription ID
  plan                text        DEFAULT 'trial', -- trial | monthly | yearly
  status              text        DEFAULT 'trial', -- trial | active | cancelled | past_due
  trial_ends_at       timestamptz,                 -- When the trial expires (created_at + 7 days)
  current_period_end  timestamptz,                 -- Next billing date
  cancelled_at        timestamptz,                 -- When it was cancelled (if applicable)
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT valid_status CHECK (status IN ('trial', 'active', 'cancelled', 'past_due')),
  CONSTRAINT valid_plan   CHECK (plan   IN ('trial', 'monthly', 'yearly'))
);

-- A user has only one active subscription
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_active
  ON public.subscriptions (user_id)
  WHERE status IN ('trial', 'active');

-- Trigger updated_at (reuses function created in 003)
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user_view_own_subscription"
  ON public.subscriptions FOR SELECT USING (true);

-- Comments
COMMENT ON TABLE  public.subscriptions                   IS 'User subscriptions — Stripe integration (V2)';
COMMENT ON COLUMN public.subscriptions.stripe_customer_id IS 'Customer ID in the Stripe Dashboard';
COMMENT ON COLUMN public.subscriptions.trial_ends_at     IS 'Free trial end date (created_at + 7 days)';
COMMENT ON COLUMN public.subscriptions.current_period_end IS 'Next renewal/billing date';
