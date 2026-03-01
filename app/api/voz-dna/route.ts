import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { saveVoiceProfile } from "@/lib/supabase/user-profiles";
import { logAudit } from "@/lib/supabase/audit";

// API that generates the brand voice DNA based on the solopreneur's 8 answers

interface VozDNAAnswers {
  tom: string;
  personagem: string;
  emocao: string;
  vocabularioActivo: string;
  vocabularioProibido: string;
  frasesAssinatura: string;
  estrutura: string;
  posicao: string;
}

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

  let body: { answers: VozDNAAnswers };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { answers } = body;
  const user = await currentUser();
  const nome = user?.firstName ?? "Solopreneur";

  const systemPrompt = `És um especialista em branding e voz de marca para solopreneurs e criadores de conteúdo.
Com base nas respostas de um solopreneur, cria o seu DNA de Voz — um documento de referência que define exactamente como a sua marca comunica.

O output deve ser um JSON com esta estrutura exacta:
{
  "arquetipo": "Nome do arquétipo de voz (ex: 'O Mentor Rebelde', 'O Estrategista Directo', 'O Disruptor Cuidador')",
  "descricaoArquetipo": "1-2 frases que capturam a essência deste arquétipo de comunicação",
  "tomEmTresPalavras": ["Palavra1", "Palavra2", "Palavra3"],
  "vocabularioActivo": ["palavra1", "palavra2", "palavra3", ...10-15 itens],
  "vocabularioProibido": ["palavra1", "palavra2", "palavra3", ...8-12 itens],
  "frasesAssinatura": ["Frase 1.", "Frase 2.", "Frase 3.", "Frase 4.", "Frase 5."],
  "regrasEstilo": [
    "Regra 1 — descrição prática e específica",
    "Regra 2 — ...",
    "Regra 3 — ...",
    "Regra 4 — ...",
    "Regra 5 — ..."
  ],
  "exemplos": [
    { "contexto": "Post de Instagram", "texto": "Exemplo de post de 3-5 linhas na voz do solopreneur" },
    { "contexto": "Abertura de email", "texto": "Primeira frase + parágrafo de abertura de um email na sua voz" },
    { "contexto": "Resposta a objecção", "texto": "Como responderia a 'não tenho tempo' na sua voz" }
  ]
}

REGRAS ABSOLUTAS:
- Responde APENAS com JSON válido, sem texto antes ou depois
- Escreve em Português europeu (não brasileiro)
- O arquétipo deve ser original e específico — não usar labels genéricos
- Extrai o vocabulário DIRECTAMENTE das respostas — usa as palavras exactas que eles mencionaram
- As frases assinatura devem incluir as que eles já usam + 1-2 que derivam naturalmente da sua voz
- As regras de estilo devem ser accionáveis e específicas (não "ser autêntico" — isso não ajuda ninguém)
- Os exemplos devem soar exactamente como a pessoa — usa o seu tom, vocabulário e estrutura`;

  const userPrompt = `Cria o DNA de Voz de ${nome}, um solopreneur.

RESPOSTAS DA ENTREVISTA:

BLOCO 1 — TOM DA VOZ

1. Como soa a marca quando fala (tom, estilo, energia):
${answers.tom}

2. Se a marca fosse uma pessoa famosa/personagem, quem seria e porquê:
${answers.personagem}

3. Que emoção quer deixar quando alguém lê o seu conteúdo:
${answers.emocao}

BLOCO 2 — PALAVRAS DA MARCA

4. Palavras e expressões que usa SEMPRE (vocabulário activo):
${answers.vocabularioActivo}

5. Palavras que NUNCA usa (vocabulário proibido):
${answers.vocabularioProibido}

6. Frases assinatura e expressões recorrentes:
${answers.frasesAssinatura}

BLOCO 3 — ESTILO E POSIÇÃO

7. Como estrutura as mensagens (formato, extensão, estilo):
${answers.estrutura}

8. Posição no mercado (arquétipo de comunicação):
${answers.posicao}

Agora cria o DNA de Voz completo de ${nome} em JSON.`;

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

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

    const parsed = JSON.parse(jsonText);
    const tokens = message.usage.input_tokens + message.usage.output_tokens;

    // Fire-and-forget: persist vozDNA to Supabase (source of truth)
    // Does not block the response — if Supabase fails, Clerk still has it
    saveVoiceProfile(userId, parsed).catch((err) =>
      console.error("Fire-and-forget saveVoiceProfile failed:", err)
    );

    // Audit log (non-blocking)
    logAudit({ userId, action: "voz_dna.generate", metadata: { tokens } });

    return NextResponse.json({
      dna: parsed,
      tokens,
    });
  } catch (error) {
    console.error("Error generating voice DNA:", error);
    logAudit({ userId, action: "voz_dna.generate", success: false, errorMsg: String(error) });
    return NextResponse.json(
      { error: "Error generating DNA. Please try again." },
      { status: 500 }
    );
  }
}
