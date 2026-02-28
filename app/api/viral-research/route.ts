import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";
import { ViralResearchSchema, validateInput } from "@/lib/validators";

// Voice DNA stored in Clerk
interface VozDNA {
  arquetipo?: string;
  descricaoArquetipo?: string;
  tomEmTresPalavras?: string[];
  vocabularioActivo?: string[];
  vocabularioProibido?: string[];
  frasesAssinatura?: string[];
  regrasEstilo?: string[];
}

// Genius Profile stored in Clerk
interface GeniusProfile {
  hendricksZone?: string;
  wealthProfile?: string;
  kolbeMode?: string;
  fascinationAdvantage?: string;
}

const platformNames: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X/Twitter",
  email: "Email",
};

// Generates 5 unique angles for a topic based on the creator's profile
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Rate limiting — 20 viral research calls per day
  const rateLimit = await checkAndConsumeRateLimit(userId, "viral-research");
  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate with Zod
  const validation = validateInput(ViralResearchSchema, rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { platform, topic } = validation.data;

  // Read the user profile from Clerk
  const user = await currentUser();
  const authorName = user?.firstName ?? "Creator";
  const vozDNA = user?.unsafeMetadata?.vozDNA as VozDNA | undefined;
  const geniusProfile = user?.unsafeMetadata?.geniusProfile as GeniusProfile | undefined;

  const platformName = platformNames[platform] ?? platform;

  // Voice DNA section for the prompt
  const vozSection = vozDNA
    ? `VOICE DNA DE ${authorName.toUpperCase()}:
- Arquétipo: ${vozDNA.arquetipo ?? "não definido"}
- Tom: ${vozDNA.tomEmTresPalavras?.join(", ") ?? "não definido"}
- Vocabulário activo: ${vozDNA.vocabularioActivo?.join(", ") ?? "não definido"}
- Frases assinatura: ${vozDNA.frasesAssinatura?.join(" | ") ?? "nenhuma"}
- Regras de estilo: ${vozDNA.regrasEstilo?.join(" | ") ?? "nenhuma"}`
    : `VOICE DNA DE ${authorName.toUpperCase()}: não definido ainda`;

  // Genius Profile section for the prompt
  const geniusSection = geniusProfile
    ? `GENIUS PROFILE DE ${authorName.toUpperCase()}:
- Zona de Genialidade (Hendricks): ${geniusProfile.hendricksZone ?? "não definida"}
- Perfil de Riqueza (Wealth Dynamics): ${geniusProfile.wealthProfile ?? "não definido"}
- Modo de Acção (Kolbe): ${geniusProfile.kolbeMode ?? "não definido"}
- Vantagem Fascinante (Hogshead): ${geniusProfile.fascinationAdvantage ?? "não definida"}`
    : `GENIUS PROFILE DE ${authorName.toUpperCase()}: não definido ainda`;

  const systemPrompt = `És um estratega de conteúdo especialista em posicionamento único para solopreneurs. O teu trabalho é analisar o perfil único de um criador e gerar ângulos de abordagem que APENAS essa pessoa pode tomar de forma autêntica.

PRINCÍPIO CENTRAL: O algoritmo do ${platformName} em 2025 premia conteúdo original que só o criador poderia fazer. Cada ângulo que geras deve ser impossível de copiar por outra pessoa — deve reflectir directamente o arquétipo, experiência, e perspectiva única deste criador.

NUNCA: ângulos genéricos que qualquer conta poderia publicar.
SEMPRE: ângulos que revelam uma perspectiva que só ${authorName} tem.`;

  const userPrompt = `CRIADOR: ${authorName}
PLATAFORMA: ${platformName}
TEMA BRUTO: "${topic}"

${vozSection}

${geniusSection}

Gera 5 ângulos únicos para ${authorName} abordar o tema acima no ${platformName}.

Cada ângulo deve:
1. Reflectir directamente o Voice DNA e Genius Profile deste criador
2. Ser impossível de tomar por outra pessoa — específico à sua experiência e perspectiva
3. Incluir um hook de abertura concreto e específico, pronto a usar como primeira linha
4. Explicar em 1 frase curta porque só ${authorName} pode falar a partir deste ângulo

Devolve EXACTAMENTE este JSON (sem markdown, sem explicações — só JSON válido):
{
  "angles": [
    {
      "title": "Nome curto e memorável do ângulo (máx 5 palavras)",
      "hook": "Linha de abertura completa — específica, pronta a usar como primeira frase do post",
      "why_unique": "1 frase: porque só ${authorName} pode tomar este ângulo"
    },
    {
      "title": "...",
      "hook": "...",
      "why_unique": "..."
    },
    {
      "title": "...",
      "hook": "...",
      "why_unique": "..."
    },
    {
      "title": "...",
      "hook": "...",
      "why_unique": "..."
    },
    {
      "title": "...",
      "hook": "...",
      "why_unique": "..."
    }
  ]
}

REGRAS:
- Hooks são linhas de abertura COMPLETAS — não títulos, não perguntas vagas
- Cada hook deve parar o scroll em 1,7 segundos (regra Mosseri)
- O why_unique refere sempre uma característica específica do Voice DNA ou Genius Profile
- Tudo em Português de Portugal`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected AI response" }, { status: 500 });
    }

    const cleaned = content.text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse JSON:", content.text);
      return NextResponse.json(
        { error: "Error processing response. Please try again." },
        { status: 500 }
      );
    }

    logAudit({ userId, action: "viral_research.generate", metadata: { platform, topic: topic.slice(0, 100) } });
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Anthropic API error:", error);
    logAudit({ userId, action: "viral_research.generate", success: false, errorMsg: String(error) });
    return NextResponse.json(
      { error: "Error generating angles. Please try again." },
      { status: 500 }
    );
  }
}
