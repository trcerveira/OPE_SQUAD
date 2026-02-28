import Anthropic from "@anthropic-ai/sdk";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";
import { getUserProgress } from "@/lib/supabase/user-profiles";
import { GenerateSchema, validateInput } from "@/lib/validators";

import type { VozDNA, GeniusProfile } from "@/lib/supabase/types";

// ─────────────────────────────────────────────
// PROMPTS BY FORMAT + TYPE
// Based on the best content GPTs in the market
// ─────────────────────────────────────────────

const formatPrompts: Record<string, Record<string, string>> = {

  // ── REELS ─────────────────────────────────────────────────────────────────
  reel: {
    viral7s: `
FORMATO: Roteiro de Reel Viral — Método 7 Cenas de 7 Segundos

Cria um roteiro de Reel com exactamente 7 cenas, cada uma com 7 segundos de duração.
Cada cena deve ter:
- CENA [N] (7s)
- O que aparece no ECRÃ (texto sobreposto, obrigatório — funciona sem som)
- O que o CRIADOR diz/faz
- A EMOÇÃO que a cena deve gerar

ESTRUTURA DAS 7 CENAS:
CENA 1 — GANCHO (7s): Para o scroll nos primeiros 2 segundos. Texto sobreposto obrigatório. Cria curiosidade ou contradição imediata.
CENA 2 — AGITAÇÃO (7s): Identifica a dor/problema com precisão cirúrgica. O espectador pensa "isto é sobre mim".
CENA 3 — PROMESSA (7s): Anuncia o que vai aprender/descobrir. Cria antecipação para continuar a ver.
CENA 4 — DESENVOLVIMENTO 1 (7s): Primeiro insight concreto. Específico, accionável, surpreendente.
CENA 5 — DESENVOLVIMENTO 2 (7s): Segundo insight que aprofunda o anterior. Mais profundo.
CENA 6 — VIRADA (7s): O insight mais valioso. O "golden nugget" que o espectador vai partilhar.
CENA 7 — CTA (7s): Acção clara. Não "segue-me" — "guarda este vídeo quando [situação específica]" ou "envia a [tipo de pessoa]".

REGRAS DE RETENÇÃO:
- Cada cena termina com uma "micro-tensão" que puxa para a próxima
- NUNCA revelas tudo antes da cena 6
- Texto sobreposto em cada cena (50% dos espectadores não tem som)
- Ritmo: cenas 1-3 rápidas, cenas 4-6 mais lentas (o conteúdo valioso), cena 7 rápida

ENTREGA: Roteiro completo com as 7 cenas, texto de ecrã e fala de cada cena.`,

    utilidade: `
FORMATO: Roteiro de Reel de Utilidade

Cria um roteiro de Reel que ensina algo concreto e accionável.
O espectador deve aprender UMA coisa que pode aplicar hoje.

ESTRUTURA:
CENA 1 — GANCHO (5-7s): "Vou mostrar-te como [resultado específico e desejado]"
CENAS 2-5 — ENSINAMENTO PASSO A PASSO: Cada cena = um passo concreto (não conceito abstracto)
CENA FINAL — CTA: "Guarda isto" ou "Experimenta agora e diz-me o resultado"

REGRAS:
- Linguagem DIRECTA e acessível — zero jargão
- Cada passo deve ser VISUALMENTE demonstrável ou descrito com clareza
- Texto sobreposto em todas as cenas (funciona sem som)
- Tom: mentor que sabe muito e explica de forma simples
- Máx 60 segundos no total
- Cada passo tem 1 frase de explicação máximo

ENTREGA: Roteiro completo com falas e texto de ecrã para cada cena.`,

    opiniao: `
FORMATO: Roteiro de Reel de Opinião/Posicionamento

Cria um roteiro de Reel que planta uma bandeira de posicionamento.
O criador defende um ponto de vista específico que divide opiniões.

ESTRUTURA:
CENA 1 — DECLARAÇÃO PROVOCADORA (7s): Uma afirmação que vai CONTRA o senso comum do nicho. Cria fricção imediata.
CENAS 2-3 — POR QUÊ A MAIORIA ESTÁ ERRADA: Desenvolve o argumento com lógica e exemplos concretos.
CENAS 4-5 — A PERSPECTIVA ALTERNATIVA: O ponto de vista do criador. Com fundamento, não apenas emoção.
CENA FINAL — DESAFIO: "Discordas? Comenta." ou "Partilha se acreditas no mesmo."

REGRAS:
- Tom: confiante, nunca agressivo
- Defende uma posição ESPECÍFICA — nada genérico
- O espectador deve pensar "nunca pensei nisso assim"
- Texto sobreposto com a declaração principal em CADA cena
- Cria divisão construtiva — não ofende, provoca reflexão

ENTREGA: Roteiro completo com 5-7 cenas, falas e texto de ecrã.`,

    infotenimento: `
FORMATO: Roteiro de Reel de Infotenimento

Cria um roteiro de Reel que combina informação valiosa com entretenimento.
O espectador aprende sem perceber que está a aprender.

ESTRUTURA:
CENA 1 — GANCHO NARRATIVO (7s): Começa uma história no meio da acção. Cria curiosidade imediata.
CENAS 2-4 — DESENVOLVIMENTO DA HISTÓRIA + INFORMAÇÃO: A história avança e o insight aparece naturalmente dentro dela.
CENA 5 — VIRADA / REVELAÇÃO: O momento "uau" — a informação mais surpreendente.
CENA 6 — LIÇÃO EXTRAÍDA: A mensagem clara que o espectador leva. 1 frase.
CENA 7 — CTA: Relacionado com a história, não com o criador.

REGRAS:
- Começa sempre no meio da acção — nunca com "hoje vou falar sobre..."
- A informação cresce organicamente da história — nunca é separada
- Linguagem conversacional, oralidade extrema
- Texto sobreposto cria suspense em cada cena
- Ritmo narrativo — cada cena é um "capítulo" da história

ENTREGA: Roteiro completo com 6-8 cenas, falas e texto de ecrã.`,

    problemaSolucao: `
FORMATO: Roteiro de Reel Problema/Solução

Cria um roteiro de Reel no padrão clássico "aqui está o problema, aqui está a solução".
Máximo impacto, mínimo tempo.

ESTRUTURA:
CENA 1 — O PROBLEMA (gancho): Nomeia o problema de forma tão precisa que o espectador pensa "isto é exactamente o que eu sinto".
CENA 2 — AMPLIFICAÇÃO DO PROBLEMA: Mostra as consequências de não resolver. Torna a dor mais real.
CENA 3 — A CAUSA RAIZ: "O problema não é [X]. O problema REAL é [Y]." — contra-intuitivo.
CENAS 4-5 — A SOLUÇÃO: Passo a passo concreto. Accionável. Não vende produto — resolve o problema.
CENA FINAL — RESULTADO + CTA: "Faz isto e [resultado específico em tempo real]."

REGRAS:
- O problema deve ser descrito com as PALAVRAS do leitor — não linguagem de especialista
- A causa raiz deve ser surpreendente (é isso que gera partilhas)
- A solução deve ser simples de compreender, não necessariamente fácil de executar
- Texto sobreposto com o problema/solução em destaque

ENTREGA: Roteiro completo com 6 cenas, falas e texto de ecrã.`,
  },

  // ── CAROUSELS ────────────────────────────────────────────────────────────
  carrossel: {
    utilidade: `
FORMATO: Carrossel de Utilidade — Ensino Directo (10 Cards)

Cria um carrossel de 10 cards que ensina algo concreto e accionável.

REGRAS ABSOLUTAS DE ESTRUTURA:
CARD 1 (GANCHO): Frase directa de 14-16 palavras exactas. Sem travessão, sem ponto final, só vírgulas permitidas. Gera o sentimento "este criador tem algo que eu preciso".
CARDS 2-9 (CONTEÚDO): Cada card = 50-70 palavras de texto corrido, sem quebras de linha internas, sem travessões, sem cabeçalhos. Linguagem conversacional com conectores naturais ("e olha", "porque veja bem", "o que acontece é que").
CARD 10 (CTA): 50-70 palavras. Conecta emocionalmente com o que foi ensinado. CTA natural, não forçado.

REGRAS DE QUALIDADE:
- Sistema de aplicabilidade progressiva: cada card avança a acção passo a passo
- Zero contrastes e analogias superficiais ("não é X, é Y")
- Zero travessões em qualquer card
- Linguagem conversacional — lê-se como uma pessoa a falar, não a escrever
- Cada card tem começo, meio e fim mesmo sendo texto corrido

FORMATO DE ENTREGA OBRIGATÓRIO:
CARD 1 (GANCHO — X palavras, entre 14-16)
[gancho sem quebras de linha]

CARD 2
[texto corrido 50-70 palavras]

[...até CARD 10]

Se algum card violar as regras, reescreve antes de entregar.`,

    infotenimento: `
FORMATO: Carrossel de Infotenimento (10 Cards)

Cria um carrossel que combina informação valiosa com entretenimento.
Ideal para pautas quentes, artigos, notícias do nicho — com densidade e posicionamento.

ESTILO: INFOEDITORIAL (com SUB-GANCHO e GANCHO)
- CARD 1A (SUB-GANCHO): 1 linha curta que cria contexto (6-8 palavras)
- CARD 1B (GANCHO PRINCIPAL): 14-16 palavras exactas
- CARDS 2-9: 50-70 palavras, texto corrido, conversacional
- CARD 10: CTA 50-70 palavras

REGRAS DE INFOTENIMENTO:
- A informação é densa mas acessível
- Cada card avança a narrativa — não repete o anterior
- Tom: jornalista inteligente que domina o nicho
- Conectores narrativos entre cards: "e então", "o que pouca gente sabe", "o que isto significa é"
- Zero jargão sem explicação
- Zero travessões, zero quebras de linha dentro dos cards

FORMATO DE ENTREGA:
CARD 1 (SUB-GANCHO — 6-8 palavras)
[sub-gancho]

CARD 1 (GANCHO — 14-16 palavras)
[gancho]

CARD 2-9
[texto corrido 50-70 palavras]

CARD 10 (CTA)
[texto corrido 50-70 palavras]`,

    opiniao: `
FORMATO: Carrossel de Opinião com Storytelling (10 Cards)

Cria um carrossel que conta uma história pessoal ou defende um ponto de vista.
Ideal para narrativas pessoais e para abordar assuntos sob um ponto de vista único.

ESTRUTURA NARRATIVA:
CARD 1: GANCHO com 14-16 palavras. Deve prometer uma história ou um ponto de vista provocador.
CARDS 2-3: MISE EN SCÈNE — cria o contexto da história/situação com detalhes vívidos.
CARDS 4-6: DESENVOLVIMENTO — a história avança, o conflito cresce, o leitor fica preso.
CARD 7-8: VIRADA — o momento que muda tudo. O insight central da história.
CARD 9: LIÇÃO — o que o criador aprendeu e como isso muda a perspectiva do leitor.
CARD 10: SÍNTESE + CTA — conecta a história à acção. Natural, não forçado.

REGRAS DE STORYTELLING:
- Começa no meio da acção — nunca com "um dia eu estava..."
- Detalhes específicos > generalidades (data, lugar, nome — não "numa tarde qualquer")
- Vulnerabilidade estratégica: mostra o erro/falha, não só o sucesso
- Cada card tem uma "micro-tensão" que puxa para o seguinte
- Zero travessões, zero quebras de linha, texto corrido 50-70 palavras por card`,

    vendas: `
FORMATO: Carrossel de Vendas — 7 Narrativas (10 Cards)

Cria um carrossel que vende um produto/serviço através de narrativa.
Usa o padrão de narrativa mais adequado ao tema fornecido.

ESCOLHE o padrão narrativo mais adequado ao tema:
1. Perguntas Desconfortantes — faz o leitor questionar o status quo
2. Tom Emocional — conecta pela emoção antes de apresentar a lógica
3. Afirmação Paradoxal — começa com uma afirmação que parece errada mas é verdadeira
4. Espelho Directo — descreve a situação actual do leitor com precisão brutal
5. Revelação Progressiva — revela a informação em camadas, cada card abre mais
6. Contraste Brutal — antes vs depois, sem rodeios
7. Desconstrução de Crença — destrói a crença limitante que impede a compra

ESTRUTURA (independente do padrão):
CARD 1: GANCHO 14-16 palavras — provoca a emoção central do padrão escolhido
CARDS 2-4: Desenvolvimento da narrativa — tensão crescente
CARDS 5-7: Construção da solução — apresenta sem vender ainda
CARDS 8-9: A oferta como consequência lógica da narrativa — não como interrupção
CARD 10: CTA — deve soar inevitável, não desesperado

REGRAS ABSOLUTAS:
- Indica no início qual padrão escolheste e porquê
- Cards 2-9: 50-70 palavras, texto corrido, sem travessões, sem quebras
- Zero linguagem de vendedor: "compra agora", "aproveita", "não percas"
- A venda é consequência da narrativa — nunca uma interrupção
- O leitor deve sentir que NÃO agir é a escolha irracional`,
  },

  // ── STORIES ───────────────────────────────────────────────────────────────
  story: {
    narrativaDensa: `
FORMATO: Sequência de Stories — Narrativas Densas (7 Stories)

Cria uma sequência de 7 stories que transforma conhecimento em narrativa densa.
Com oralidade extrema, camadas de pensamento empilhadas e flow contínuo.

ESTRUTURA DAS 7 STORIES:
STORY 1 — DISRUPÇÃO: Uma afirmação ou pergunta que quebra o padrão de pensamento. Curta, directa, provocadora.
STORY 2 — CONTEXTUALIZAÇÃO VULNERÁVEL: O criador entra na história. Com vulnerabilidade estratégica — mostra a dúvida real, não o sucesso.
STORY 3 — APROFUNDAMENTO EDUCATIVO: O conhecimento profundo. Teoria ou ciência explicada de forma conversacional.
STORY 4 — PROTOCOLO APLICÁVEL: "Aqui está o que fazeres com isto." Passo a passo concreto.
STORY 5 — SÍNTESE TRANSFORMADORA: "O que muda quando aplicas isto." Resultado emocional, não só prático.
STORY 6 — REFORÇO DE IDENTIDADE: "Quem és quando fazes isto." Conecta ao identity shift.
STORY 7 — CONVITE: CTA que convida — não exige. Pergunta, continuação, ou acção seguinte.

REGRAS DE ORALIDADE:
- Cada story: 3-5 frases máximo (lê-se em 5-7 segundos)
- Linguagem falada, não escrita: conectores orais ("e então", "olha", "porque veja bem")
- Vocabulário identitário do criador em cada story
- Flow contínuo: cada story começa onde a anterior terminou emocionalmente
- Zero bullets, zero listas, texto corrido conversacional

ENTREGA: As 7 stories completas, com indicação do comprimento ideal de cada uma.`,

    posicionamento: `
FORMATO: Sequência de Stories de Posicionamento (7 Stories)

Cria uma sequência de 7 stories que planta crenças filosóficas profundas.
Com afirmações provocativas e desenvolvimento reflexivo.

ESTRUTURA DAS 7 STORIES:
STORY 1 — DECLARAÇÃO DE CRENÇA: Uma tese filosófica directa. "Eu acredito que [afirmação provocadora]."
STORY 2 — DESENVOLVIMENTO DA TESE: Explica o "porquê" com lógica e experiência pessoal.
STORY 3 — EXEMPLO QUE SUSTENTA (1): Um caso concreto que prova a tese.
STORY 4 — EXEMPLO QUE SUSTENTA (2): Outro ângulo que reforça a mesma crença.
STORY 5 — A CRENÇA OPOSTA: "A maioria acredita em [X]. Aqui está porque isso não funciona."
STORY 6 — A TRANSFORMAÇÃO: "Quando mudei esta crença, [resultado concreto]."
STORY 7 — PERGUNTA REFLEXIVA: Uma pergunta que não precisa de resposta imediata. Fica na cabeça do espectador.

REGRAS:
- Tom: filosófico, directo, confiante — nunca arrogante
- Cada story: máx 4 frases — curto e denso
- Zero listas, zero bullets, texto conversacional
- A pergunta final NUNCA deve ter resposta óbvia — deve provocar reflexão genuína
- Identidade do criador presente em cada story

ENTREGA: As 7 stories completas, directas, prontas a publicar.`,

    vendas: `
FORMATO: Sequência de Stories de Vendas (8 Stories)

Cria uma sequência de 8 stories que vende um produto ou serviço.
Com amplificação progressiva da dor e apresentação da solução como alívio inevitável.

ESTRUTURA DAS 8 STORIES:
STORY 1 — GANCHO EMOCIONAL: Identifica quem está a ver com precisão cirúrgica. "Se és alguém que [situação específica], fica."
STORY 2 — AMPLIFICAÇÃO DA DOR: Descreve as consequências de não resolver o problema. Torna a dor mais real e presente.
STORY 3 — A CAUSA QUE NINGUÉM FALA: "O problema não é [X óbvio]. É [Y surpreendente]." — insight que gera credibilidade.
STORY 4 — DESTRUIÇÃO DA CRENÇA LIMITANTE: Identifica a crença que impede a acção e destrói-a com lógica.
STORY 5 — CONSTRUÇÃO DE TENSÃO: "Podes continuar como estás e [consequência negativa], ou..."
STORY 6 — APRESENTAÇÃO DO PRODUTO (brevemente): "Existe [produto/serviço]. [O que faz em 1 frase]."
STORY 7 — PROVA/RESULTADO: "Quem passou por isto [resultado real]. Não promessas — prova."
STORY 8 — CTA COM PALAVRA-CHAVE: "Responde [palavra-chave] nos DMs" ou "Link na bio." Urgência real, não fabricada.

REGRAS:
- Cada story: máx 5 frases — denso mas rápido de consumir
- Zero linguagem de vendedor: "promoção", "aproveita", "últimas vagas" (a menos que real)
- A solução é apresentada como consequência lógica — nunca como interrupção
- O espectador deve sentir que NÃO agir é a escolha irracional
- Tom: amigo que sabe mais do que tu, não vendedor

ENTREGA: As 8 stories completas, directas, prontas a publicar.`,
  },

  // ── POSTS (keeps previous logic) ─────────────────────────────────────────
  post: {
    instagram: `
FORMATO: Post para Instagram (optimizado para o algoritmo 2025)

━━━ ALGORITMO PRIMEIRO ━━━
Os 3 sinais que determinam se este post chega a novas pessoas:
1. WATCH TIME — cada linha tem de ganhar a seguinte.
2. DM SHARES — o sinal mais poderoso. Cria conteúdo que alguém quer enviar a um amigo.
3. LIKES POR ALCANCE — engagement genuíno.

LINHA 1 — O HOOK (único trabalho: parar o scroll em 1,7 segundos)
• Contradição: "Nunca [coisa óbvia]. Fiz [oposto] e [resultado com número]."
• Número concreto: "[Número] [resultado] em [tempo]. Sem [sacrifício esperado]."
• Pergunta incómoda: "[Pergunta que o leitor já pensou mas nunca respondeu]"
• Declaração ousada: "[Afirmação que vai contra o senso comum do nicho]"

LINHA 2-3 — AGITAÇÃO DO PROBLEMA
Identifica exactamente quem está a ler. Descreve a dor com as palavras DELES.

CORPO — DESENVOLVIMENTO
• Parágrafos de máx 2 linhas
• Linha em branco entre parágrafos
• Especificidade obrigatória — NUNCA vago

ÚLTIMA LINHA — CTA QUE GERA DM SHARES
• "Envia isto a alguém que [situação específica]."
• "Guarda isto — vais querer relembrar quando [situação]."

3-5 hashtags no final. Comprimento: 150-250 palavras.`,

    linkedin: `
FORMATO: Post para LinkedIn

LINHA 1 — HOOK (máx 12 palavras, antes do "ver mais")
• "[Número] anos a fazer X. O que aprendi em [tempo] mudou tudo:"
• "A maioria das pessoas faz [X] errado. Aqui está o que realmente funciona:"

[LINHA EM BRANCO obrigatória]

IDENTIFICAÇÃO: 1-2 frases que fazem o leitor pensar "isto é sobre mim".

DESENVOLVIMENTO: Bullet points ou parágrafos de 1-2 linhas. Nunca blocos.

FECHO: Insight accionável + pergunta ou CTA.

Comprimento: 150-250 palavras. Tom: profissional mas humano.`,

    twitter: `
FORMATO: Thread para X/Twitter

TWEET 1 — HOOK (determina tudo, máx 240 caracteres, termina com ":")
TWEETS 2-5 — DESENVOLVIMENTO (um único ponto por tweet, começa com número)
TWEET 6 — GOLDEN NUGGET (o insight mais valioso)
TWEET FINAL — CTA (pergunta ou próxima acção)

Numera todos: (1/7), (2/7), etc.`,

    email: `
FORMATO: Email para lista de subscribers

ASSUNTO (máx 45 caracteres, específico > intrigante > genérico)
PRÉ-HEADER (1 frase, complementa sem repetir)
ABERTURA (começa IN MEDIAS RES — no meio da história, não com "Olá")
CORPO: Hook → Identificação → Promessa → Prova/História → CTA
200-400 palavras, parágrafos de 1-3 linhas, escreve para UMA pessoa.
CTA ÚNICO no final: "Quero [resultado]" > "Comprar agora"`,
  },

  // ── CAPTIONS ─────────────────────────────────────────────────────────────
  legenda: {
    storytelling: `
FORMATO: Legenda com Storytelling para Reel ou Post

Cria uma legenda que complementa o conteúdo visual com uma narrativa pessoal.

ESTRUTURA:
LINHA 1 (HOOK): Para o scroll. 1 linha que cria curiosidade ou contradição.

[LINHA EM BRANCO]

HISTÓRIA (3-5 parágrafos de 1-3 linhas):
- Começa in medias res — no meio da acção
- Detalhes específicos (não "uma tarde qualquer" — "terça, 14h, Lisboa")
- Vulnerabilidade real — não só sucessos
- Cada parágrafo avança a história

LIÇÃO (1-2 linhas):
O que o espectador leva para a vida.

CTA:
- Não "deixa um like"
- "Envia a alguém que [situação específica]" ou "Guarda para quando [momento]"

2-3 hashtags no máximo.
Comprimento: 100-200 palavras.`,
  },

  // ── EMAIL MARKETING ──────────────────────────────────────────────────────
  email: {
    boasVindas: `
FORMATO: Email de Boas-Vindas

Cria o email perfeito de boas-vindas para um novo subscritor.

ESTRUTURA:
ASSUNTO: Caloroso, específico, promete o que vem a seguir (máx 45 caracteres)
PRÉ-HEADER: Complementa o assunto com curiosidade adicional

ABERTURA: Começa com uma história — não com "Bem-vindo à newsletter".
Cria o contexto de QUEM é o criador em 2-3 frases de história real.

CORPO:
- O que o subscritor vai receber (concreto, não "conteúdo incrível")
- Por que isto é diferente de tudo o que já receberam
- Uma coisa imediata para fazer (não tem de ser comprar — pode ser responder a uma pergunta)

CTA: Simples, directo, accionável agora.

Comprimento: 200-300 palavras. Tom: amigo que te escreve uma carta, não empresa.`,

    nutricao: `
FORMATO: Email de Nutrição de Leads

Cria um email que educa e aquece o lead para uma decisão futura.

ESTRUTURA:
ASSUNTO: Promete um insight específico e valioso (máx 45 caracteres)

ABERTURA: História curta que apresenta o problema central do email.

CORPO (Gary Halbert):
- Identifica a dor com precisão
- Apresenta o insight/aprendizagem de forma inesperada
- Dá valor REAL — algo que o leitor pode usar hoje mesmo
- Conecta naturalmente ao próximo passo (sem pressão)

FECHO: "Responde a este email com [X]" ou link para conteúdo aprofundado.

Comprimento: 250-350 palavras. Tom: mentor que partilha, não vendedor.`,

    vendaDireta: `
FORMATO: Email de Venda Directa

Cria um email que vende directamente um produto ou serviço.

ESTRUTURA (AIDA + Halbert):
ASSUNTO: Urgência ou curiosidade real — nunca spam (máx 45 caracteres)

ABERTURA: Entra directamente na dor. Sem apresentação.

CORPO:
1. IDENTIFICAÇÃO: Descreve a situação actual do leitor com precisão cirúrgica
2. AGITAÇÃO: Mostra as consequências de não agir (sem drama falso)
3. SOLUÇÃO: Apresenta o produto como consequência lógica — não como interrupção
4. PROVA: 1 resultado real, específico, verificável
5. OFERTA: Clara, directa, sem linguagem de "promoção"

CTA: 1 único CTA no final. "Quero [resultado específico] →"

Comprimento: 300-400 palavras. Zero fluff. Cada frase ganha o direito de existir.`,
  },
};

