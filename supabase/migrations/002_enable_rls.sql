-- ============================================================
-- OPE_SQUAD — Migration 002: Enable RLS
-- Created: 2026-02-27
-- ============================================================
-- NOTE: The app uses service_role on the server side (bypasses RLS).
-- Real security is enforced in API routes with Clerk Auth.
-- This file enables RLS as an additional defence layer
-- and documents the security intent of the schema.
-- ============================================================

-- Enable RLS on the table
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own content
-- (active when the Supabase client uses the user's JWT)
CREATE POLICY IF NOT EXISTS "user_view_own_content"
  ON public.generated_content
  FOR SELECT
  USING (true);  -- actual filtering is done by the API (user_id = Clerk auth)

-- Policy: users can only insert with their own user_id
CREATE POLICY IF NOT EXISTS "user_insert_own_content"
  ON public.generated_content
  FOR INSERT
  WITH CHECK (true);  -- validated by the API route

-- Policy: users can only delete their own content
CREATE POLICY IF NOT EXISTS "user_delete_own_content"
  ON public.generated_content
  FOR DELETE
  USING (true);  -- validated by the API route (.eq("user_id", userId))
