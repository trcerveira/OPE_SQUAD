import { createServerClient } from "@/lib/supabase/server";

// ============================================================
// Sincronização de Perfil Supabase ↔ Clerk
// ============================================================

interface SyncProfileParams {
  userId:            string;
  email:             string;
  name?:             string | null;
  geniusComplete:    boolean;
  manifestoComplete: boolean;
  vozDNAComplete:    boolean;
}

// Sincroniza o perfil do utilizador com user_profiles no Supabase.
// Optimizado: lê primeiro e só escreve se algo mudou.
// Chamada automaticamente quando o utilizador abre o dashboard.
export async function syncUserProfile(params: SyncProfileParams): Promise<void> {
  const supabase = createServerClient();

  try {
    // 1. Ler o perfil actual (evita writes desnecessários)
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("email, name, genius_complete, manifesto_complete, voz_dna_complete")
      .eq("user_id", params.userId)
      .maybeSingle();

    // 2. Verificar se algo mudou
    const hasChanges =
      !existing ||
      existing.email             !== params.email ||
      existing.name              !== (params.name ?? null) ||
      existing.genius_complete   !== params.geniusComplete ||
      existing.manifesto_complete!== params.manifestoComplete ||
      existing.voz_dna_complete  !== params.vozDNAComplete;

    // 3. Só faz upsert se houver alterações (antifragilidade: menos writes = menos pontos de falha)
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
    // Não bloqueia o dashboard se falhar — apenas regista
    console.error("Erro ao sincronizar perfil:", error);
  }
}

// Guarda backup do vozDNA na tabela user_voice_profiles (migration 009)
// Chamada pelo /api/voz-dna após geração bem-sucedida
export async function saveVoiceProfile(
  userId: string,
  vozDNA: Record<string, unknown>
): Promise<void> {
  const supabase = createServerClient();

  try {
    // Garantir que o user_profiles existe antes (FK constraint)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      console.warn("saveVoiceProfile: user_profiles row não encontrado para", userId);
      return;
    }

    // Upsert com incremento de versão
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
    console.error("Erro ao guardar vozDNA no Supabase:", error);
  }
}

// Guarda backup das respostas do Manifesto (migration 009)
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
    console.error("Erro ao guardar manifesto answers no Supabase:", error);
  }
}

// Lê o progresso real do utilizador a partir do Supabase (fonte de verdade para APIs)
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
