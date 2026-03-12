import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { WaitlistSchema, validateInput } from "@/lib/validators";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";

export async function POST(req: NextRequest) {
  // IP-based rate limit (5 per day) — no auth required
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = await checkAndConsumeRateLimit(`ip:${ip}`, "waitlist");
  if (!rateCheck.allowed) {
    return NextResponse.json(rateLimitResponse(rateCheck), { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Validate with Zod (email + normalisation + minimum name length)
  const validation = validateInput(WaitlistSchema, body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { email, name } = validation.data;

  try {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("waitlist")
      .insert({ email, nome: name ?? null });

    if (error) {
      // Code 23505 = duplicate email (UNIQUE constraint in migration 006)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already on the list. See you soon!" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
