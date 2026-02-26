import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Tipos para o Voice DNA guardado no Clerk
interface VoiceDNA {
  niche?: string;
  offer?: string;
  pain?: string;
  tone?: string;
  differentiator?: string;
}

// Mapeia as plataformas para instruções de formato específicas
const platformFormats: Record<string, string> = {
  instagram: `
Formato: Post para Instagram
- Máximo 2200 caracteres mas mantém conciso (ideal 150-300 palavras)
- Começa com um hook forte na primeira linha (sem introduções)
- Usa quebras de linha para facilitar leitura
- Inclui 3-5 hashtags relevantes no final (separadas por linha)
- Tom: directo e pessoal, como se fosse um story escrito`,

  linkedin: `
Formato: Post para LinkedIn
- 150-300 palavras
- Primeira linha é o hook (aparece antes do "ver mais")
- Usa espaçamento generoso entre parágrafos
- Termina com uma pergunta ou call to action
- Tom: profissional mas humano, primeira pessoa`,

  twitter: `
Formato: Thread para X/Twitter
- 3-5 tweets encadeados
- Tweet 1: Hook forte (máximo 280 caracteres)
- Tweets 2-4: Desenvolvimento do argumento (máximo 280 cada)
- Tweet final: Conclusão + CTA
- Formato: numera com (1/5), (2/5), etc.
- Tom: directo, sem rodeios`,

  email: `
Formato: Email para lista de subscribers
- Assunto: curto e intrigante (máximo 50 caracteres)
- Corpo: 200-400 palavras
- Estrutura: Hook → Problema → Solução → CTA
- Tom: conversa 1:1, como se fosse para um amigo
- Termina com um único CTA claro`,
};

// Tom de voz baseado na escolha do utilizador
const toneInstructions: Record<string, string> = {
  directo: "Tom directo e sem filtros: vai ao ponto, verdade primeiro, sem rodeios.",
  inspirador: "Tom inspirador e motivacional: energiza e motiva as pessoas a agir.",
  educativo: "Tom educativo e detalhado: explica o porquê com dados e exemplos.",
  casual: "Tom casual como um amigo: conversa como se fosse tomar café.",
};

export async function POST(request: NextRequest) {
  // Verifica autenticação
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Verifica se a API key está configurada
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no .env.local" },
      { status: 500 }
    );
  }

  // Lê o body do pedido
  let body: { platform: string; topic: string; voiceDNA: VoiceDNA };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { platform, topic, voiceDNA } = body;

  if (!platform || !topic) {
    return NextResponse.json(
      { error: "platform e topic são obrigatórios" },
      { status: 400 }
    );
  }

  // Obtém o utilizador para ter o nome
  const user = await currentUser();
  const authorName = user?.firstName ?? "Coach";

  // Constrói o system prompt com Voice DNA + MaaS
  const systemPrompt = `És um especialista em criação de conteúdo para ${authorName}, um solopreneur.

VOICE DNA DE ${authorName.toUpperCase()}:
- Nicho: ${voiceDNA?.niche ?? "solopreneurs e negócios digitais"}
- Oferta principal: ${voiceDNA?.offer ?? "produto ou serviço digital"}
- Dor do cliente: ${voiceDNA?.pain ?? "falta de tempo e resultados"}
- Tom de voz: ${toneInstructions[voiceDNA?.tone ?? "directo"]}
- Diferencial: ${voiceDNA?.differentiator ?? "abordagem única e prática"}

REGRAS ABSOLUTAS:
1. Escreve NA VOZ de ${authorName} — primeira pessoa, como se ele próprio escrevesse
2. Usa APENAS o tom definido no Voice DNA — nunca genérico
3. Referencia a dor e o diferencial quando relevante
4. Zero jargão sem explicação — linguagem acessível
5. Cada peça termina com UMA acção clara para o leitor
6. Nunca inventas resultados, números ou prova social falsa
7. O conteúdo deve soar autêntico, não a marketing

PRINCÍPIO MaaS: Cada palavra deve servir para transferir conhecimento ou motivar acção. Elimina tudo o resto.`;

  const userPrompt = `Cria conteúdo sobre o seguinte tema:

TEMA: ${topic}

${platformFormats[platform] ?? platformFormats.instagram}

Escreve o conteúdo completo, pronto a publicar.`;

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extrai o texto da resposta
    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Resposta inesperada da IA" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: content.text,
      platform,
      topic,
      tokens: message.usage.input_tokens + message.usage.output_tokens,
    });
  } catch (error) {
    console.error("Erro ao chamar Claude API:", error);
    return NextResponse.json(
      { error: "Erro ao gerar conteúdo. Verifica a API key." },
      { status: 500 }
    );
  }
}
