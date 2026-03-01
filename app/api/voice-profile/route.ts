import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getVoiceProfile, saveGeniusProfile } from "@/lib/supabase/user-profiles";

// GET /api/voice-profile — returns the user's voice profile
// Source of truth: Supabase (user_voice_profiles table)
// Fallback: Clerk unsafeMetadata (backwards compatibility)
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 1. Try Supabase first (source of truth)
  const supabaseProfile = await getVoiceProfile(userId);
  if (supabaseProfile) {
    return NextResponse.json({
      source: "supabase",
      vozDNA:           supabaseProfile.vozDNA,
      geniusProfile:    supabaseProfile.geniusProfile,
      manifestoAnswers: supabaseProfile.manifestoAnswers,
    });
  }

  // 2. Fallback to Clerk unsafeMetadata (for users who saved before Supabase migration)
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const clerkVozDNA           = user.unsafeMetadata?.vozDNA as Record<string, unknown> | undefined;
  const clerkGeniusProfile    = user.unsafeMetadata?.geniusProfile as Record<string, unknown> | undefined;
  const clerkManifestoAnswers = user.unsafeMetadata?.manifestoAnswers as Record<string, string> | undefined;

  // If Clerk has data, return it (and optionally back-fill Supabase in the background)
  if (clerkVozDNA || clerkGeniusProfile || clerkManifestoAnswers) {
    return NextResponse.json({
      source: "clerk_fallback",
      vozDNA:           clerkVozDNA ?? null,
      geniusProfile:    clerkGeniusProfile ?? null,
      manifestoAnswers: clerkManifestoAnswers ?? null,
    });
  }

  // 3. No data found anywhere
  return NextResponse.json({
    source: "none",
    vozDNA:           null,
    geniusProfile:    null,
    manifestoAnswers: null,
  });
}

// PUT /api/voice-profile — saves genius profile to Supabase
// Called from the client-side GeniusAssessment component (fire-and-forget)
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { geniusProfile?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.geniusProfile) {
    // Fire-and-forget style but we await here since this is the explicit save endpoint
    await saveGeniusProfile(userId, body.geniusProfile);
  }

  return NextResponse.json({ ok: true });
}
