import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Queries de pesquisa por plataforma — sem ano hardcoded, foco em conteúdo recente
function getPlatformQueries(platform: string): string[] {
  const queries: Record<string, string[]> = {
    instagram: [
      "viral instagram reels {niche} trending this week hooks engagement",
      "most viral instagram content {niche} recent examples what works now",
    ],
    linkedin: [
      "viral linkedin posts {niche} trending this week impressions likes",
      "linkedin content that went viral {niche} recent this month examples",
    ],
    twitter: [
      "viral twitter X threads {niche} trending this week hooks engagement",
      "most viral tweets {niche} recent examples what works now",
    ],
    email: [
      "best email subject lines {niche} high open rate recent trending now",
      "email newsletter viral {niche} recent what works this month",
    ],
  };
  return queries[platform] ?? queries.instagram;
}

const platformNames: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X/Twitter",
  email: "Email",
};

interface TavilyResult {
  answer?: string;
  results?: { title: string; content: string; url: string }[];
}

async function searchTavily(query: string, apiKey: string): Promise<TavilyResult | null> {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: 7,
        include_answer: true,
        days: 30, // só resultados dos últimos 30 dias — conteúdo mesmo recente
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) {
    return NextResponse.json(
      { error: "TAVILY_API_KEY não configurada" },
      { status: 500 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada" },
      { status: 500 }
    );
  }

  let body: { platform: string; niche: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { platform, niche } = body;
  if (!platform || !niche?.trim()) {
    return NextResponse.json({ error: "platform e niche são obrigatórios" }, { status: 400 });
  }

  const nicheClean = niche.trim().toLowerCase();
  const now = new Date();
  const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const currentYear = now.getFullYear();

  // Verifica cache no Supabase (platform + niche + dia)
  try {
    const supabase = createServerClient();
    const { data: cached } = await supabase
      .from("viral_research_cache")
      .select("result")
      .eq("platform", platform)
      .eq("niche", nicheClean)
      .eq("cache_date", today)
      .single();

    if (cached?.result) {
      // Cache hit — devolve sem chamar Tavily
      return NextResponse.json({ ...cached.result, fromCache: true });
    }
  } catch {
    // Cache falhou — continua sem cache
  }

  // Cache miss — pesquisa com Tavily (últimos 30 dias)
  const queries = getPlatformQueries(platform).map((q) =>
    q.replace(/{niche}/g, nicheClean)
  );

  const searches = queries.map((q) => searchTavily(q, tavilyKey));
  const results = await Promise.allSettled(searches);

  const searchData = results
    .filter((r): r is PromiseFulfilledResult<TavilyResult | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((v): v is TavilyResult => v !== null)
    .flatMap((r) => [
      r.answer ? `RESUMO: ${r.answer}` : "",
      ...(r.results ?? []).map(
        (res) =>
          `TÍTULO: ${res.title}\nEXCERPTO: ${res.content.substring(0, 400)}\nFONTE: ${res.url}`
      ),
    ])
    .filter(Boolean)
    .join("\n\n---\n\n");

  if (!searchData) {
    return NextResponse.json(
      { error: "Sem resultados da pesquisa. Verifica a TAVILY_API_KEY." },
      { status: 500 }
    );
  }

  // Claude sintetiza os resultados
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const platformName = platformNames[platform] ?? platform;

  // Obtém nome do utilizador para personalizar
  const user = await currentUser();
  const authorName = user?.firstName ?? "Coach";

  const systemPrompt = `És um especialista em conteúdo viral para criadores de conteúdo no nicho de ${nicheClean}. O teu trabalho é analisar dados de pesquisa RECENTES (últimos 30 dias) sobre o que está viral no ${platformName} especificamente para este nicho. A data de hoje é ${today}. Extrai apenas insights do que está a funcionar AGORA — zero referências a tendências antigas ou anos anteriores.`;

  const userPrompt = `Analisa estes dados de pesquisa sobre conteúdo viral no ${platformName} para o nicho de "${nicheClean}":

${searchData}

Criador de conteúdo: ${authorName}
Nicho específico: ${nicheClean}
Data actual: ${today} (ano ${currentYear})

Extrai insights e devolve EXACTAMENTE este JSON (sem markdown, sem explicações — só o JSON válido):
{
  "hooks": [
    "Linha de abertura viral 1 — completa, específica para ${nicheClean}, pronta a usar",
    "Linha de abertura viral 2",
    "Linha de abertura viral 3",
    "Linha de abertura viral 4",
    "Linha de abertura viral 5"
  ],
  "topics": [
    "Ângulo/tema específico em alta 1 — relevante para ${nicheClean}",
    "Ângulo/tema específico em alta 2",
    "Ângulo/tema específico em alta 3",
    "Ângulo/tema específico em alta 4",
    "Ângulo/tema específico em alta 5"
  ],
  "formats": [
    "Formato 1 — estrutura completa (ex: Thread de 7: problema → causa → sistema → resultado → CTA)",
    "Formato 2 — estrutura completa",
    "Formato 3 — estrutura completa"
  ],
  "insight": "Uma frase concreta sobre o padrão que domina o ${platformName} no nicho de ${nicheClean} agora (${today})"
}

REGRAS OBRIGATÓRIAS:
- Hooks são linhas de abertura COMPLETAS e ESPECÍFICAS para ${nicheClean} — não genéricas
- Temas são ângulos de ataque CONCRETOS com contexto real do nicho
- Formatos descrevem a ESTRUTURA completa
- Tudo em Português de Portugal
- Baseia-te nos dados reais da pesquisa`;

  try {
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

    const cleaned = content.text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Falha ao fazer parse do JSON:", content.text);
      return NextResponse.json(
        { error: "Erro ao processar resposta. Tenta novamente." },
        { status: 500 }
      );
    }

    // Guarda no cache (sem bloquear a resposta)
    try {
      const supabase = createServerClient();
      await supabase.from("viral_research_cache").upsert({
        platform,
        niche: nicheClean,
        cache_date: today,
        result: parsed,
      });
    } catch {
      // Cache falhou — não crítico
    }

    return NextResponse.json({ ...parsed, fromCache: false });
  } catch (error) {
    console.error("Erro na API Anthropic:", error);
    return NextResponse.json(
      { error: "Erro ao analisar resultados. Tenta novamente." },
      { status: 500 }
    );
  }
}
