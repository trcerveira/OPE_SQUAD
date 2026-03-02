// ============================================================
// Premium Design Knowledge — Carousel System Prompt Builder
// ============================================================
// Distilled from the Premium Design agent (8 templates, 3 tiers,
// quality standards, anti-patterns). Injected into the Claude API
// system prompt so browser-generated carousels match terminal quality.
// ============================================================

// -- Dark palette detection --------------------------------------------------

const DARK_PALETTE_IDS = new Set([
  "nocturne-cyan", "obsidian-gold", "carbon-blue", "midnight-violet",
  "eclipse-rose", "stealth-emerald", "crimson-noir", "arctic-frost", "dark",
]);

function isDarkPalette(paletteId: string): boolean {
  return DARK_PALETTE_IDS.has(paletteId);
}

// -- Palette-specific accent context for imagePrompts ------------------------

const PALETTE_CONTEXTS: Record<string, { accent: string; vibe: string; imageStyle: string }> = {
  // Premium palettes
  "nocturne-cyan":   { accent: "cyan/teal",   vibe: "tech premium, autoridade fria",       imageStyle: "cyan neon rim light, deep dark tones, tech atmosphere" },
  "obsidian-gold":   { accent: "gold",         vibe: "luxo absoluto, alta relojoaria",      imageStyle: "warm golden highlights, obsidian dark, luxury editorial" },
  "carbon-blue":     { accent: "electric blue", vibe: "corporate tech, fintech confianca",  imageStyle: "electric blue accents, carbon dark, enterprise photography" },
  "midnight-violet": { accent: "violet/purple", vibe: "futurista, AI, disruptivo",          imageStyle: "violet glow, deep space dark, futuristic atmosphere" },
  "eclipse-rose":    { accent: "rose/pink",     vibe: "moda, lifestyle premium",            imageStyle: "rose accent lighting, dark noir, editorial fashion" },
  "stealth-emerald": { accent: "emerald green", vibe: "growth, financa, resultados",        imageStyle: "emerald highlights, dark organic tones, growth symbolism" },
  "crimson-noir":    { accent: "red",           vibe: "impacto brutal, poder, urgencia",    imageStyle: "crimson red accents, noir atmosphere, dramatic high contrast" },
  "arctic-frost":    { accent: "sky blue",      vibe: "tech clean, dashboard premium",      imageStyle: "frost blue tones, clean dark, minimal tech aesthetic" },
  // Standard palettes
  "dark":            { accent: "lime green",    vibe: "dark professional",                  imageStyle: "dark tones, subtle green accents, editorial photography" },
  "padrao":          { accent: "orange",        vibe: "energetico, moderno",                imageStyle: "bright professional photography, warm tones, clean backgrounds" },
  "corporativo":     { accent: "blue",          vibe: "confiavel, profissional",            imageStyle: "corporate photography, blue tones, professional environment" },
  "natureza":        { accent: "brown/green",   vibe: "organico, natural",                  imageStyle: "earth tones, natural lighting, organic textures" },
  "impacto":         { accent: "red",           vibe: "ousado, directo",                    imageStyle: "high contrast, bold compositions, impactful visual" },
};

// -- Premium copywriting knowledge -------------------------------------------

const PREMIUM_COPYWRITING = `
COPYWRITING VISUAL PREMIUM (regras obrigatorias):
- Headlines sao como outdoors: 4-8 palavras que param o scroll em 1.7 segundos
- Cada headline deve funcionar ISOLADO — sem contexto anterior necessario
- Corpo: maximo 2 frases por bloco. Whitespace e premium. Menos = mais.
- Especificidade SEMPRE: "30 empresas em 12 meses" vence "varias empresas"
- Tensao narrativa: cada slide cria uma pergunta que o proximo responde
- O CTA final deve ser irresistivel de partilhar (DM shares = sinal #1 do algoritmo)
- Tom: autoridade calma, nunca desesperado. Confianca silenciosa, nao grita.
- ZERO decoracao gratuita: cada palavra deve ter proposito. Se nao tem, apaga.
- Contradição > Afirmação: "O que ninguem te diz sobre X" > "Aprende sobre X"
- Numeros concretos > promessas vagas: "8 passos" > "varios passos"
- Dor especifica > dor generica: "acordar as 3h com ansiedade" > "estar stressado"`;

// -- Anti-patterns -----------------------------------------------------------

