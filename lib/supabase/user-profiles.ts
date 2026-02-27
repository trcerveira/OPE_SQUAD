import { createServerClient } from "@/lib/supabase/server";

interface SyncProfileParams {
  userId: string;
  email: string;
  name?: string | null;
  geniusComplete: boolean;
  manifestoComplete: boolean;
  vozDNAComplete: boolean;
}

// Sincroniza o perfil do utilizador com a tabela user_profiles no Supabase.
// Usa upsert — cria se não existe, actualiza se já existe.
// Chamada automaticamente quando o utilizador abre o dashboard.
export async function syncUserProfile(params: SyncProfileParams): Promise<void> {
  try {
    const supabase = createServerClient();

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
      { onConflict: "user_id" } // se já existe, actualiza
    );
  } catch (error) {
    // Não bloqueia o dashboard se falhar — só regista o erro
    console.error("Erro ao sincronizar perfil:", error);
  }
}
