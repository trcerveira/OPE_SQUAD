import { createServerClient } from "@/lib/supabase/server";

// ============================================================
// Rate Limiting — Claude API consumption control
// DB-based (Supabase) to work in serverless environments
// ============================================================

// Per-user daily limits (UTC)
const DAILY_LIMITS: Record<string, number> = {
  "generate":        20,  // Content Factory — 20 posts/day
  "manifesto":        3,  // Manifesto — 3 generations/day (rare to regenerate)
  "voz-dna":          5,  // Voice DNA — 5/day
  "editorial":        5,  // Editorial Lines — 5/day
  "calendario":       5,  // Editorial Calendar — 5/day
  "viral-research":  20,  // Viral Angles — 20/day
  "generate-caption": 30, // Captions — 30/day (lighter calls)
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: string; // ISO timestamp of today's UTC midnight
}

// Start of the day in UTC (for the 24h window)
function getTodayWindowStart(): string {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now.toISOString();
}

// End of the day in UTC (for the reset message)
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
    // Count how many calls have already been made today for this endpoint
    const { count, error: countError } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("endpoint", endpoint)
      .gte("created_at", windowStart);

    if (countError) {
      // On DB error, allow the call (do not block the user)
      console.error("Error checking rate limit:", countError);
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

    // Record this call
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
    // Never block on technical error — just log it
    console.error("Unexpected error in rate limiter:", error);
    return { allowed: true, remaining: limit, limit, resetAt: getTodayWindowEnd() };
  }
}

// Helper for standardised 429 response
export function rateLimitResponse(result: RateLimitResult) {
  return {
    error: `Daily limit reached for this resource. You have ${result.limit} per day. Try again tomorrow.`,
    limit: result.limit,
    remaining: 0,
    resetAt: result.resetAt,
  };
}
