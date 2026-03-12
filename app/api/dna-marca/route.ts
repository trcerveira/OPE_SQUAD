import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";
import { DNAMarcaAnswersSchema, validateInput } from "@/lib/validators";

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

  // Rate limiting — 5 DNA da Marca generations per day
  const rateLimit = await checkAndConsumeRateLimit(userId, "dna-marca");
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
  const validation = validateInput(DNAMarcaAnswersSchema, rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { answers } = validation.data;
  const user = await currentUser();
  const nome = user?.firstName ?? "Solopreneur";

  const systemPrompt = `És um estratega de marca especializado em solopreneurs. O teu trabalho é analisar as respostas de ${nome} e criar o DNA DA MARCA — um documento estratégico estruturado que será usado por IA para gerar conteúdo autêntico e impossível de copiar.

O DNA da Marca tem 7 secções. Cada secção é extraída das respostas reais — nunca inventes, nunca generalizas.

SECÇÕES DO DNA DA MARCA:

1. CLIENTE IDEAL
- perfil: Parágrafo denso (4-5 frases) descrevendo quem é, como pensa, como vive, o que sente
- dores: 4-6 dores específicas (usa as palavras EXACTAS que o cliente usaria)
- desejos: 4-6 desejos profundos (o que realmente quer, não o que diz que quer)
- linguagem: 5-8 frases/expressões que o cliente usa para descrever o problema (voice of customer)

2. PERSONAGEM ATRAENTE
- historia: A história de progresso do fundador em 4-5 frases (queda → virada → crescimento)
- superpoder: O que faz melhor que ninguém (1 frase poderosa)
- defeito: O defeito real que o torna humano e relatável (1 frase)
- voz: Como comunica — estilo, tom, energia (2-3 frases)

3. BIG IDEA
- frase: A UMA frase que ancora TODA a comunicação (máx 15 palavras, memorável)
- explicacao: Porque esta ideia importa e como desafia o status quo (2-3 frases)

4. INIMIGO
- quem: O sistema/mentalidade/indústria que a marca combate (NUNCA uma pessoa — sempre um sistema)
- porque: Porque este inimigo existe e como prejudica o público (2-3 frases)

5. CAUSA FUTURA
- movimento: O futuro que a marca está a construir (1-2 frases inspiracionais mas concretas)
- visao10anos: Como seria o mundo se o trabalho da marca tivesse sucesso total (2-3 frases)

6. COMMANDER'S INTENT
- Uma frase de guia que governa TODA a comunicação. Formato: "Fazer [público] acreditar que [crença] e por isso [acção]."
- Se qualquer peça de conteúdo não serve este intento, não deve existir.

7. NOVA OPORTUNIDADE
- diferencial: O que esta solução faz de FUNDAMENTALMENTE diferente de tudo o que o público já tentou (2-3 frases)
- reframe: A frase de reframing que muda a perspectiva. Formato: "Isto não é um [categoria antiga]. Isto é um [nova categoria]." (1 frase)

REGRAS:
- Português europeu (não brasileiro)
- Usa as palavras exactas das respostas — o DNA soa ao fundador, não a um template
- Cada campo deve ter substância — não aceites generalidades
- As "dores" e "linguagem" do cliente ideal devem ser frases que o CLIENTE diria, não o fundador
- O "inimigo" é SEMPRE um sistema/mentalidade, nunca uma pessoa
- O Commander's Intent é a declaração mais importante — dedica-lhe atenção

Responde APENAS com JSON válido, sem texto antes ou depois:
{
  "dnaMarca": {
    "clienteIdeal": { "perfil": "...", "dores": ["..."], "desejos": ["..."], "linguagem": ["..."] },
    "personagem": { "historia": "...", "superpoder": "...", "defeito": "...", "voz": "..." },
    "bigIdea": { "frase": "...", "explicacao": "..." },
    "inimigo": { "quem": "...", "porque": "..." },
    "causaFutura": { "movimento": "...", "visao10anos": "..." },
    "commandersIntent": "...",
    "novaOportunidade": { "diferencial": "...", "reframe": "..." }
  }
}`;

  const userPrompt = `Cria o DNA da Marca de ${nome}.

RESPOSTAS DA ENTREVISTA:

═══ BLOCO 1 — QUEM SERVES (Cliente Ideal) ═══

1. QUEM É O TEU CLIENTE IDEAL? Dor mais profunda, o que ninguém vê neles:
${answers.clienteIdeal}

2. O QUE JÁ TENTOU PARA RESOLVER O PROBLEMA — E PORQUE FALHOU:
${answers.tentativasFalhadas}

3. SE PUDESSES OUVIR UMA CONVERSA DELE SOBRE ESTE PROBLEMA, QUE PALAVRAS USARIA:
${answers.linguagemCliente}

4. COMO SERIA A VIDA DELE DAQUI A 6 MESES SE O TEU PRODUTO FUNCIONASSE PERFEITAMENTE:
${answers.vidaIdeal}

═══ BLOCO 2 — QUEM ÉS (Personagem + Essência) ═══

5. QUEM ÉS TU NO MERCADO? Especialidade, percurso, diferencial:
${answers.especialidade}

6. SE A TUA MARCA FOSSE UMA PESSOA, COMO SERIA? Como fala, tom, energia:
${answers.personalidade}

7. QUAL FOI O TEU PIOR MOMENTO NESTA JORNADA? O fundo do poço:
${answers.piorMomento}

8. QUE ERRO COMETESTE QUE AGORA ENSINAS OUTROS A EVITAR:
${answers.erroQueEnsina}

═══ BLOCO 3 — O QUE DEFENDES (Big Idea + Crenças + Inimigo) ═══

9. O QUE TE IRRITA NO TEU MERCADO? O que te recusas a fazer:
${answers.irritacoes}

10. AS TUAS CRENÇAS MAIS FORTES SOBRE NEGÓCIOS E CONTEÚDO:
${answers.crencas}

11. COMPLETA: "Toda a gente pensa que [X], mas a verdade é que [Y]":
${answers.bigIdea}

12. PORQUE FAZES ISTO VERDADEIRAMENTE? O grande PORQUÊ real:
${answers.proposito}

13. SE TIVERES SUCESSO TOTAL, QUE MUDANÇA TRAZES PARA O MUNDO:
${answers.visao}

═══ BLOCO 4 — A TUA PROMESSA (Transformação + Commander's Intent) ═══

14. A TUA PROMESSA DE TRANSFORMAÇÃO: "Transformo ___ em ___ sem ___":
${answers.transformacao}

15. RESULTADOS CONCRETOS QUE O CLIENTE ALCANÇA:
${answers.resultados}

16. O QUE A TUA SOLUÇÃO FAZ DE FUNDAMENTALMENTE DIFERENTE (não melhor — diferente):
${answers.diferencaFundamental}

17. SE TODA A TUA COMUNICAÇÃO TIVESSE DE SERVIR UM ÚNICO OBJECTIVO, QUAL SERIA:
${answers.commandersIntent}

Agora cria o DNA da Marca completo em JSON. Vai fundo. Usa as palavras de ${nome}.`;

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

    // Save to Clerk metadata
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        unsafeMetadata: {
          dnaMarcaAnswers: answers,
          dnaMarca: parsed.dnaMarca,
          dnaMarcaComplete: true,
        },
      });
    } catch (metaErr) {
      console.error("Error saving dnaMarca to Clerk:", metaErr);
    }

    // Audit log
    logAudit({ userId, action: "dna-marca.generate", metadata: { tokens } });

    return NextResponse.json({
      dnaMarca: parsed.dnaMarca,
      tokens,
    });
  } catch (error) {
    console.error("Error generating DNA da Marca:", error);
    logAudit({ userId, action: "dna-marca.generate", success: false, errorMsg: String(error) });
    return NextResponse.json(
      { error: "Error generating DNA da Marca. Please try again." },
      { status: 500 }
    );
  }
}
