-- Migration 007: Brand colour palette per user
-- Each user can customise the 4 main interface colours

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS brand_bg      TEXT DEFAULT '#0A0E1A',
  ADD COLUMN IF NOT EXISTS brand_surface TEXT DEFAULT '#111827',
  ADD COLUMN IF NOT EXISTS brand_accent  TEXT DEFAULT '#BFD64B',
  ADD COLUMN IF NOT EXISTS brand_text    TEXT DEFAULT '#F0ECE4';

COMMENT ON COLUMN public.user_profiles.brand_bg      IS 'Main background colour (hex)';
COMMENT ON COLUMN public.user_profiles.brand_surface IS 'Surface / container colour (hex)';
COMMENT ON COLUMN public.user_profiles.brand_accent  IS 'Accent / CTA colour (hex)';
COMMENT ON COLUMN public.user_profiles.brand_text    IS 'Main text colour (hex)';
