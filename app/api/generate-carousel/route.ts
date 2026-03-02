import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";
import { getVoiceProfile } from "@/lib/supabase/user-profiles";
import { buildPremiumSystemPrompt } from "@/lib/prompts/carousel-premium";

// -- Output quality validation ------------------------------------------------

interface CarouselOutput {
  textos: string;
  keywords: string[];
  imagePrompts?: string[];
}

interface QualityIssue {
  rule: string;
  detail: string;
}

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

function validateCarouselQuality(parsed: CarouselOutput): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const lines = parsed.textos.split("\n").filter((l) => l.trim());

  // Count textos
  const textoLines = lines.filter((l) => /^texto\s*\d+\s*[-–:]/i.test(l));
  if (textoLines.length < 16) {
    issues.push({ rule: "count", detail: `Only ${textoLines.length} textos found, expected 18` });
  }

  // Check for emojis in any texto
  for (const line of textoLines) {
    if (EMOJI_REGEX.test(line)) {
      issues.push({ rule: "emoji", detail: `Emoji found in: ${line.slice(0, 60)}...` });
      break;
    }
  }

  // Check headline textos are uppercase (1, 2, 3, 7, 11, 13)
  const headlineIndices = [1, 2, 3, 7, 11, 13];
  for (const idx of headlineIndices) {
    const match = textoLines.find((l) => new RegExp(`^texto\\s*${idx}\\s*[-–:]`, "i").test(l));
    if (match) {
      const content = match.replace(/^texto\s*\d+\s*[-–:]\s*/i, "").trim();
      if (content.length > 3 && content !== content.toUpperCase()) {
        issues.push({ rule: "uppercase", detail: `texto ${idx} should be UPPERCASE: "${content.slice(0, 40)}"` });
      }
    }
  }

  // Check cover hook length (texto 2: 4-8 words)
  const coverHook = textoLines.find((l) => /^texto\s*2\s*[-–:]/i.test(l));
  if (coverHook) {
    const hookContent = coverHook.replace(/^texto\s*\d+\s*[-–:]\s*/i, "").trim();
    const wordCount = hookContent.split(/\s+/).length;
    if (wordCount > 10) {
      issues.push({ rule: "hook_length", detail: `Cover hook has ${wordCount} words (max 8): "${hookContent.slice(0, 50)}"` });
    }
  }

  // Check imagePrompts count
  if (!parsed.imagePrompts || parsed.imagePrompts.length < 9) {
    issues.push({ rule: "images", detail: `Only ${parsed.imagePrompts?.length ?? 0} imagePrompts, expected 9` });
  }

  // Check keywords count
  if (!parsed.keywords || parsed.keywords.length < 3) {
    issues.push({ rule: "keywords", detail: `Only ${parsed.keywords?.length ?? 0} keywords, expected 5` });
  }

  return issues;
}

function buildRefinementPrompt(original: string, issues: QualityIssue[]): string {
  const issueList = issues.map((i) => `- [${i.rule}] ${i.detail}`).join("\n");
  return `O teu output anterior tem problemas de qualidade. Corrige TODOS e devolve o JSON completo corrigido.

PROBLEMAS DETECTADOS:
${issueList}

OUTPUT ANTERIOR:
${original}

Devolve APENAS o JSON corrigido. Sem texto antes ou depois.`;
}

// -- Parse JSON from AI response text -----------------------------------------

function extractJSON(text: string): CarouselOutput {
  let jsonText = text.trim();
  const jsonStart = jsonText.indexOf("{");
  const jsonEnd = jsonText.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1) {
    jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
  }
  return JSON.parse(jsonText) as CarouselOutput;
}

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

    // Step 1: Generate initial output
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

    let parsed = extractJSON(content.text);
    let totalTokens = message.usage.input_tokens + message.usage.output_tokens;

    // Step 2: Validate quality — auto-refine once if issues found
    const issues = validateCarouselQuality(parsed);

    if (issues.length > 0) {
      try {
        const refinement = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 3000,
          system: systemPrompt,
          messages: [
            { role: "user", content: userPrompt },
            { role: "assistant", content: content.text },
            { role: "user", content: buildRefinementPrompt(content.text, issues) },
          ],
        });

        const refined = refinement.content[0];
        if (refined.type === "text") {
          const refinedParsed = extractJSON(refined.text);
          // Only use refined version if it has at least as many textos
          const refinedLines = refinedParsed.textos.split("\n").filter((l) => /^texto\s*\d+/i.test(l));
          const originalLines = parsed.textos.split("\n").filter((l) => /^texto\s*\d+/i.test(l));
          if (refinedLines.length >= originalLines.length) {
            parsed = refinedParsed;
          }
        }
        totalTokens += refinement.usage.input_tokens + refinement.usage.output_tokens;
      } catch {
        // Refinement failed — use original output (still good enough)
      }
    }

    // Audit log (non-blocking)
    logAudit({
      userId,
      action: "carousel.generate",
      metadata: {
        topic: topic.slice(0, 100),
        tokens: totalTokens,
        paletteId: paletteId ?? "none",
        refined: issues.length > 0,
        issues: issues.length,
      },
    });

    return NextResponse.json({
      textos: parsed.textos,
      keywords: parsed.keywords ?? [],
      imagePrompts: parsed.imagePrompts ?? [],
      tokens: totalTokens,
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
