import { createServerClient } from "@/lib/supabase/server";

// ============================================================
// Supabase Profile Synchronisation ↔ Clerk
// ============================================================

interface SyncProfileParams {
  userId:            string;
  email:             string;
  name?:             string | null;
  geniusComplete:    boolean;
  manifestoComplete: boolean;
  vozDNAComplete:    boolean;
}

// Synchronises the user profile with user_profiles in Supabase.
// Optimised: reads first and only writes if something changed.
// Called automatically when the user opens the dashboard.
export async function syncUserProfile(params: SyncProfileParams): Promise<void> {
  const supabase = createServerClient();

  try {
    // 1. Read the current profile (avoids unnecessary writes)
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("email, name, genius_complete, manifesto_complete, voz_dna_complete")
      .eq("user_id", params.userId)
      .maybeSingle();

    // 2. Check if anything changed
    const hasChanges =
      !existing ||
      existing.email             !== params.email ||
      existing.name              !== (params.name ?? null) ||
      existing.genius_complete   !== params.geniusComplete ||
      existing.manifesto_complete!== params.manifestoComplete ||
      existing.voz_dna_complete  !== params.vozDNAComplete;

    // 3. Only upsert if there are changes (antifragility: fewer writes = fewer failure points)
    if (!hasChanges) return;

    await supabase.from("user_profiles").upsert(
      {
        user_id:            params.userId,
        email:              params.email,
        name:               params.name ?? null,
        genius_complete:    params.geniusComplete,
        manifesto_complete: params.manifestoComplete,
        voz_dna_complete:   params.vozDNAComplete,
        updated_at:         new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (error) {
    // Does not block the dashboard on failure — just logs it
    console.error("Error syncing profile:", error);
  }
}

// Saves a backup of vozDNA to the user_voice_profiles table (migration 009)
// Called by /api/voz-dna after a successful generation
export async function saveVoiceProfile(
  userId: string,
  vozDNA: Record<string, unknown>
): Promise<void> {
  const supabase = createServerClient();

  try {
    // Ensure the user_profiles row exists first (FK constraint)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      console.warn("saveVoiceProfile: user_profiles row not found for", userId);
      return;
    }

    // Upsert with version increment
    const { data: existing } = await supabase
      .from("user_voice_profiles")
      .select("voz_dna_version")
      .eq("user_id", userId)
      .maybeSingle();

    await supabase.from("user_voice_profiles").upsert(
      {
        user_id:         userId,
        voz_dna:         vozDNA,
        voz_dna_version: (existing?.voz_dna_version ?? 0) + 1,
        updated_at:      new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (error) {
    console.error("Error saving vozDNA to Supabase:", error);
  }
}

// Saves a backup of Manifesto answers (migration 009)
export async function saveManifestoAnswers(
  userId: string,
  answers: Record<string, string>
): Promise<void> {
  const supabase = createServerClient();

  try {
    await supabase.from("user_voice_profiles").upsert(
      {
        user_id:           userId,
        manifesto_answers: answers,
        updated_at:        new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (error) {
    console.error("Error saving manifesto answers to Supabase:", error);
  }
}

// Reads the full voice profile from Supabase (source of truth)
// Returns vozDNA, geniusProfile, manifestoAnswers or null if not found.
export async function getVoiceProfile(userId: string): Promise<{
  vozDNA: Record<string, unknown> | null;
  geniusProfile: Record<string, unknown> | null;
  manifestoAnswers: Record<string, string> | null;
} | null> {
  const supabase = createServerClient();

  try {
    const { data } = await supabase
      .from("user_voice_profiles")
      .select("voz_dna, genius_profile, manifesto_answers")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) return null;

    return {
      vozDNA:            data.voz_dna ?? null,
      geniusProfile:     data.genius_profile ?? null,
      manifestoAnswers:  data.manifesto_answers ?? null,
    };
  } catch (error) {
    console.error("Error reading voice profile from Supabase:", error);
    return null;
  }
}

// Saves a backup of geniusProfile to the user_voice_profiles table (migration 009)
// Called from the client-side GeniusAssessment via /api/voice-profile PUT
export async function saveGeniusProfile(
  userId: string,
  geniusProfile: Record<string, unknown>
): Promise<void> {
  const supabase = createServerClient();

  try {
    // Ensure the user_profiles row exists first (FK constraint)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      console.warn("saveGeniusProfile: user_profiles row not found for", userId);
      return;
    }

    // Upsert with version increment
    const { data: existing } = await supabase
      .from("user_voice_profiles")
      .select("genius_version")
      .eq("user_id", userId)
      .maybeSingle();

    await supabase.from("user_voice_profiles").upsert(
      {
        user_id:        userId,
        genius_profile: geniusProfile,
        genius_version: (existing?.genius_version ?? 0) + 1,
        updated_at:     new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (error) {
    console.error("Error saving geniusProfile to Supabase:", error);
  }
}

// Reads the user's real progress from Supabase (source of truth for APIs)
export async function getUserProgress(userId: string): Promise<{
  geniusComplete: boolean;
  manifestoComplete: boolean;
  vozDNAComplete: boolean;
} | null> {
  const supabase = createServerClient();

  try {
    const { data } = await supabase
      .from("user_profiles")
      .select("genius_complete, manifesto_complete, voz_dna_complete")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) return null;

    return {
      geniusComplete:    data.genius_complete,
      manifestoComplete: data.manifesto_complete,
      vozDNAComplete:    data.voz_dna_complete,
    };
  } catch {
    return null;
  }
}
