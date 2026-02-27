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

// Fórmulas de copywriting por plataforma
// Baseadas nos princípios de Gary Halbert, David Ogilvy, Nicolas Cole, Justin Welsh
const platformFormats: Record<string, string> = {
  instagram: `
FORMATO: Post para Instagram

ESTRUTURA OBRIGATÓRIA:

LINHA 1 — O HOOK (único trabalho: parar o scroll)
Escolhe UMA destas fórmulas:
• Contradição: "Nunca [coisa óbvia]. Fiz [oposto] e [resultado específico com número]."
• Número concreto: "[Número] [resultado] em [tempo]. Sem [sacrifício esperado]."
• Pergunta incómoda: "[Pergunta que o leitor já pensou mas nunca respondeu honestamente]"
• Declaração ousada: "[Afirmação que vai contra o senso comum do nicho]"
• Segredo revelado: "A maioria das pessoas [erro comum]. Eu faço o contrário."

LINHA 2-3 — AGITAÇÃO DO PROBLEMA
Identifica exactamente quem está a ler. Descreve a dor com palavras que ELES usariam.

CORPO — DESENVOLVIMENTO (PAS ou BAB)
• Parágrafos de máx 2 linhas
• Linha em branco entre cada parágrafo
• Especificidade obrigatória: números, cenários concretos, nomes reais — NUNCA vago
• Cada frase ganha o direito de existir (teste: "e então?" — se não há resposta, corta)

ÚLTIMA LINHA — CTA ESPECÍFICO
Não "deixa o teu comentário". Uma acção concreta ligada ao benefício.

3-5 hashtags no final.

COMPRIMENTO: 150-300 palavras ideais.`,

  linkedin: `
FORMATO: Post para LinkedIn

ESTRUTURA OBRIGATÓRIA:

LINHA 1 — HOOK (aparece antes do "ver mais", máx 12 palavras)
Fórmulas que funcionam no LinkedIn:
• "[Número] anos a fazer X. O que aprendi em [tempo] mudou tudo:"
• "Despedi-me de [empresa]. A melhor decisão da minha vida. Aqui está o porquê:"
• "A maioria das pessoas faz [X] errado. Aqui está o que realmente funciona:"
• "[Insight contra-intuitivo que o leitor nunca considerou]"

[LINHA EM BRANCO obrigatória após o hook]

IDENTIFICAÇÃO
1-2 frases que fazem o leitor pensar "isto é sobre mim".

[LINHA EM BRANCO]

DESENVOLVIMENTO
• Bullet points ou parágrafos de 1-2 linhas
• Nunca blocos de texto — algoritmo e leitores detestam
• Especificidade: "aumentei 47%" > "aumentei muito"
• Factos > hyperbole (Ogilvy: "testado 10 anos" > "o melhor do mercado")

[LINHA EM BRANCO]

FECHO
Insight accionável + pergunta ou CTA que convida interacção.

COMPRIMENTO: 150-250 palavras. Tom: profissional mas humano — falar para um colega, não para um chefe.`,

  twitter: `
FORMATO: Thread para X/Twitter

ESTRUTURA OBRIGATÓRIA:

TWEET 1 — HOOK (o mais importante, determina tudo)
Fórmulas que param o scroll:
• "Fiz [X] durante [Y] dias. O que aprendi vai contra tudo o que te ensinaram:"
• "[Número] verdades sobre [tema] que ninguém diz em voz alta:"
• "Há [tempo], [situação difícil]. Hoje, [resultado concreto]. O que mudou:"
Máx 240 caracteres. Termina com ":" para criar antecipação.

TWEETS 2-5 — DESENVOLVIMENTO
• Um único ponto por tweet
• Começa cada um com número (2/) ou insight directo
• Especificidade > generalidade em cada tweet
• Cada tweet deve conseguir ficar sozinho (Dan Kennedy: "cada palavra paga renda ou sai")
• Máx 250 caracteres por tweet

TWEET 6 — GOLDEN NUGGET
O insight mais valioso de toda a thread. O que o leitor vai guardar.

TWEET FINAL — CTA
Pergunta que convida resposta, ou próxima acção específica.

Numera todos: (1/7), (2/7), etc.`,

  email: `
FORMATO: Email para lista de subscribers

ASSUNTO (único trabalho: ser aberto)
• Máx 45 caracteres
• Fórmulas: "[Nome], isto muda X" / "A verdade sobre [tema]" / "[Número] [resultado] em [tempo]"
• Específico > intrigante > genérico
• NUNCA: "Newsletter #47" ou "Actualização de [mês]"

PRÉ-HEADER (complementa, não repete o assunto)
• 1 frase que cria curiosidade adicional

ABERTURA (primeira frase é tudo)
• Não começa com "Olá" ou apresentação
• Começa IN MEDIAS RES: no meio da história, no meio do problema
• Fórmula Halbert: coloca o leitor numa cena concreta nos primeiros 2 segundos

ESTRUTURA DO CORPO (Gary Halbert):
Hook → Identificação com o problema → Promessa → Prova/História → CTA

• 200-400 palavras
• Parágrafos de 1-3 linhas máximo
• Escreve para UMA pessoa específica — não para uma lista
• Schwartz: fala para onde o leitor ESTÁ, não para onde queres que ele chegue
• Bencivenga: cada afirmação precisa de prova — história, número, ou exemplo concreto

CTA ÚNICO (no final)
• Ligado ao benefício, não ao produto
• "Quero [resultado]" > "Comprar agora"
• Uma única acção — dois CTAs matam as conversões`,
};

