import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface EditorialForm {
  especialidade: string;
  publicoAlvo: string;
  transformacao: string;
  diferenciacao: string;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });
  }

  let body: { form: EditorialForm };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { form } = body;

  if (!form?.especialidade || !form?.publicoAlvo || !form?.transformacao || !form?.diferenciacao) {
    return NextResponse.json({ error: "Preenche todos os campos." }, { status: 400 });
  }

  const user = await currentUser();
  const nome = user?.firstName ?? "Solopreneur";

  const systemPrompt = `És uma especialista em arquitectura editorial para solopreneurs e criadores de marca pessoal.
O teu trabalho é criar 3 Linhas Editoriais estratégicas — com profundidade real, não resumos superficiais.

As 3 editorias cobrem os 3 pilares da comunicação de qualquer marca pessoal:
1. POSICIONAMENTO — quem és e porque és diferente no mercado
2. MÉTODO/SISTEMA — como resolves o problema, o teu processo único
3. EXECUÇÃO/RESULTADO — como o cliente aplica e obtém resultado concreto

ESTRUTURA OBRIGATÓRIA DE CADA EDITORIA:
- numero: "01", "02" ou "03"
- nome: nome da editoria em maiúsculas (3-4 palavras, específico à marca)
- temaCentral: 4-6 frases densas — o que esta editoria comunica, a sua função no ecossistema de conteúdo
- perspectivaUnica: o ângulo único, o contra-posicionamento, o que te distingue neste pilar (3-4 frases)
- tomDeVoz: como comunicar nesta editoria — adjectivos do tom, o que fazer e não fazer (3-4 frases)
- expressoes: exactamente 5 frases características desta editoria (curtas, directas, memoráveis, na voz da marca)
- vocabulario: exactamente 12 palavras-chave desta editoria
- elementosObrigatorios: exactamente 6 elementos que cada peça desta editoria deve conter
- publicoAlvo: exactamente 5 características específicas do leitor desta editoria
- tensaoCentral: a frase de tensão interna do leitor (1 frase, na primeira pessoa do leitor)
- temasEPautas: exactamente 8 temas/pautas específicos e accionáveis para esta editoria

REGRAS ABSOLUTAS:
- Português europeu (não brasileiro)
- As editorias soam à marca de ${nome} — usa as suas palavras e o seu posicionamento exacto
- Cada editoria cobre território diferente — sem sobreposição entre as 3
- Os temas/pautas são específicos e accionáveis — não genéricos
- Nunca inventas — baseia-te APENAS no que está nas respostas

Responde APENAS com JSON válido, sem texto antes ou depois:
{
  "editorias": [
    {
      "numero": "01",
      "nome": "...",
      "temaCentral": "...",
      "perspectivaUnica": "...",
      "tomDeVoz": "...",
      "expressoes": ["...", "...", "...", "...", "..."],
      "vocabulario": ["...", "...", "...", "...", "...", "...", "...", "...", "...", "...", "...", "..."],
      "elementosObrigatorios": ["...", "...", "...", "...", "...", "..."],
      "publicoAlvo": ["...", "...", "...", "...", "..."],
      "tensaoCentral": "...",
      "temasEPautas": ["...", "...", "...", "...", "...", "...", "...", "..."]
    },
    { "numero": "02", "nome": "...", "temaCentral": "...", "perspectivaUnica": "...", "tomDeVoz": "...", "expressoes": [], "vocabulario": [], "elementosObrigatorios": [], "publicoAlvo": [], "tensaoCentral": "...", "temasEPautas": [] },
    { "numero": "03", "nome": "...", "temaCentral": "...", "perspectivaUnica": "...", "tomDeVoz": "...", "expressoes": [], "vocabulario": [], "elementosObrigatorios": [], "publicoAlvo": [], "tensaoCentral": "...", "temasEPautas": [] }
  ]
}`;

  const userPrompt = `Cria as 3 Linhas Editoriais de ${nome} com base nestes dados:

ESPECIALIDADE E O QUE FAZ MELHOR QUE NINGUÉM:
${form.especialidade}

PÚBLICO-ALVO E DOR MAIS PROFUNDA:
${form.publicoAlvo}

TRANSFORMAÇÃO CONCRETA E RESULTADO FINAL DO CLIENTE:
${form.transformacao}

DIFERENCIAÇÃO E CONTRA-POSICIONAMENTO NO MERCADO:
${form.diferenciacao}

Cria agora as 3 Linhas Editoriais em JSON. Cada uma com profundidade real. Usa as palavras de ${nome}.`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Resposta inesperada da IA" }, { status: 500 });
    }

    let jsonText = content.text.trim();
    const jsonStart = jsonText.indexOf("{");
    const jsonEnd = jsonText.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(jsonText);

    return NextResponse.json({
      editorias: parsed.editorias,
      tokens: message.usage.input_tokens + message.usage.output_tokens,
    });
  } catch (error) {
    console.error("Erro ao gerar linha editorial:", error);
    return NextResponse.json(
      { error: "Erro ao gerar linha editorial. Tenta novamente." },
      { status: 500 }
    );
  }
}