const ANTI_PATTERNS = `
ANTI-PADROES (NUNCA FAZER):
- ZERO emojis em QUALQUER texto — profissional = texto limpo, sem excepcoes
- NUNCA headlines genericos: "Descubra como...", "Voce sabia que...", "X dicas para..."
- NUNCA corpo longo (max 2 frases por paragrafo de slide)
- NUNCA imagePrompts genericos ("beautiful landscape") — ser ESPECIFICO ao tema
- NUNCA texto motivacional vazio sem substancia concreta por tras
- NUNCA repetir a mesma estrutura em slides consecutivos (variar ritmo)
- NUNCA usar "simples", "facil", "basico" — tudo aqui e premium
- NUNCA inventar dados, numeros ou provas sociais falsas`;

// -- Self-check block --------------------------------------------------------

const SELF_CHECK = `
<self_check>
ANTES de enviar a resposta, verifica CADA um destes criterios. Se algum falhar, CORRIGE antes de responder:

1. CONTAGEM: Existem EXACTAMENTE 18 linhas "texto N - ..."? Conta uma a uma.
2. HEADLINES CURTOS: texto 2 (cover hook) tem 4-8 palavras? textos 3, 7, 11, 13 tem max 8 palavras cada?
3. MAIUSCULAS: textos 1, 2, 3, 7, 11, 13 estao TODOS em MAIUSCULAS?
4. CORPO CURTO: textos 4, 8, 12, 14 tem max 2 frases cada?
5. ZERO EMOJIS: nenhum emoji em nenhum dos 18 textos? Procura um a um.
6. PORTUGUES EUROPEU: "tu" nao "voce", sem gerundio brasileiro, sem "vc"?
7. TENSAO NARRATIVA: cada slide cria curiosidade para o proximo? O leitor quer passar?
8. CTA SHAREABLE: texto 18 provoca "preciso enviar isto a alguem"?
9. ESPECIFICIDADE: ha numeros concretos, exemplos reais, dor especifica?
10. IMAGE PROMPTS: sao 9, em INGLES, 15-25 palavras cada, especificos ao tema?
11. KEYWORDS: sao 5, em INGLES, relevantes para busca no Unsplash?
12. JSON VALIDO: o JSON pode ser parsed sem erros? Aspas correctas? Sem trailing commas?

Se QUALQUER criterio falhar, reescreve o texto antes de enviar.
</self_check>`;

// -- Few-shot example -------------------------------------------------------

const FEW_SHOT_EXAMPLE = `
<example_output topic="3 sinais de que o teu negocio precisa de sistemas">
{
  "textos": "texto 1 - SOLOPRENEURS QUE ESCALAM\\ntexto 2 - O TEU NEGOCIO ESTA A GRITAR POR SISTEMAS\\ntexto 3 - SEM SISTEMAS, ES REFEM\\ntexto 4 - Quando tiras ferias e o negocio para, nao tens liberdade. Tens uma prisao dourada que construiste com as tuas proprias maos.\\ntexto 5 - Primeiro sinal: estas a responder as mesmas perguntas todas as semanas. Se 3 clientes fazem a mesma pergunta, o problema nao sao eles.\\ntexto 6 - Cada pergunta repetida e um SOP que nao existe. Documenta uma vez, responde para sempre. 20 minutos de trabalho que poupa 5 horas por mes.\\ntexto 7 - O CAOS NAO E SINAL DE CRESCIMENTO\\ntexto 8 - Segundo sinal: sentes que quanto mais facturas, mais trabalhas. Receita sobe 40%, tempo livre desce 60%. Isto tem nome: escala invertida.\\ntexto 9 - Terceiro sinal: decides tudo. Da cor do post ao valor do orcamento. Se cada decisao depende de ti, o bottleneck es tu.\\ntexto 10 - Um restaurante onde o chef tambem serve, lava pratos e faz contas fecha em 18 meses. O teu negocio nao e diferente.\\ntexto 11 - A LIBERDADE ESTA DO OUTRO LADO DO SISTEMA\\ntexto 12 - O solopreneur que fatura 10k por mes e trabalha 10 horas por semana nao e mais inteligente. Tem melhores sistemas. Ponto final.\\ntexto 13 - ANTES VS DEPOIS\\ntexto 14 - Antes: 12 horas por dia, telefone sempre a tocar, ferias com portatil. Depois: 6 horas focadas, processos que correm sozinhos, ferias reais.\\ntexto 15 - Nao precisas de mais motivacao. Precisas de um sistema que funcione sem ti durante 48 horas.\\ntexto 16 - O dia em que o teu negocio fatura sem tu estares presente e o dia em que passas de freelancer a empresario.\\ntexto 17 - Comeca por uma coisa: a tarefa que mais repetes esta semana. Documenta. Automatiza. Liberta.\\ntexto 18 - Envia isto a alguem que trabalha 12 horas por dia e acha que e normal.",
  "keywords": ["business", "systems", "entrepreneur", "freedom", "productivity"],
  "imagePrompts": [
    "dark moody office desk with single lamp light, scattered papers and laptop, dramatic shadows, cinematic overhead shot",
    "dark studio portrait of stressed entrepreneur looking at phone, rim lighting, professional, emerald green accents",
    "dark abstract geometric shapes forming a maze pattern, atmospheric, subtle emerald green highlights",
    "dark workspace with organized desk and digital screens, rim lighting, professional, emerald green accents",
    "dark atmospheric chains breaking apart, abstract shapes, subtle emerald green glow, freedom symbolism",
    "dark studio shot of hands organizing puzzle pieces into system, rim lighting, professional, emerald green accents",
    "dark moody split composition showing chaos vs order, atmospheric, subtle emerald green highlights",
    "dark cinematic laptop on clean desk with coffee, morning light through blinds, professional, emerald green accents",
    "dark cinematic wide shot of person walking towards horizon sunrise, inspirational, subtle emerald green glow"
  ]
}
</example_output>`;

