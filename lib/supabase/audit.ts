import { createServerClient } from "@/lib/supabase/server";

// ============================================================
// Audit Log — Record of critical system actions
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
  | "viral_research.generate"
  | "carousel.generate";

interface AuditEntry {
  userId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
  success?: boolean;
  errorMsg?: string;
}

// Fire-and-forget: does not block the handler if the audit fails
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
    // Never propagates error — audit is non-blocking
    console.error("Error writing to audit log:", error);
  }
}
