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

ALGORITMO DO INSTAGRAM (confirmado por Adam Mosseri, CEO do Instagram, Janeiro 2025):
Os 3 sinais que determinam se o carrossel chega a novas pessoas:
1. WATCH TIME — o sinal #1. Cada slide tem de ganhar o direito de o utilizador passar para o proximo. O cover decide TUDO.
2. SENDS PER REACH (DM Shares) — o sinal mais poderoso para alcance nao-seguidores. Cria conteudo que alguem quer enviar a um amigo. Isto vale 3-5x mais que likes.
3. LIKES PER REACH — engagement genuino. Quanto mais likes por pessoa alcancada, melhor.

REGRAS DO ALGORITMO PARA CARROSSEIS:
- O cover (slide 1) tem 1.7 segundos para parar o scroll — usa contradição, numero concreto ou pergunta incomoda
- Cada slide deve criar uma micro-tensao que puxa para o proximo (retencao = watch time)
- O ultimo slide DEVE ter um CTA que gere DM shares: "Envia a alguem que [situacao]" ou "Guarda isto para quando [momento]"
- ZERO emojis em todo o carrossel — texto limpo, profissional
- Sem watermarks, sem conteudo reciclado — originalidade e o que o algoritmo premeia
- Conteudo que provoca "eu preciso de enviar isto a alguem" = viral

ESTRUTURA DO CARROSSEL (9 slides, 18 textos):
- texto 1: Tag/subtitulo do cover (curto, 3-6 palavras, em maiusculas — cria contexto)
- texto 2: Titulo principal do cover (HOOK que para o scroll em 1.7s, 4-8 palavras, em maiusculas)
- texto 3: Headline slide 2 (bold, directo, em maiusculas — promessa do que vao aprender)
- texto 4: Corpo slide 2 (1-2 frases — agita o problema com as palavras do leitor)
- texto 5: Corpo slide 3 paragrafo 1 (primeiro insight concreto e accionavel)
- texto 6: Corpo slide 3 paragrafo 2 (desenvolvimento com especificidade)
- texto 7: Headline slide 4 (frase de impacto em maiusculas — virada ou contra-intuitivo)
- texto 8: Corpo slide 4 (manter curto, complementa o headline)
- texto 9: Corpo slide 5 paragrafo 1 (segundo insight, mais profundo)
- texto 10: Corpo slide 5 paragrafo 2 (exemplo concreto ou prova)
- texto 11: Headline slide 6 (bold, provocador, em maiusculas — o golden nugget)
- texto 12: Corpo slide 6 (o insight mais valioso do carrossel, shareable)
- texto 13: Headline slide 7 (em maiusculas — consequencia ou transformacao)
- texto 14: Corpo slide 7 (1-2 frases — antes vs depois ou resultado)
- texto 15: Corpo slide 8 paragrafo 1 (sintese — o que muda quando aplicas isto)
- texto 16: Corpo slide 8 paragrafo 2 (reforco emocional)
- texto 17: Corpo slide 8 paragrafo 3 (frase final do argumento)
- texto 18: CTA final que GERA DM SHARES (ex: "Envia a alguem que precisa de ouvir isto" ou "Guarda para reler quando [situacao]")

REGRAS ABSOLUTAS:
1. Escreve em Portugues europeu, na voz de ${authorName}
2. Headlines em MAIUSCULAS, corpo em minusculas normais
3. ZERO emojis — nenhum emoji em nenhum texto
4. Cada slide deve criar tensao para o proximo (retencao maximiza watch time)
5. O carrossel conta uma historia progressiva — nao e uma lista, e uma narrativa
6. Especificidade vence generalidade: "perder 8kg em 8 semanas" > "ficar em forma"
7. O CTA final deve provocar DM shares — e o sinal mais valioso do algoritmo
8. NUNCA inventes dados, numeros ou provas sociais falsas

FORMATO DE RESPOSTA — JSON exacto:
{
  "textos": "texto 1 - ...\ntexto 2 - ...\n...\ntexto 18 - ...",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "imagePrompts": [
    "slide 1 image description in English",
    "slide 2 image description in English",
    "slide 3 image description in English",
    "slide 4 image description in English",
    "slide 5 image description in English",
    "slide 6 image description in English",
    "slide 7 image description in English",
    "slide 8 image description in English",
    "slide 9 image description in English"
  ]
}

O campo "textos" tem EXACTAMENTE 18 linhas no formato "texto N - conteudo".
O campo "keywords" tem 5 palavras-chave em ingles para pesquisa de imagens no Unsplash (relacionadas com o tema).
O campo "imagePrompts" tem EXACTAMENTE 9 descricoes em INGLES para gerar imagens com AI, uma por slide.

REGRAS PARA imagePrompts:
- Slide 1 (cover): imagem dramatica, cinematica, escura, relacionada ao tema. Sem texto na imagem.
- Slides impares (3,5,7): imagens mood/atmosfericas, tons escuros, abstractas ou metaforicas.
- Slides pares (2,4,6,8): imagens profissionais, tons claros, concretas e realistas.
- Slide 9 (CTA): imagem inspiracional, cinematica, ampla.
- TODAS as descricoes devem ser especificas ao tema do carrossel.
- Cada prompt deve ter 15-25 palavras, estilo "professional photography, cinematic lighting, [descricao]".
- NUNCA incluir texto, letras ou palavras na descricao da imagem.

Responde APENAS com JSON valido. Sem texto antes ou depois.`;

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
      metadata: { topic: topic.slice(0, 100), tokens },
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
