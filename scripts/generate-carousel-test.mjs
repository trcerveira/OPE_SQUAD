import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read API key from .env.local
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const apiKeyMatch = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
if (!apiKeyMatch) { console.error("No ANTHROPIC_API_KEY found"); process.exit(1); }
const apiKey = apiKeyMatch[1].trim();

const topic = "5 erros de quem ignora o Method25";
const authorName = "Coach Teo";
const paletteId = "stealth-emerald";

const systemPrompt = `Es o melhor criador de carrosseis de Instagram do mundo para solopreneurs.

MISSAO: Gerar exactamente 18 textos para um carrossel de 9 slides na voz de ${authorName}.

ALGORITMO DO INSTAGRAM (confirmado por Adam Mosseri, CEO do Instagram, Janeiro 2025):
Os 3 sinais que determinam se o carrossel chega a novas pessoas:
1. WATCH TIME — o sinal #1. Cada slide tem de ganhar o direito de o utilizador passar para o proximo. O cover decide TUDO.
2. SENDS PER REACH (DM Shares) — o sinal mais poderoso para alcance nao-seguidores. Cria conteudo que alguem quer enviar a um amigo. Isto vale 3-5x mais que likes.
3. LIKES PER REACH — engagement genuino. Quanto mais likes por pessoa alcancada, melhor.

COPYWRITING VISUAL PREMIUM (regras obrigatorias):
- Headlines sao como outdoors: 4-8 palavras que param o scroll em 1.7 segundos
- Cada headline deve funcionar ISOLADO — sem contexto anterior necessario
- Corpo: maximo 2 frases por bloco. Whitespace e premium. Menos = mais.
- Especificidade SEMPRE: "30 empresas em 12 meses" vence "varias empresas"
- Tensao narrativa: cada slide cria uma pergunta que o proximo responde
- O CTA final deve ser irresistivel de partilhar (DM shares = sinal #1 do algoritmo)
- Tom: autoridade calma, nunca desesperado. Confianca silenciosa, nao grita.
- ZERO decoracao gratuita: cada palavra deve ter proposito. Se nao tem, apaga.
- Contradicao > Afirmacao: "O que ninguem te diz sobre X" > "Aprende sobre X"
- Numeros concretos > promessas vagas: "8 passos" > "varios passos"
- Dor especifica > dor generica: "acordar as 3h com ansiedade" > "estar stressado"

ANTI-PADROES (NUNCA FAZER):
- ZERO emojis em QUALQUER texto — profissional = texto limpo, sem excepcoes
- NUNCA headlines genericos: "Descubra como...", "Voce sabia que...", "X dicas para..."
- NUNCA corpo longo (max 2 frases por paragrafo de slide)
- NUNCA imagePrompts genericos ("beautiful landscape") — ser ESPECIFICO ao tema
- NUNCA texto motivacional vazio sem substancia concreta por tras
- NUNCA repetir a mesma estrutura em slides consecutivos (variar ritmo)
- NUNCA usar "simples", "facil", "basico" — tudo aqui e premium
- NUNCA inventar dados, numeros ou provas sociais falsas

ESTRUTURA DO CARROSSEL (9 slides, 18 textos):
- texto 1: Tag/subtitulo do cover (curto, 3-6 palavras, em maiusculas)
- texto 2: Titulo principal do cover (HOOK que para o scroll em 1.7s, 4-8 palavras, em maiusculas)
- texto 3: Headline slide 2 (bold, directo, em maiusculas)
- texto 4: Corpo slide 2 (1-2 frases)
- texto 5: Corpo slide 3 paragrafo 1 (primeiro insight concreto)
- texto 6: Corpo slide 3 paragrafo 2 (desenvolvimento com especificidade)
- texto 7: Headline slide 4 (frase de impacto em maiusculas)
- texto 8: Corpo slide 4 (manter curto)
- texto 9: Corpo slide 5 paragrafo 1 (segundo insight)
- texto 10: Corpo slide 5 paragrafo 2 (exemplo concreto)
- texto 11: Headline slide 6 (bold, provocador, em maiusculas)
- texto 12: Corpo slide 6 (o insight mais valioso, shareable)
- texto 13: Headline slide 7 (em maiusculas — transformacao)
- texto 14: Corpo slide 7 (1-2 frases — resultado)
- texto 15: Corpo slide 8 paragrafo 1 (sintese)
- texto 16: Corpo slide 8 paragrafo 2 (reforco emocional)
- texto 17: Corpo slide 8 paragrafo 3 (frase final)
- texto 18: CTA final que GERA DM SHARES

REGRAS ABSOLUTAS:
1. Escreve em Portugues europeu, na voz de ${authorName}
2. Headlines em MAIUSCULAS, corpo em minusculas normais
3. ZERO emojis
4. Cada slide cria tensao para o proximo
5. O carrossel conta uma historia progressiva
6. O CTA final deve provocar DM shares

REGRAS PARA imagePrompts (PALETA DARK PREMIUM — emerald green):
- Estetica: growth, financa, resultados
- TODOS os imagePrompts DEVEM ter: "dark background, dramatic lighting, cinematic"
- Slide 1 (cover): "dark moody atmosphere, single key light, high contrast, editorial, emerald highlights, dark organic tones, growth symbolism"
- Slides impares (3,5,7): "dark tones, atmospheric, abstract shapes, subtle emerald green highlights"
- Slides pares (2,4,6,8): "dark studio photography, rim lighting, professional, emerald green accents"
- Slide 9 (CTA): "dark cinematic wide shot, inspirational, subtle emerald green glow"
- NUNCA fundos brancos ou claros

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

Responde APENAS com JSON valido. Sem texto antes ou depois.`;

console.log("Generating carousel for:", topic);
console.log("Using palette:", paletteId);
console.log("Calling Claude API...\n");

const anthropic = new Anthropic({ apiKey });

const message = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 3000,
  system: systemPrompt,
  messages: [{ role: "user", content: `Cria um carrossel de Instagram sobre: ${topic}` }],
});

const content = message.content[0];
if (content.type !== "text") { console.error("Unexpected response"); process.exit(1); }

let jsonText = content.text.trim();
const jsonStart = jsonText.indexOf("{");
const jsonEnd = jsonText.lastIndexOf("}");
if (jsonStart !== -1 && jsonEnd !== -1) {
  jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
}

const parsed = JSON.parse(jsonText);
console.log("Tokens used:", message.usage.input_tokens + message.usage.output_tokens);

// Parse the 18 texts
const lines = parsed.textos.split("\n").filter(l => l.trim());
const textos = {};
for (const line of lines) {
  const match = line.match(/texto\s*(\d+)\s*[-–:]\s*(.*)/i);
  if (match) textos[parseInt(match[1])] = match[2].trim();
}

console.log("\n=== 18 TEXTOS GERADOS ===\n");
for (let i = 1; i <= 18; i++) {
  console.log(`texto ${i}: ${textos[i] || "(vazio)"}`);
}

console.log("\n=== KEYWORDS ===");
console.log(parsed.keywords?.join(", "));

console.log("\n=== IMAGE PROMPTS ===");
(parsed.imagePrompts || []).forEach((p, i) => console.log(`Slide ${i+1}: ${p}`));

// Save to JSON for the HTML renderer
const outputPath = resolve(__dirname, "..", "public", "carousel-test.json");
writeFileSync(outputPath, JSON.stringify({ textos, keywords: parsed.keywords, imagePrompts: parsed.imagePrompts }, null, 2));
console.log("\nSaved to:", outputPath);
