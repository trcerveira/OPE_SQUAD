import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserProgress } from "@/lib/supabase/user-profiles";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";

// GET /api/progress — returns the user's pipeline progress
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Rate limiting — 100 progress checks per day
  const rateLimit = await checkAndConsumeRateLimit(userId, "progress");
  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
  }

  const progress = await getUserProgress(userId);

  if (!progress) {
    return NextResponse.json({
      geniusComplete: false,
      manifestoComplete: false,
      vozDNAComplete: false,
    });
  }

  return NextResponse.json(progress);
}