// Principles of the best copywriters
const copywritingMasters = `
PRINCÍPIOS DOS MELHORES COPYWRITERS — APLICA EM TUDO:
• GARY HALBERT: Especificidade vence generalidade. Histórias que vendem. Teste "e então?".
• DAVID OGILVY: O headline promete benefício claro. Factos batem hyperbole.
• EUGENE SCHWARTZ: Fala para o nível de consciência ACTUAL do leitor.
• DAN KENNEDY: Cada palavra paga renda ou sai. Zero fluff.
• ALEX HORMOZI: Especificidade de resultado. "Perder 8kg em 8 semanas" > "ficar em forma".
• NICOLAS COLE: Linha 1 é 80% do trabalho. Insights contra-intuitivos > confirmar o que já sabem.
• MOSSERI (Instagram): DM Shares valem 3-5x mais que likes. Watch Time é o sinal #1.`;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  // Rate limiting — 20 generations per day per user
  const rateLimit = await checkAndConsumeRateLimit(userId, "generate");
  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
  }

  // Server-side progress check (do not trust Clerk unsafeMetadata alone)
  const progress = await getUserProgress(userId);
  if (progress && !progress.vozDNAComplete) {
    return NextResponse.json(
      { error: "Completa o Voz & DNA antes de gerar conteúdo." },
      { status: 403 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate with Zod
  const validation = validateInput(GenerateSchema, rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { topic, vozDNA } = validation.data;

  // Supports both the new system (format+subtype) and the legacy one (platform)
  const format = validation.data.format ?? "post";
  const subtype = validation.data.subtype ?? validation.data.platform ?? "instagram";

  if (!topic) {
    return NextResponse.json({ error: "topic é obrigatório" }, { status: 400 });
  }

  const user = await currentUser();
  const authorName = user?.firstName ?? "Coach";

  const geniusProfile = user?.unsafeMetadata?.geniusProfile as GeniusProfile | undefined;
  const geniusSection = geniusProfile
    ? `\nGENIUS PROFILE DE ${authorName.toUpperCase()}:\n• Zona de Genialidade: ${geniusProfile.hendricksZone ?? "—"}\n• Perfil de Riqueza: ${geniusProfile.wealthProfile ?? "—"}\n• Modo de Acção: ${geniusProfile.kolbeMode ?? "—"}\n• Vantagem Fascinante: ${geniusProfile.fascinationAdvantage ?? "—"}\n`
    : "";

  const vozDNASection = vozDNA
    ? `
VOZ & DNA DE ${authorName.toUpperCase()}:
Arquétipo: ${vozDNA.arquetipo ?? "Mentor Directo"}
${vozDNA.descricaoArquetipo ? `Descrição: ${vozDNA.descricaoArquetipo}` : ""}
Tom em 3 palavras: ${vozDNA.tomEmTresPalavras?.join(", ") ?? "Directo, Autêntico, Prático"}
VOCABULÁRIO OBRIGATÓRIO: ${vozDNA.vocabularioActivo?.join(", ") ?? "sistema, prova, consistência"}
VOCABULÁRIO PROIBIDO: ${vozDNA.vocabularioProibido?.join(", ") ?? "fácil, rápido, truque"}
FRASES ASSINATURA: ${vozDNA.frasesAssinatura?.join(" | ") ?? "—"}
REGRAS DE ESTILO: ${vozDNA.regrasEstilo?.join(" | ") ?? "Vai directo ao ponto"}`
    : `VOZ & DNA: directa, autêntica, sem filtros corporativos. Proibido: fácil, rápido, truque.`;

  // Fetch the prompt for the format+type
  const formatTemplate = formatPrompts[format]?.[subtype]
    ?? formatPrompts.post.instagram;

  const systemPrompt = `És o melhor criador de conteúdo do mundo para solopreneurs e criadores de marca pessoal.

MISSÃO: Gerar conteúdo que soe EXACTAMENTE a ${authorName} E aplique os princípios dos melhores copywriters do mundo.
${vozDNASection}
${geniusSection}
${copywritingMasters}

REGRAS ABSOLUTAS:
1. Escreve NA VOZ de ${authorName} — primeira pessoa
2. NUNCA uses vocabulário proibido
3. NUNCA inventas resultados, números, prova social ou factos não fornecidos
4. Uma única ideia central por peça
5. Soa a ${authorName}, não a template de IA — se soar a template, reescreve`;

  const userPrompt = `Cria conteúdo sobre o seguinte tema para ${authorName}:

TEMA: ${topic}

${formatTemplate}

Escreve o conteúdo completo, pronto a publicar. Sem introduções, sem explicações — só o conteúdo.`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

    const generatedText = content.text;

    // Save to Supabase with corrected schema (migration 008)
    const tokens = message.usage.input_tokens + message.usage.output_tokens;
    try {
      const supabase = createServerClient();
      await supabase.from("generated_content").insert({
        user_id:  userId,
        platform: `${format}/${subtype}`,  // Legacy (kept for backward compatibility)
        format,                             // New field (migration 008)
        subtype,                            // New field (migration 008)
        topic,
        content:  generatedText,
      });
    } catch (dbError) {
      console.error("Error saving to Supabase:", dbError);
    }

    // Audit log (non-blocking)
    logAudit({
      userId,
      action: "content.generate",
      metadata: { format, subtype, topic: topic.slice(0, 100), tokens },
    });

    return NextResponse.json({
      content: generatedText,
      format,
      subtype,
      topic,
      tokens,
    });
  } catch (error) {
    console.error("Error calling Claude API:", error);
    logAudit({ userId, action: "content.generate", success: false, errorMsg: String(error) });
    return NextResponse.json({ error: "Error generating content. Please try again." }, { status: 500 });
  }
}
