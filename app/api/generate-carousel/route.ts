import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";
import { getVoiceProfile } from "@/lib/supabase/user-profiles";

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

  let body: { topic: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { topic } = body;
  if (!topic?.trim()) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  const user = await currentUser();
  const authorName = user?.firstName ?? "Coach";

  // Get Voice DNA — try Supabase first, then Clerk fallback
  let vozDNASection = "";
  const voiceProfile = await getVoiceProfile(userId);
  const dna = voiceProfile?.vozDNA as Record<string, string | string[]> | null;

  if (dna) {
    vozDNASection = `
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
      vozDNASection = `
VOZ & DNA DE ${authorName.toUpperCase()}:
Arquetipo: ${clerkDNA.arquetipo ?? "Mentor Directo"}
Tom: ${Array.isArray(clerkDNA.tomEmTresPalavras) ? clerkDNA.tomEmTresPalavras.join(", ") : "Directo"}
VOCABULARIO OBRIGATORIO: ${Array.isArray(clerkDNA.vocabularioActivo) ? clerkDNA.vocabularioActivo.join(", ") : ""}
VOCABULARIO PROIBIDO: ${Array.isArray(clerkDNA.vocabularioProibido) ? clerkDNA.vocabularioProibido.join(", ") : ""}`;
    }
  }

  const systemPrompt = `Es o melhor criador de carrosseis de Instagram do mundo para solopreneurs.

MISSAO: Gerar exactamente 18 textos para um carrossel de 9 slides na voz de ${authorName}.
${vozDNASection}

ESTRUTURA DO CARROSSEL (9 slides, 18 textos):
- texto 1: Tag/subtitulo do cover (curto, 3-6 palavras, em maiusculas)
- texto 2: Titulo principal do cover (impactante, 4-8 palavras, em maiusculas)
- texto 3: Headline slide 2 (bold, directo, em maiusculas)
- texto 4: Corpo slide 2 (1-2 frases explicativas)
- texto 5: Corpo slide 3 paragrafo 1 (insight ou ponto principal)
- texto 6: Corpo slide 3 paragrafo 2 (desenvolvimento)
- texto 7: Headline slide 4 (frase de impacto, em maiusculas)
- texto 8: Corpo slide 4 (pode estar escondido no template - manter curto)
- texto 9: Corpo slide 5 paragrafo 1 (insight concreto)
- texto 10: Corpo slide 5 paragrafo 2 (desenvolvimento)
- texto 11: Headline slide 6 (bold, provocador, em maiusculas)
- texto 12: Corpo slide 6 (1-2 frases)
- texto 13: Headline slide 7 (em maiusculas)
- texto 14: Corpo slide 7 (1-2 frases)
- texto 15: Corpo slide 8 paragrafo 1 (insight)
- texto 16: Corpo slide 8 paragrafo 2 (desenvolvimento)
- texto 17: Corpo slide 8 paragrafo 3 (conclusao do ponto)
- texto 18: CTA final (frase de chamada a accao + credito)

REGRAS:
1. Escreve em Portugues europeu, na voz de ${authorName}
2. Headlines em MAIUSCULAS, corpo em minusculas normais
3. Cada texto deve ser conciso e impactante
4. O carrossel deve contar uma historia progressiva sobre o tema
5. O CTA final deve ser natural, nao forcado
6. NUNCA inventes dados, numeros ou provas sociais falsas

FORMATO DE RESPOSTA — JSON exacto:
{
  "textos": "texto 1 - ...\ntexto 2 - ...\n...\ntexto 18 - ...",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

O campo "textos" tem EXACTAMENTE 18 linhas no formato "texto N - conteudo".
O campo "keywords" tem 5 palavras-chave em ingles para pesquisa de imagens no Unsplash (relacionadas com o tema).

Responde APENAS com JSON valido. Sem texto antes ou depois.`;

  const userPrompt = `Cria um carrossel de Instagram sobre: ${topic}`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
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

    const parsed = JSON.parse(jsonText) as { textos: string; keywords: string[] };
    const tokens = message.usage.input_tokens + message.usage.output_tokens;

    // Audit log (non-blocking)
    logAudit({
      userId,
      action: "carousel.generate",
      metadata: { topic: topic.slice(0, 100), tokens },
    });

    return NextResponse.json({
      textos: parsed.textos,
      keywords: parsed.keywords ?? [],
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
