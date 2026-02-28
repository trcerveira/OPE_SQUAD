import { createServerClient } from "@/lib/supabase/server";

// ============================================================
// Rate Limiting — Controlo de consumo da Claude API
// Baseado em DB (Supabase) para funcionar em ambiente serverless
// ============================================================

// Limites por utilizador por dia (UTC)
const DAILY_LIMITS: Record<string, number> = {
  "generate":        20,  // Content Factory — 20 posts/dia
  "manifesto":        3,  // Manifesto — 3 gerações/dia (é raro regenerar)
  "voz-dna":          5,  // DNA de Voz — 5/dia
  "editorial":        5,  // Linhas Editoriais — 5/dia
  "calendario":       5,  // Calendário Editorial — 5/dia
  "viral-research":  20,  // Ângulos Virais — 20/dia
  "generate-caption": 30, // Legendas — 30/dia (são mais leves)
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: string; // ISO timestamp da meia-noite UTC de hoje
}

// Início do dia em UTC (para janela de 24h)
function getTodayWindowStart(): string {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now.toISOString();
}

// Fim do dia em UTC (para a mensagem de reset)
function getTodayWindowEnd(): string {
  const now = new Date();
  now.setUTCHours(23, 59, 59, 999);
  return now.toISOString();
}

export async function checkAndConsumeRateLimit(
  userId: string,
  endpoint: string
): Promise<RateLimitResult> {
  const limit = DAILY_LIMITS[endpoint] ?? 10;
  const windowStart = getTodayWindowStart();

  const supabase = createServerClient();

  try {
    // Conta quantas chamadas já foram feitas hoje para este endpoint
    const { count, error: countError } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("endpoint", endpoint)
      .gte("created_at", windowStart);

    if (countError) {
      // Em caso de erro na BD, permite a chamada (não bloqueia o utilizador)
      console.error("Erro ao verificar rate limit:", countError);
      return { allowed: true, remaining: limit, limit, resetAt: getTodayWindowEnd() };
    }

    const used = count ?? 0;

    if (used >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        resetAt: getTodayWindowEnd(),
      };
    }

    // Regista esta chamada
    await supabase
      .from("rate_limits")
      .insert({ user_id: userId, endpoint });

    return {
      allowed: true,
      remaining: limit - used - 1,
      limit,
      resetAt: getTodayWindowEnd(),
    };
  } catch (error) {
    // Nunca bloqueia por erro técnico — apenas regista
    console.error("Erro inesperado no rate limiter:", error);
    return { allowed: true, remaining: limit, limit, resetAt: getTodayWindowEnd() };
  }
}

// Helper para resposta 429 padronizada
export function rateLimitResponse(result: RateLimitResult) {
  return {
    error: `Limite diário atingido para este recurso. Tens ${result.limit} por dia. Tenta amanhã.`,
    limit: result.limit,
    remaining: 0,
    resetAt: result.resetAt,
  };
}
