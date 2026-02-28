export interface ParsedCard {
  numero: number;
  tipo: "cover" | "content" | "cta";
  titulo: string;
  corpo: string;
}

/**
 * Extrai cards estruturados de texto gerado pela IA.
 * Suporta os formatos: CARD N, listas numeradas e blocos por parágrafo.
 */
export function parseCarouselCards(rawText: string): ParsedCard[] {
  if (!rawText?.trim()) return [];

  const text = rawText.replace(/\r\n/g, "\n").trim();

  // ── Padrão 1: CARD N (descrição opcional) ────────────────────────────────
  const cardRegex = /CARD\s+(\d+)[^\n]*\n([\s\S]*?)(?=\nCARD\s+\d+|\s*$)/gi;
  const matches = [...text.matchAll(cardRegex)];

  if (matches.length >= 2) {
    const total = matches.length;
    return matches.map((m, i) => {
      const bloco = m[2].trim();
      const linhas = bloco.split("\n").filter((l) => l.trim());
      return {
        numero: parseInt(m[1]),
        tipo: i === 0 ? "cover" : i === total - 1 ? "cta" : "content",
        titulo: limpa(linhas[0] ?? ""),
        corpo: linhas.slice(1).join(" ").trim(),
      };
    });
  }

  // ── Padrão 2: Blocos separados por linha em branco ────────────────────────
  const paragrafos = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  if (paragrafos.length >= 2) {
    const total = Math.min(paragrafos.length, 9);
    return paragrafos.slice(0, total).map((p, i) => {
      const linhas = p.split("\n").filter((l) => l.trim());
      return {
        numero: i + 1,
        tipo: i === 0 ? "cover" : i === total - 1 ? "cta" : "content",
        titulo: limpa(linhas[0] ?? `Card ${i + 1}`),
        corpo: linhas.slice(1).join(" ").trim(),
      };
    });
  }

  // ── Fallback: texto completo como 1 card ──────────────────────────────────
  const linhas = text.split("\n").filter((l) => l.trim());
  return [
    {
      numero: 1,
      tipo: "cover",
      titulo: limpa(linhas[0] ?? ""),
      corpo: linhas.slice(1).join(" ").trim(),
    },
  ];
}

function limpa(linha: string): string {
  return linha
    .replace(/^\s*[#*\-•>]+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/_/g, "")
    .trim();
}
