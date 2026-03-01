import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";
import { getVoiceProfile } from "@/lib/supabase/user-profiles";
import { buildPremiumSystemPrompt } from "@/lib/prompts/carousel-premium";

// POST /api/generate-carousel — generates 18 texts + image keywords for the Design Machine
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  // Shares the "generate" rate limit pool (20/day)
  const rateLimit = await checkAndConsumeRateLimit(userId, "generate");
  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
  }

  let body: { topic: string; paletteId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { topic, paletteId } = body;
  if (!topic?.trim()) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  const user = await currentUser();
  const authorName = user?.firstName ?? "Coach";

  // Get Voice DNA — try Supabase first, then Clerk fallback
  let voiceDNASection = "";
  const voiceProfile = await getVoiceProfile(userId);
  const dna = voiceProfile?.vozDNA as Record<string, string | string[]> | null;

  if (dna) {
    voiceDNASection = `
VOZ & DNA DE ${authorName.toUpperCase()}:
Arquetipo: ${dna.arquetipo ?? "Mentor Directo"}
Tom: ${Array.isArray(dna.tomEmTresPalavras) ? dna.tomEmTresPalavras.join(", ") : "Directo, Autentico, Pratico"}
VOCABULARIO OBRIGATORIO: ${Array.isArray(dna.vocabularioActivo) ? dna.vocabularioActivo.join(", ") : ""}
VOCABULARIO PROIBIDO: ${Array.isArray(dna.vocabularioProibido) ? dna.vocabularioProibido.join(", ") : ""}
FRASES ASSINATURA: ${Array.isArray(dna.frasesAssinatura) ? dna.frasesAssinatura.join(" | ") : ""}`;
  } else {
    // Try Clerk unsafeMetadata as fallback
    const clerkDNA = user?.unsafeMetadata?.vozDNA as Record<string, string | string[]> | undefined;
    if (clerkDNA) {
      voiceDNASection = `
VOZ & DNA DE ${authorName.toUpperCase()}:
Arquetipo: ${clerkDNA.arquetipo ?? "Mentor Directo"}
Tom: ${Array.isArray(clerkDNA.tomEmTresPalavras) ? clerkDNA.tomEmTresPalavras.join(", ") : "Directo"}
VOCABULARIO OBRIGATORIO: ${Array.isArray(clerkDNA.vocabularioActivo) ? clerkDNA.vocabularioActivo.join(", ") : ""}
VOCABULARIO PROIBIDO: ${Array.isArray(clerkDNA.vocabularioProibido) ? clerkDNA.vocabularioProibido.join(", ") : ""}`;
    }
  }

  const systemPrompt = buildPremiumSystemPrompt(authorName, voiceDNASection, paletteId);

  const userPrompt = `Cria um carrossel de Instagram sobre: ${topic}`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected AI response" }, { status: 500 });
    }

    // Parse JSON — strip any extra text around the JSON
    let jsonText = content.text.trim();
    const jsonStart = jsonText.indexOf("{");
    const jsonEnd = jsonText.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(jsonText) as { textos: string; keywords: string[]; imagePrompts?: string[] };
    const tokens = message.usage.input_tokens + message.usage.output_tokens;

    // Audit log (non-blocking)
    logAudit({
      userId,
      action: "carousel.generate",
      metadata: { topic: topic.slice(0, 100), tokens, paletteId: paletteId ?? "none" },
    });

    return NextResponse.json({
      textos: parsed.textos,
      keywords: parsed.keywords ?? [],
      imagePrompts: parsed.imagePrompts ?? [],
      tokens,
    });
  } catch (error) {
    console.error("Error generating carousel:", error);
    logAudit({ userId, action: "carousel.generate", success: false, errorMsg: String(error) });
    return NextResponse.json(
      { error: "Error generating carousel. Please try again." },
      { status: 500 }
    );
  }
}