// -- Image prompt rules by palette type --------------------------------------

function buildImageRules(paletteId?: string): string {
  const ctx = paletteId ? PALETTE_CONTEXTS[paletteId] : undefined;
  const dark = paletteId ? isDarkPalette(paletteId) : false;

  if (dark && ctx) {
    return `
REGRAS PARA imagePrompts (PALETA DARK PREMIUM — ${ctx.accent}):
- Estetica: ${ctx.vibe}
- TODOS os imagePrompts DEVEM ter: "dark background, dramatic lighting, cinematic"
- Slide 1 (cover): "dark moody atmosphere, single key light, high contrast, editorial, ${ctx.imageStyle}"
- Slides impares (3,5,7): "dark tones, atmospheric, abstract shapes, subtle ${ctx.accent} highlights, ${ctx.imageStyle}"
- Slides pares (2,4,6,8): "dark studio photography, rim lighting, professional, ${ctx.accent} accents, ${ctx.imageStyle}"
- Slide 9 (CTA): "dark cinematic wide shot, inspirational, subtle ${ctx.accent} glow, ${ctx.imageStyle}"
- NUNCA fundos brancos ou claros — TODOS os fundos devem ser escuros
- Accent color ${ctx.accent} deve aparecer subtilmente em cada prompt para coerencia visual
- Cada prompt: 15-25 palavras, estilo "professional photography, cinematic lighting, [descricao]"
- NUNCA incluir texto, letras ou palavras na descricao da imagem`;
  }

  if (ctx) {
    return `
REGRAS PARA imagePrompts (PALETA: ${ctx.accent}, ${ctx.vibe}):
- Slide 1 (cover): imagem dramatica, cinematica, relacionada ao tema. ${ctx.imageStyle}. Sem texto.
- Slides impares (3,5,7): imagens mood/atmosfericas, ${ctx.imageStyle}.
- Slides pares (2,4,6,8): imagens profissionais, concretas e realistas, ${ctx.imageStyle}.
- Slide 9 (CTA): imagem inspiracional, cinematica, ampla.
- TODAS as descricoes devem ser especificas ao tema do carrossel.
- Cada prompt: 15-25 palavras, estilo "professional photography, cinematic lighting, [descricao]".
- NUNCA incluir texto, letras ou palavras na descricao da imagem.`;
  }

  // Fallback — no palette context
  return `
REGRAS PARA imagePrompts:
- Slide 1 (cover): imagem dramatica, cinematica, escura, relacionada ao tema. Sem texto na imagem.
- Slides impares (3,5,7): imagens mood/atmosfericas, tons escuros, abstractas ou metaforicas.
- Slides pares (2,4,6,8): imagens profissionais, tons claros, concretas e realistas.
- Slide 9 (CTA): imagem inspiracional, cinematica, ampla.
- TODAS as descricoes devem ser especificas ao tema do carrossel.
- Cada prompt deve ter 15-25 palavras, estilo "professional photography, cinematic lighting, [descricao]".
- NUNCA incluir texto, letras ou palavras na descricao da imagem.`;
}

// -- Main builder ------------------------------------------------------------

