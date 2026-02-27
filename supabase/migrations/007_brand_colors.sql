-- Migration 007: Paleta de cores da marca por utilizador
-- Cada utilizador pode personalizar as 4 cores principais da interface

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS brand_bg      TEXT DEFAULT '#0A0E1A',
  ADD COLUMN IF NOT EXISTS brand_surface TEXT DEFAULT '#111827',
  ADD COLUMN IF NOT EXISTS brand_accent  TEXT DEFAULT '#BFD64B',
  ADD COLUMN IF NOT EXISTS brand_text    TEXT DEFAULT '#F0ECE4';

COMMENT ON COLUMN public.user_profiles.brand_bg      IS 'Cor de fundo principal (hex)';
COMMENT ON COLUMN public.user_profiles.brand_surface IS 'Cor de superfície / containers (hex)';
COMMENT ON COLUMN public.user_profiles.brand_accent  IS 'Cor de destaque / CTAs (hex)';
COMMENT ON COLUMN public.user_profiles.brand_text    IS 'Cor do texto principal (hex)';
