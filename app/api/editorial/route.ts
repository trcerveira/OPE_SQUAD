import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";

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

  // Rate limiting — 5 gerações de linhas editoriais por dia
  const rateLimit = await checkAndConsumeRateLimit(userId, "editorial");
  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
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
O teu trabalho é criar 3 Linhas Editoriais estratégicas e específicas à marca.

As 3 editorias cobrem os 3 pilares:
1. POSICIONAMENTO — quem és e porque és diferente
2. MÉTODO/SISTEMA — como resolves o problema, o teu processo
3. EXECUÇÃO/RESULTADO — como o cliente aplica e obtém resultado

ESTRUTURA DE CADA EDITORIA (sê conciso e específico):
- numero: "01", "02" ou "03"
- nome: nome em maiúsculas (3-4 palavras, específico à marca)
- temaCentral: 2-3 frases — o que esta editoria comunica e a sua função
- perspectivaUnica: 2 frases — o ângulo único, o que te distingue neste pilar
- tomDeVoz: 2 frases — como comunicar nesta editoria
- expressoes: exactamente 4 frases curtas e memoráveis na voz da marca
- vocabulario: exactamente 8 palavras-chave desta editoria
- elementosObrigatorios: exactamente 5 elementos que cada peça deve ter
- publicoAlvo: exactamente 4 características do leitor desta editoria
- tensaoCentral: 1 frase na primeira pessoa do leitor (o que sente/teme)
- temasEPautas: exactamente 6 temas específicos e accionáveis

REGRAS:
- Português europeu (não brasileiro)
- Soa à marca de ${nome} — usa as suas palavras e posicionamento
- Cada editoria cobre território diferente — sem sobreposição
- Temas específicos e accionáveis, não genéricos
- Nunca inventas — baseia-te APENAS nas respostas dadas

Responde APENAS com JSON válido, sem texto antes ou depois:
{
  "editorias": [
    {
      "numero": "01",
      "nome": "...",
      "temaCentral": "...",
      "perspectivaUnica": "...",
      "tomDeVoz": "...",
      "expressoes": ["...", "...", "...", "..."],
      "vocabulario": ["...", "...", "...", "...", "...", "...", "...", "..."],
      "elementosObrigatorios": ["...", "...", "...", "...", "..."],
      "publicoAlvo": ["...", "...", "...", "..."],
      "tensaoCentral": "...",
      "temasEPautas": ["...", "...", "...", "...", "...", "..."]
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

    const tokens = message.usage.input_tokens + message.usage.output_tokens;
    logAudit({ userId, action: "editorial.generate", metadata: { tokens } });

    return NextResponse.json({ editorias: parsed.editorias, tokens });
  } catch (error) {
    console.error("Erro ao gerar linha editorial:", error);
    logAudit({ userId, action: "editorial.generate", success: false, errorMsg: String(error) });
    return NextResponse.json(
      { error: "Erro ao gerar linha editorial. Tenta novamente." },
      { status: 500 }
    );
  }
}