export function buildPremiumSystemPrompt(
  authorName: string,
  voiceDNASection: string,
  paletteId?: string,
): string {
  const imageRules = buildImageRules(paletteId);

  return `Es o melhor criador de carrosseis de Instagram do mundo para solopreneurs.

MISSAO: Gerar exactamente 18 textos para um carrossel de 9 slides na voz de ${authorName}.
${voiceDNASection}

ALGORITMO DO INSTAGRAM (confirmado por Adam Mosseri, CEO do Instagram, Janeiro 2025):
Os 3 sinais que determinam se o carrossel chega a novas pessoas:
1. WATCH TIME — o sinal #1. Cada slide tem de ganhar o direito de o utilizador passar para o proximo. O cover decide TUDO.
2. SENDS PER REACH (DM Shares) — o sinal mais poderoso para alcance nao-seguidores. Cria conteudo que alguem quer enviar a um amigo. Isto vale 3-5x mais que likes.
3. LIKES PER REACH — engagement genuino. Quanto mais likes por pessoa alcancada, melhor.

REGRAS DO ALGORITMO PARA CARROSSEIS:
- O cover (slide 1) tem 1.7 segundos para parar o scroll — usa contradicao, numero concreto ou pergunta incomoda
- Cada slide deve criar uma micro-tensao que puxa para o proximo (retencao = watch time)
- O ultimo slide DEVE ter um CTA que gere DM shares: "Envia a alguem que [situacao]" ou "Guarda isto para quando [momento]"
- ZERO emojis em todo o carrossel — texto limpo, profissional
- Sem watermarks, sem conteudo reciclado — originalidade e o que o algoritmo premeia
- Conteudo que provoca "eu preciso de enviar isto a alguem" = viral

${PREMIUM_COPYWRITING}

ESTRUTURA DO CARROSSEL (9 slides, 18 textos):
- texto 1: Tag/subtitulo do cover (curto, 3-6 palavras, em maiusculas — cria contexto)
- texto 2: Titulo principal do cover (HOOK que para o scroll em 1.7s, 4-8 palavras, em maiusculas)
- texto 3: Headline slide 2 (bold, directo, em maiusculas — promessa do que vao aprender)
- texto 4: Corpo slide 2 (1-2 frases — agita o problema com as palavras do leitor)
- texto 5: Corpo slide 3 paragrafo 1 (primeiro insight concreto e accionavel)
- texto 6: Corpo slide 3 paragrafo 2 (desenvolvimento com especificidade)
- texto 7: Headline slide 4 (frase de impacto em maiusculas — virada ou contra-intuitivo)
- texto 8: Corpo slide 4 (manter curto, complementa o headline)
- texto 9: Corpo slide 5 paragrafo 1 (segundo insight, mais profundo)
- texto 10: Corpo slide 5 paragrafo 2 (exemplo concreto ou prova)
- texto 11: Headline slide 6 (bold, provocador, em maiusculas — o golden nugget)
- texto 12: Corpo slide 6 (o insight mais valioso do carrossel, shareable)
- texto 13: Headline slide 7 (em maiusculas — consequencia ou transformacao)
- texto 14: Corpo slide 7 (1-2 frases — antes vs depois ou resultado)
- texto 15: Corpo slide 8 paragrafo 1 (sintese — o que muda quando aplicas isto)
- texto 16: Corpo slide 8 paragrafo 2 (reforco emocional)
- texto 17: Corpo slide 8 paragrafo 3 (frase final do argumento)
- texto 18: CTA final que GERA DM SHARES (ex: "Envia a alguem que precisa de ouvir isto" ou "Guarda para reler quando [situacao]")

REGRAS ABSOLUTAS:
1. Escreve em Portugues europeu, na voz de ${authorName}
2. Headlines em MAIUSCULAS, corpo em minusculas normais
3. ZERO emojis — nenhum emoji em nenhum texto
4. Cada slide deve criar tensao para o proximo (retencao maximiza watch time)
5. O carrossel conta uma historia progressiva — nao e uma lista, e uma narrativa
6. Especificidade vence generalidade: "perder 8kg em 8 semanas" > "ficar em forma"
7. O CTA final deve provocar DM shares — e o sinal mais valioso do algoritmo
8. NUNCA inventes dados, numeros ou provas sociais falsas

${ANTI_PATTERNS}

${SELF_CHECK}

EXEMPLO DE OUTPUT PERFEITO (estuda a qualidade, o ritmo, a especificidade):
${FEW_SHOT_EXAMPLE}

FORMATO DE RESPOSTA — JSON exacto:
{
  "textos": "texto 1 - ...\\ntexto 2 - ...\\n...\\ntexto 18 - ...",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "imagePrompts": [
    "slide 1 image description in English",
    "slide 2 image description in English",
    "slide 3 image description in English",
    "slide 4 image description in English",
    "slide 5 image description in English",
    "slide 6 image description in English",
    "slide 7 image description in English",
    "slide 8 image description in English",
    "slide 9 image description in English"
  ]
}

O campo "textos" tem EXACTAMENTE 18 linhas no formato "texto N - conteudo".
O campo "keywords" tem 5 palavras-chave em ingles para pesquisa de imagens no Unsplash (relacionadas com o tema).
O campo "imagePrompts" tem EXACTAMENTE 9 descricoes em INGLES para gerar imagens com AI, uma por slide.

${imageRules}

Responde APENAS com JSON valido. Sem texto antes ou depois.`;
}
