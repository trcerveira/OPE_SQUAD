import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";
import { saveManifestoAnswers } from "@/lib/supabase/user-profiles";
import { ManifestoSchema, validateInput } from "@/lib/validators";

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

  // Rate limiting — 3 manifesto generations per day
  const rateLimit = await checkAndConsumeRateLimit(userId, "manifesto");
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
  const validation = validateInput(ManifestoSchema, rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { answers } = validation.data;
  const user = await currentUser();
  const nome = user?.firstName ?? "Solopreneur";

  const systemPrompt = `És um especialista em criação de manifestos de marca para solopreneurs. O teu trabalho é criar documentos densos, autênticos e com profundidade real — não resumos superficiais.

Com base nas respostas de ${nome}, cria o SEU manifesto pessoal completo — na primeira pessoa, com a voz deles, usando as suas palavras exactas e expressões.

O manifesto tem exactamente 22 blocos numerados, organizados em 6 partes temáticas.

ESTRUTURA DOS 22 BLOCOS:

PARTE I — QUEM SOU (blocos 01-05)
01. Origem e percurso — de onde vieste, o que viveste, como chegaste aqui
02. A especialidade — o que fazes melhor que ninguém no teu espaço
03. O que te diferencia — o ângulo único, a perspectiva que mais ninguém tem
04. A personalidade da marca — como a tua marca se manifesta no mundo
05. Tom de voz e vocabulário — como falas, palavras que uses sempre vs nunca

PARTE II — O QUE RECUSO (blocos 06-08)
06. O que te irrita no mercado — o que discordas profundamente, o que te revolta ver
07. O que nunca farás — os teus limites não negociáveis, as linhas que não cruzas
08. Os teus padrões de qualidade — o que exiges de ti mesmo e do teu trabalho

PARTE III — PARA QUEM (blocos 09-11)
09. O teu cliente ideal — quem é exactamente, como pensa, como vive
10. A dor que ninguém vê — o que os prende, o que não falam, o que sentem às 3 da manhã
11. O momento de mudança — o que despoleta a decisão de procurar ajuda

PARTE IV — A TRANSFORMAÇÃO (blocos 12-15)
12. A promessa — o que transformas, em quê, sem quê
13. A abordagem — como trabalhas, o teu processo, o que te distingue metodologicamente
14. Os resultados concretos — o que consegue o teu cliente, em números ou realidades tangíveis
15. A prova — exemplos, padrões que vês repetidamente nos teus clientes

PARTE V — O QUE ACREDITO (blocos 16-18)
16. A crença fundamental — a verdade central que governa tudo o que fazes
17. Sobre conteúdo, consistência e presença digital — a tua filosofia
18. Sobre negócios, dinheiro e sucesso — o que acreditas que a maioria não percebe

PARTE VI — O PORQUÊ (blocos 19-22)
19. A história que te trouxe aqui — a ferida, a promessa, o turning point real
20. O que te move todos os dias — não a resposta bonita, a resposta verdadeira
21. O impacto que queres ter no mundo — a mudança a 10 anos
22. O compromisso — a declaração final, o que prometes às pessoas que te seguem

FORMATO DE CADA BLOCO:
- numero: "01" a "22"
- titulo: frase de impacto (máx 10 palavras, sem ponto final, sem clichés)
- corpo: 1 parágrafo denso e autêntico (5-7 frases) na primeira pessoa — usa as palavras exactas do solopreneur, vai fundo, não superficializa
- destaque: a frase mais poderosa do bloco (máx 20 palavras), algo que queriam tatuar numa parede

Responde APENAS com JSON válido, sem texto antes ou depois:
{
  "blocks": [
    {"numero":"01","titulo":"...","corpo":"...","destaque":"..."},
    ...22 blocos...
  ]
}

REGRAS ABSOLUTAS:
- Português europeu (não brasileiro)
- A resposta sobre personalidade/tom é a tua bússola: se listaram palavras proibidas, nunca as uses; se listaram palavras que sempre usam, usa-as em todos os blocos relevantes
- Cada bloco tem 5-7 frases no corpo — não 2, não 3. Um parágrafo real com substância
- Usa as expressões exactas do solopreneur — o manifesto soa a eles, não a um template de coaching
- Nunca inventas — tudo tem de estar nas respostas
- Destaque: uma frase que alguém guardaria para sempre, não um clichê motivacional
- O fluxo do manifesto conta uma história: quem sou → o que recuso → para quem → como transformo → no que acredito → porque importa`;

  const userPrompt = `Cria o manifesto completo de ${nome}.

RESPOSTAS DA ENTREVISTA:

1. ESPECIALIDADE E DIFERENCIAÇÃO NO MERCADO:
${answers.especialidade}

2. PERSONALIDADE DA MARCA + TOM DE VOZ (palavras que usa sempre / nunca usa):
${answers.personalidade}

3. O QUE IRRITA NO MERCADO / O QUE SE RECUSA A FAZER:
${answers.irritacoes}

4. CLIENTE IDEAL E DOR MAIS PROFUNDA:
${answers.publicoAlvo}

5. PROMESSA DE TRANSFORMAÇÃO:
${answers.transformacao}

6. RESULTADOS CONCRETOS QUE O CLIENTE ALCANÇA:
${answers.resultados}

7. CRENÇAS SOBRE NEGÓCIOS, CONTEÚDO E EMPREENDEDORISMO:
${answers.crencas}

8. GRANDE PORQUÊ / PROPÓSITO:
${answers.proposito}

9. IMPACTO QUE QUER TER NO MERCADO:
${answers.visao}

Agora cria os 22 blocos do manifesto em JSON. Cada bloco com 5-7 frases no corpo. Vai fundo. Usa as palavras de ${nome}.`;

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
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

    const parsed = JSON.parse(jsonText);

    const tokens = message.usage.input_tokens + message.usage.output_tokens;

    // Save answers to Clerk (primary source)
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        unsafeMetadata: {
          manifestoAnswers: answers,
          manifestoComplete: true,
        },
      });
    } catch (metaErr) {
      console.error("Error saving manifestoAnswers to Clerk:", metaErr);
    }

    // Backup in Supabase (antifragility — secondary source)
    saveManifestoAnswers(userId, answers as Record<string, string>);

    // Audit log
    logAudit({ userId, action: "manifesto.generate", metadata: { tokens } });

    return NextResponse.json({
      blocks: parsed.blocks,
      tokens,
    });
  } catch (error) {
    console.error("Error generating manifesto:", error);
    logAudit({ userId, action: "manifesto.generate", success: false, errorMsg: String(error) });
    return NextResponse.json(
      { error: "Error generating manifesto. Please try again." },
      { status: 500 }
    );
  }
}
