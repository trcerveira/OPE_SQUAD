import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";
import { CalendarioSchema, validateInput } from "@/lib/validators";

// Allow up to 60s to generate long calendars
export const maxDuration = 60;

interface EditorialLine {
  numero: string;
  nome: string;
  temaCentral: string;
  tensaoCentral: string;
}

interface FormCalendario {
  dias: number;
  formatos: string[];
  objectivo: string;
  dataInicio: string;
}

const formatoDescricoes: Record<string, string> = {
  reels7s:    "Reels 7s (subtipo: Viral 7s / Problema-Solução / Utilidade / Infotenimento)",
  reelsLongo: "Reels Longo 30-90s (subtipo: Utilidade / Opinião / Narrativa Pessoal)",
  carrossel:  "Carrossel (subtipo: Utilidade / Infotenimento / Narrativa Pessoal / Vendas)",
  postFeed:   "Post de Feed Instagram",
  threads:    "Threads / X (post de texto curto)",
  story:      "Story Instagram",
};

const objectivoDescricoes: Record<string, string> = {
  crescimento: "Crescimento e Engagement — 90% conteúdo de TOPO (alcance, awareness, identificação)",
  vendas:      "Vendas — alternância entre MEIO (autoridade, prova social) e FUNDO (conversão, oferta directa)",
  ambos:       "50% Crescimento (TOPO) + 50% Vendas (MEIO/FUNDO) — equilíbrio estratégico",
};

const plataformaPorFormato: Record<string, string> = {
  reels7s:    "Instagram",
  reelsLongo: "Instagram",
  carrossel:  "Instagram",
  postFeed:   "Instagram",
  threads:    "Threads / X",
  story:      "Instagram",
};

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  // Rate limiting — 5 calendar generations per day
  const rateLimit = await checkAndConsumeRateLimit(userId, "calendario");
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
  const validation = validateInput(CalendarioSchema, rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { form, editorialLines } = validation.data as { form: FormCalendario; editorialLines: EditorialLine[] };

  if (!form?.dias || !form?.formatos?.length || !form?.objectivo || !form?.dataInicio) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  // Limit to 90 days × 6 formats = 540 rows maximum (in practice much less)
  const dias = Math.min(form.dias, 90);
  const totalRows = dias * form.formatos.length;

  const formatosTexto = form.formatos
    .map((f) => `  - ${formatoDescricoes[f] ?? f} → plataforma padrão: ${plataformaPorFormato[f] ?? "Instagram"}`)
    .join("\n");

  const objectivoTexto = objectivoDescricoes[form.objectivo] ?? form.objectivo;

  const editoriasTexto =
    editorialLines.length > 0
      ? editorialLines
          .map((ed) => `  - ${ed.nome}: ${ed.temaCentral.slice(0, 150)}`)
          .join("\n")
      : "  - POSICIONAMENTO: quem és e porque és diferente\n  - MÉTODO/SISTEMA: como resolves o problema\n  - EXECUÇÃO/RESULTADO: como o cliente aplica e obtém resultado";

  const prompt = `És um estrategista de conteúdo para solopreneurs. Gera um calendário editorial completo.

PARÂMETROS:
- Duração: ${dias} dias (data início: ${form.dataInicio})
- Formatos por dia:
${formatosTexto}
- Objectivo: ${objectivoTexto}
- Linhas Editoriais:
${editoriasTexto}

REGRAS OBRIGATÓRIAS:
1. Distribui as linhas editoriais de forma equilibrada e estratégica (não só em rotação mecânica)
2. O tema deve ser uma afirmação ou pergunta concreta e memorável — específica, nunca genérica
3. A lógica deve descrever a função estratégica em 3-5 palavras (ex: "Gerar identificação imediata", "Quebrar crença de bloqueio")
4. Respeita o objectivo na distribuição: TOPO = alcance, MEIO = autoridade, FUNDO = conversão
5. Para Reels 7s: escreve o subtipo no campo formato (ex: "Reels – Viral 7s", "Reels – Problema/Solução", "Reels – Infotenimento")
6. Para Carrossel: escreve o subtipo (ex: "Carrossel – Utilidade", "Carrossel – Narrativa Pessoal")
7. Para Reels Longo: "Reels – Utilidade" ou "Reels – Opinião"
8. Para Post Feed: "Post – Instagram"
9. Para Threads/X: "Threads / X"
10. Para Story: "Story"
11. Português europeu sempre — NUNCA brasileiro
12. O campo "linhaEditorial" deve conter o NOME EXACTO da linha editorial (tal como foi fornecido)
13. Total de linhas: ${totalRows} (${dias} dias × ${form.formatos.length} formato(s)/dia)

FORMATO DE SAÍDA:
Devolve APENAS um array JSON válido, sem markdown, sem texto antes ou depois.
Cada objecto tem exactamente estes 6 campos:
[
  {
    "data": "DD/MM/YYYY",
    "formato": "Tipo – Subtipo",
    "linhaEditorial": "NOME EXACTO DA LINHA EDITORIAL",
    "tema": "Tema específico e memorável do post",
    "plataforma": "Instagram",
    "logica": "Função estratégica"
  }
]

Gera exactamente ${totalRows} objectos. Devolve apenas o array JSON.`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // max_tokens: ~120 tokens per row + safety margin
    const maxTokens = Math.min(Math.max(totalRows * 130 + 200, 1000), 16000);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected AI response" }, { status: 500 });
    }

    let jsonText = content.text.trim();
    const jsonStart = jsonText.indexOf("[");
    const jsonEnd = jsonText.lastIndexOf("]");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
    }

    const calendario = JSON.parse(jsonText);

    logAudit({ userId, action: "calendario.generate", metadata: { dias: form.dias, formatos: form.formatos.length } });
    return NextResponse.json({ calendario });
  } catch (error) {
    console.error("Error generating calendar:", error);
    logAudit({ userId, action: "calendario.generate", success: false, errorMsg: String(error) });
    return NextResponse.json(
      { error: "Error generating calendar. Please try again." },
      { status: 500 }
    );
  }
}