// Princípios dos melhores copywriters do mundo
// Aplicados no system prompt para elevar a qualidade de cada peça gerada
const copywritingMasters = `
PRINCÍPIOS DOS MELHORES COPYWRITERS DO MUNDO — APLICA EM TUDO:

GARY HALBERT — "O único trabalho do headline é fazer ler a segunda linha"
• Especificidade vence generalidade sempre: "perdeu 8kg em 6 semanas" > "perdeu peso"
• Teste "e então?": após cada frase, pergunta "e então?" — se não há resposta urgente, corta
• Histórias que vendem: começa no meio da acção, não no início
• A lista (audiência) é o activo mais importante — fala para UMA pessoa real

DAVID OGILVY — "Em média, 5× mais pessoas lêem o headline que o corpo"
• O headline deve prometer um benefício claro e mensurável
• Factos batem hyperbole: "usado por 10.000 coaches" > "o melhor sistema do mundo"
• Imagens mentais concretas > conceitos abstractos
• Nunca sejas inteligente à custa de ser claro

EUGENE SCHWARTZ — "O copywriter não cria o desejo. Canaliza o que já existe"
• Fala para o nível de consciência ACTUAL do leitor, não onde queres que ele chegue
• Os melhores headlines espelham um pensamento que o leitor JÁ TINHA
• Cria mass desire, não um novo desejo

DAN KENNEDY — "Cada palavra paga renda ou sai"
• Zero fluff. Zero enchimento. Cada frase ganha o direito de existir.
• CTA específico e urgente: "Clica aqui" mata. "Quero [resultado específico] agora" converte.
• Direct response: cada peça tem UMA métrica — clique, resposta, ou acção

GARY BENCIVENGA — "Prova é o elemento mais poderoso do copy"
• Uma afirmação sem prova é ruído. Com prova específica é persuasão.
• Bullets: curiosidade + benefício específico + implica prova — em cada um

ALEX HORMOZI — "Faz a oferta tão boa que o leitor sente-se estúpido por dizer não"
• Value equation: (Resultado sonhado × Probabilidade percebida) / (Tempo × Esforço)
• Reduz risco percebido. Aumenta valor percebido. Simplifica a decisão.
• Specificity of result: não "ficar em forma" mas "perder 8kg em 8 semanas sem ginásio"

NICOLAS COLE / JUSTIN WELSH — "O algoritmo é audiência, mas a audiência é humana"
• Linha 1 é 80% do trabalho nas redes sociais — tudo o resto serve para justificá-la
• Insights contra-intuitivos > conteúdo que confirma o que já sabem
• Conversacional > formal. Específico > genérico. Curto > longo quando possível.
• O "big idea": cada peça tem UMA ideia central que alguém consegue repetir num café`;

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
GENIUS PROFILE DE ${authorName.toUpperCase()} — USA PARA POSICIONAR O ÂNGULO ÚNICO:
• Zona de Genialidade (Hendricks): ${geniusProfile.hendricksZone ?? "não definida"}
• Perfil de Riqueza (Wealth Dynamics): ${geniusProfile.wealthProfile ?? "não definido"}
• Modo de Acção (Kolbe): ${geniusProfile.kolbeMode ?? "não definido"}
• Vantagem Fascinante (Hogshead): ${geniusProfile.fascinationAdvantage ?? "não definida"}

