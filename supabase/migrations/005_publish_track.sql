-- ============================================================
-- OPE_SQUAD — Migration 005: Publish & Track (V2)
-- Created: 2026-02-27
-- Status: PENDING — apply when building Auto-Publish
-- ============================================================
-- Features:
--   - Schedule posts on social networks
--   - Record published posts
--   - Track engagement (likes, comments, shares)
-- ============================================================

-- Table for scheduled and published posts
CREATE TABLE IF NOT EXISTS public.published_content (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               text        NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  generated_content_id  uuid        REFERENCES public.generated_content(id) ON DELETE SET NULL,
  platform              text        NOT NULL,        -- instagram | linkedin | twitter | email
  status                text        DEFAULT 'draft', -- draft | scheduled | published | failed
  scheduled_for         timestamptz,                 -- When it is scheduled to publish
  published_at          timestamptz,                 -- When it was actually published
  social_post_id        text,                        -- Social network post ID (for tracking)
  error_message         text,                        -- Failure reason (if status = failed)
  created_at            timestamptz DEFAULT now() NOT NULL,
  updated_at            timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT valid_platform CHECK (platform IN ('instagram', 'linkedin', 'twitter', 'email')),
  CONSTRAINT valid_status   CHECK (status   IN ('draft', 'scheduled', 'published', 'failed'))
);

-- Index for fetching scheduled posts (publishing cron job)
CREATE INDEX IF NOT EXISTS idx_published_content_scheduled
  ON public.published_content (scheduled_for)
  WHERE status = 'scheduled';

-- Index for user history
CREATE INDEX IF NOT EXISTS idx_published_content_user
  ON public.published_content (user_id, created_at DESC);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_published_content_updated_at ON public.published_content;
CREATE TRIGGER trg_published_content_updated_at
  BEFORE UPDATE ON public.published_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Engagement metrics table
CREATE TABLE IF NOT EXISTS public.engagement_metrics (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  published_content_id  uuid        NOT NULL REFERENCES public.published_content(id) ON DELETE CASCADE,
  likes                 integer     DEFAULT 0 NOT NULL,
  comments              integer     DEFAULT 0 NOT NULL,
  shares                integer     DEFAULT 0 NOT NULL,
  views                 integer     DEFAULT 0 NOT NULL,
  clicks                integer     DEFAULT 0 NOT NULL,
  synced_at             timestamptz DEFAULT now() NOT NULL -- Last sync with the social network
);

-- RLS
ALTER TABLE public.published_content  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user_view_own_posts"
  ON public.published_content FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "user_view_own_metrics"
  ON public.engagement_metrics FOR SELECT USING (true);

-- Comments
COMMENT ON TABLE  public.published_content                IS 'Posts scheduled and published on social networks (V2)';
COMMENT ON COLUMN public.published_content.social_post_id IS 'Post ID on the social network (Instagram, LinkedIn, etc.) for syncing metrics';
COMMENT ON TABLE  public.engagement_metrics               IS 'Engagement metrics synced from social networks (V2)';
