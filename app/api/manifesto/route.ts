import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// API que gera o manifesto personalizado com base nas 9 respostas do solopreneur

interface ManifestoAnswers {
  especialidade: string;
  personalidade: string;
  irritacoes: string;
  publicoAlvo: string;
  transformacao: string;
  resultados: string;
  crencas: string;
  proposito: string;
  visao: string;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada" },
      { status: 500 }
    );
  }

  let body: { answers: ManifestoAnswers };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { answers } = body;
  const user = await currentUser();
  const nome = user?.firstName ?? "Solopreneur";

  const systemPrompt = `És um especialista em criação de manifestos de marca para solopreneurs.
Com base nas respostas de um solopreneur, cria o SEU manifesto pessoal — na primeira pessoa, com a voz deles, usando as suas palavras e expressões.

O manifesto deve ter exactamente 10 blocos numerados.

Cada bloco tem:
- numero: string de 2 dígitos ("01" a "10")
- titulo: frase de impacto curta (máx 8 palavras, sem ponto final)
- corpo: 2-3 frases explicativas na primeira pessoa, baseadas nas respostas do solopreneur
- destaque: citação memorável entre aspas (máx 15 palavras), como se fosse uma frase de manifesto que o solopreneur diria

Responde APENAS com JSON válido, sem texto antes ou depois:
{
  "blocks": [
    {"numero":"01","titulo":"...","corpo":"...","destaque":"..."},
    {"numero":"02","titulo":"...","corpo":"...","destaque":"..."},
    ...10 blocos no total...
  ]
}

REGRAS ABSOLUTAS:
- Escreve em Português europeu (não brasileiro)
- Usa as palavras e expressões exactas do solopreneur sempre que possível
- Cada destaque é uma frase que alguém quereria guardar para sempre
- Nunca inventas informação que não está nas respostas
- O tom deve reflectir a personalidade descrita pelo solopreneur
- Os blocos devem fluir: quem sou → para quem → o que faço → porque importa → o compromisso`;

  const userPrompt = `Cria o manifesto de marca de ${nome}, um solopreneur.

RESPOSTAS DA ENTREVISTA:

BLOCO 1 — FUNDAMENTOS

1. Especialidade e diferenciação no mercado:
${answers.especialidade}

2. Personalidade da marca:
${answers.personalidade}

3. O que irrita no mercado / o que se recusa a fazer:
${answers.irritacoes}

BLOCO 2 — PÚBLICO E TRANSFORMAÇÃO

4. Cliente ideal e dor mais profunda:
${answers.publicoAlvo}

5. Promessa de transformação:
${answers.transformacao}

6. Resultados concretos que o cliente alcança:
${answers.resultados}

BLOCO 3 — POSICIONAMENTO

7. Crenças sobre negócios, conteúdo e empreendedorismo:
${answers.crencas}

8. Grande porquê / propósito:
${answers.proposito}

9. Impacto que quer ter no mercado:
${answers.visao}

Agora cria o manifesto de 10 blocos em JSON, na primeira pessoa, usando as palavras e ideias de ${nome}.`;

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
      return NextResponse.json({ error: "Resposta inesperada da IA" }, { status: 500 });
    }

    // Parse JSON — limpa possível texto extra à volta
    let jsonText = content.text.trim();
    const jsonStart = jsonText.indexOf("{");
    const jsonEnd = jsonText.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(jsonText);

    return NextResponse.json({
      blocks: parsed.blocks,
      tokens: message.usage.input_tokens + message.usage.output_tokens,
    });
  } catch (error) {
    console.error("Erro ao gerar manifesto:", error);
    return NextResponse.json(
      { error: "Erro ao gerar manifesto. Tenta novamente." },
      { status: 500 }
    );
  }
}
