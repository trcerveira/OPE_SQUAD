import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

// Rules and limits per platform
const PLATFORM_RULES: Record<string, { limit: number; rules: string }> = {
  Instagram: {
    limit: 2200,
    rules: `
- Começa com um hook FORTE na primeira linha (para o scroll)
- Desenvolve em 3-4 parágrafos curtos (máx 2-3 frases cada)
- Usa quebras de linha para respiração — nunca paredes de texto
- Termina com CTA claro e directo
- Adiciona 15-25 hashtags relevantes no fim (mistura nichos e específicos)
- 2-4 emojis estratégicos ao longo do texto (não em cada frase)
- Tom: pessoal, directo, como um amigo a falar`,
  },
  LinkedIn: {
    limit: 3000,
    rules: `
- Primeira linha é o gancho — deve fazer a pessoa clicar em "ver mais"
- Desenvolve uma história ou insight em 3-5 parágrafos
- Cada parágrafo tem 1-3 frases máximo
- Tom profissional mas humano — não corporativo
- Termina com uma pergunta ou CTA para comentários
- 3-5 hashtags no fim
- Sem emojis em excesso (máx 2-3 e só se fizerem sentido)`,
  },
  "Twitter/X": {
    limit: 280,
    rules: `
- MÁXIMO 280 caracteres — conta tudo incluindo espaços
- Directo ao ponto, sem introduções
- 1 ideia central, bem expressa
- CTA opcional se couber
- 0-2 hashtags no máximo
- Sem emojis a menos que sejam essenciais`,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { headline, body, platform, niche } = await req.json();

    if (!headline) {
      return NextResponse.json({ error: "Headline is required" }, { status: 400 });
    }

    const platformKey = (platform as string) in PLATFORM_RULES ? platform : "Instagram";
    const { limit, rules } = PLATFORM_RULES[platformKey];

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `És um copywriter especialista em ${platformKey} para solopreneurs e criadores de conteúdo.

Contexto do post:
- Plataforma: ${platformKey} (limite: ${limit} chars)
- Nicho: ${niche || "solopreneur / negócio digital / coaching"}
- Headline do design: ${headline}
${body ? `- Conteúdo adicional: ${body}` : ""}

Regras para ${platformKey}:${rules}

Escreve uma legenda em português de Portugal que:
1. Complementa o headline acima (não o repete palavra por palavra)
2. Tem um hook poderoso logo na primeira frase
3. Desenvolve o tema com valor real para o leitor
4. Termina com CTA claro

IMPORTANTE: Escreve APENAS a legenda final, sem introdução, sem "Aqui está:", sem explicações. Só o texto da legenda.`,
        },
      ],
    });

    const caption = (message.content[0] as { type: string; text: string }).text;

    return NextResponse.json({ caption });
  } catch (error) {
    console.error("Error generating caption:", error);
    return NextResponse.json({ error: "Error generating caption" }, { status: 500 });
  }
}
