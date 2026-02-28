import { createServerClient } from "@/lib/supabase/server";

// ============================================================
// Audit Log — Registo de acções críticas do sistema
// ============================================================

export type AuditAction =
  | "content.generate"
  | "content.delete"
  | "voz_dna.generate"
  | "voz_dna.save"
  | "manifesto.generate"
  | "editorial.generate"
  | "calendario.generate"
  | "profile.update"
  | "viral_research.generate";

interface AuditEntry {
  userId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
  success?: boolean;
  errorMsg?: string;
}

// Fire-and-forget: não bloqueia o handler se o audit falhar
export async function logAudit(entry: AuditEntry): Promise<void> {
  const supabase = createServerClient();

  try {
    await supabase.from("audit_log").insert({
      user_id:   entry.userId,
      action:    entry.action,
      metadata:  entry.metadata ?? null,
      success:   entry.success ?? true,
      error_msg: entry.errorMsg ?? null,
    });
  } catch (error) {
    // Nunca propaga erro — audit é não-bloqueante
    console.error("Erro ao registar audit log:", error);
  }
}