O Genius Profile define o ângulo que só ${authorName} consegue tomar — usa-o para diferenciar o conteúdo de tudo o que existe.`
    : "";

  // DNA de Voz — o coração do system prompt
  const vozDNASection = vozDNA
    ? `
VOZ & DNA DE ${authorName.toUpperCase()}:

Arquétipo de comunicação: ${vozDNA.arquetipo ?? "Mentor Directo"}
${vozDNA.descricaoArquetipo ? `Descrição: ${vozDNA.descricaoArquetipo}` : ""}

Tom em 3 palavras: ${vozDNA.tomEmTresPalavras?.join(", ") ?? "Directo, Autêntico, Prático"}

VOCABULÁRIO OBRIGATÓRIO — usa de forma natural, nunca forçada:
${vozDNA.vocabularioActivo?.map((w) => `• ${w}`).join("\n") ?? "• sistema • prova • consistência • resultados reais"}

VOCABULÁRIO PROIBIDO — banido de toda a peça:
${vozDNA.vocabularioProibido?.map((w) => `• ${w}`).join("\n") ?? "• fácil • rápido • truque • segredo"}

FRASES ASSINATURA — incorpora quando encaixam naturalmente:
${vozDNA.frasesAssinatura?.map((f) => `• "${f}"`).join("\n") ?? ""}

REGRAS DE ESTILO (lei — não sugestão):
${vozDNA.regrasEstilo?.map((r, i) => `${i + 1}. ${r}`).join("\n") ?? "1. Vai directo ao ponto\n2. Usa linguagem acessível\n3. Termina com acção clara"}`
    : `
VOZ & DNA DE ${authorName.toUpperCase()}:
Tom: directo, autêntico, sem filtros corporativos
Vocabulário proibido: fácil, rápido, truque, segredo, incrível, simplesmente
Princípio: vai ao ponto, usa a linguagem do leitor, termina com acção`;

  const systemPrompt = `És o melhor criador de conteúdo do mundo para solopreneurs. Combinás a voz autêntica de ${authorName} com os princípios dos maiores copywriters de todos os tempos.

MISSÃO: Gerar conteúdo que soe EXACTAMENTE a ${authorName} E aplique os princípios dos melhores copywriters do mundo. Não é um nem outro — é os dois em simultâneo.
${vozDNASection}
${geniusSection}
${copywritingMasters}

REGRAS ABSOLUTAS DE ${authorName.toUpperCase()}:
1. Escreve NA VOZ de ${authorName} — primeira pessoa, como se ele próprio escrevesse agora
2. NUNCA uses as palavras do vocabulário proibido
3. USA as palavras do vocabulário activo de forma natural — nunca forçada
4. As frases assinatura aparecem quando encaixam — nunca decorativas
5. Segue as regras de estilo como lei
6. NUNCA inventas resultados, números, prova social, testemunhos ou factos — só o que foi dado
7. Zero jargão sem explicação — a linguagem que o cliente ideal usa no dia-a-dia
8. Uma única ideia central por peça — o leitor consegue resumir em 1 frase

PROCESSO INTERNO ANTES DE RESPONDER:
1. Quem é a UMA pessoa que vai ler isto? (não "a audiência" — uma pessoa específica)
2. Onde está o nível de consciência DESTA pessoa agora?
3. Qual é a UMA emoção que quero que sinta no final?
4. O hook vai parar o scroll / abrir o email / gerar o clique?
5. Cada frase passa o teste "e então?" (se não há resposta urgente, corta)
6. Isto soa a ${authorName} ou a um template de IA? Se for template, reescreve tudo.
7. Apliquei pelo menos 3 princípios dos masters acima?

SÓ RESPONDE QUANDO O CONTEÚDO PASSAR TODOS OS 7 PONTOS.`;

  const userPrompt = `Cria conteúdo de elite sobre o seguinte tema para ${authorName}:

TEMA: ${topic}

${platformFormats[platform] ?? platformFormats.instagram}

Escreve o conteúdo completo, pronto a publicar. Sem introduções, sem explicações — só o conteúdo.`;

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
