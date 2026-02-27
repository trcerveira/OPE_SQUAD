import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Formato do DNA de Voz guardado no Clerk (gerado pelo módulo Voz & DNA)
interface VozDNA {
  arquetipo?: string;
  descricaoArquetipo?: string;
  tomEmTresPalavras?: string[];
  vocabularioActivo?: string[];
  vocabularioProibido?: string[];
  frasesAssinatura?: string[];
  regrasEstilo?: string[];
}

// Genius Profile gerado pelo módulo Genius Zone
interface GeniusProfile {
  hendricksZone?: string;
  wealthProfile?: string;
  kolbeMode?: string;
  fascinationAdvantage?: string;
}

// Instruções de formato por plataforma
const platformFormats: Record<string, string> = {
  instagram: `
FORMATO: Post para Instagram
- Máximo 2200 caracteres, ideal 150-300 palavras
- Primeira linha: hook forte que para o scroll (sem introdução, sem "Hoje vou falar de")
- Quebras de linha generosas para facilitar leitura no mobile
- 3-5 hashtags relevantes separadas no final
- Tom: directo e pessoal, como um story escrito`,

  linkedin: `
FORMATO: Post para LinkedIn
- 150-300 palavras
- Primeira linha: hook que apareça antes do "ver mais" (máx 2 linhas)
- Espaçamento entre parágrafos — nunca blocos densos
- Termina com pergunta ou call-to-action
- Tom: profissional mas humano, primeira pessoa`,

  twitter: `
FORMATO: Thread para X/Twitter
- 4-6 tweets encadeados
- Tweet 1: Hook irresistível (máx 280 caracteres)
- Tweets 2-4: Desenvolvimento (máx 280 cada)
- Tweet final: Conclusão + CTA
- Numera cada tweet: (1/5), (2/5), etc.
- Tom: directo, sem rodeios, cada tweet tem impacto próprio`,

  email: `
FORMATO: Email para lista de subscribers
- Linha de assunto: curta e intrigante (máx 50 caracteres)
- Corpo: 200-400 palavras
- Estrutura: Hook → Problema → Solução → CTA único
- Tom: conversa 1:1, como escrita para um amigo
- Um único CTA claro no final`,
};

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no .env.local" },
      { status: 500 }
    );
  }

  let body: { platform: string; topic: string; vozDNA?: VozDNA };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { platform, topic, vozDNA } = body;

  if (!platform || !topic) {
    return NextResponse.json(
      { error: "platform e topic são obrigatórios" },
      { status: 400 }
    );
  }

  const user = await currentUser();
  const authorName = user?.firstName ?? "Coach";

  // Genius Profile (enriquece o ângulo do conteúdo se existir)
  const geniusProfile = user?.unsafeMetadata?.geniusProfile as GeniusProfile | undefined;
  const geniusSection = geniusProfile
    ? `
GENIUS PROFILE DE ${authorName.toUpperCase()}:
- Zona de Genialidade (Hendricks): ${geniusProfile.hendricksZone ?? "não definida"}
- Perfil de Riqueza (Wealth Dynamics): ${geniusProfile.wealthProfile ?? "não definido"}
- Modo de Acção (Kolbe): ${geniusProfile.kolbeMode ?? "não definido"}
- Vantagem Fascinante (Hogshead): ${geniusProfile.fascinationAdvantage ?? "não definida"}

Usa o Genius Profile para posicionar o conteúdo no ângulo único desta pessoa.`
    : "";

  // DNA de Voz — o coração do system prompt
  // Constrói as secções dinamicamente conforme o que existe
  const vozDNASection = vozDNA
    ? `
VOZ & DNA DE ${authorName.toUpperCase()}:

Arquétipo de comunicação: ${vozDNA.arquetipo ?? "Mentor Directo"}
${vozDNA.descricaoArquetipo ? `Descrição: ${vozDNA.descricaoArquetipo}` : ""}

Tom em 3 palavras: ${vozDNA.tomEmTresPalavras?.join(", ") ?? "Directo, Autêntico, Prático"}

VOCABULÁRIO OBRIGATÓRIO — usa estas palavras e expressões sempre que natural:
${vozDNA.vocabularioActivo?.map((w) => `• ${w}`).join("\n") ?? "• sistema • prova • consistência • resultados reais"}

VOCABULÁRIO PROIBIDO — nunca usar estas palavras:
${vozDNA.vocabularioProibido?.map((w) => `• ${w}`).join("\n") ?? "• fácil • rápido • truque • segredo"}

FRASES ASSINATURA — incorpora quando relevante:
${vozDNA.frasesAssinatura?.map((f) => `• "${f}"`).join("\n") ?? ""}

REGRAS DE ESTILO (seguir rigorosamente):
${vozDNA.regrasEstilo?.map((r, i) => `${i + 1}. ${r}`).join("\n") ?? "1. Vai directo ao ponto\n2. Usa linguagem acessível\n3. Termina com acção clara"}`
    : `
VOZ & DNA DE ${authorName.toUpperCase()}:
Tom: directo, autêntico, sem filtros corporativos
Vocabulário proibido: fácil, rápido, truque, segredo, incrível
Princípio: vai ao ponto, usa a linguagem do leitor, termina com acção`;

  const systemPrompt = `És um especialista em criação de conteúdo para ${authorName}, um solopreneur.

O teu único objectivo: gerar conteúdo que soe EXACTAMENTE a ${authorName} — não a um copywriter, não a uma IA, não a um template.
${vozDNASection}
${geniusSection}
REGRAS ABSOLUTAS:
1. Escreve NA VOZ de ${authorName} — primeira pessoa, como se ele próprio escrevesse
2. NUNCA uses as palavras do vocabulário proibido acima
3. USA as palavras do vocabulário activo de forma natural
4. As frases assinatura podem aparecer quando encaixam — nunca forçadas
5. Segue as regras de estilo à risca
6. Zero jargão sem explicação — linguagem que o cliente ideal entende
7. Cada peça termina com UMA acção clara para o leitor
8. NUNCA inventas resultados, números ou prova social — só o que foi dado
9. O conteúdo deve soar autêntico, não a marketing de agência

TESTE FINAL: antes de responder, pergunta-te — "Isto soa a ${authorName} ou a um template genérico?" Se for template, reescreve.`;

  const userPrompt = `Cria conteúdo sobre o seguinte tema para ${authorName}:

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
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Resposta inesperada da IA" }, { status: 500 });
    }

    const generatedText = content.text;

    // Guarda no Supabase (sem bloquear se falhar)
    try {
      const supabase = createServerClient();
      await supabase.from("generated_content").insert({
        user_id: userId,
        platform,
        topic,
        content: generatedText,
      });
    } catch (dbError) {
      console.error("Erro ao guardar no Supabase:", dbError);
    }

    return NextResponse.json({
      content: generatedText,
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
