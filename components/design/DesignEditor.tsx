"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { parseCarouselCards, type ParsedCard } from "./cardParser";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TemplateId =
  | "editorial"
  | "editorial-compact"
  | "foto-total"
  | "foto-split"
  | "dark-minimal"
  | "dark-brand"
  | "thread";

export interface CardData {
  tag: string;
  headline: string;
  body: string;
  imageUrl: string;
  cta: string;
}

export interface AuthorData {
  nome: string;
  handle: string;
  avatarUrl: string;
  accentColor: string;
}

interface TemplateInfo {
  id: TemplateId;
  nome: string;
  descricao: string;
  bgColor: string;
  accentSample: string;
}

const TEMPLATES: TemplateInfo[] = [
  { id: "editorial",         nome: "Editorial",          descricao: "Branco · foto + título",        bgColor: "#ffffff",  accentSample: "#E85D26" },
  { id: "editorial-compact", nome: "Editorial Compacto", descricao: "Creme · copy densa",            bgColor: "#F8F6F1",  accentSample: "#C2840A" },
  { id: "foto-total",        nome: "Foto Total",         descricao: "Foto fullscreen · overlay",    bgColor: "#0a0a1a",  accentSample: "#BFD64B" },
  { id: "foto-split",        nome: "Foto Split",         descricao: "Foto em cima · bloco em baixo", bgColor: "#111827",  accentSample: "#C9A84C" },
  { id: "dark-minimal",      nome: "Dark Minimal",       descricao: "Preto · texto centrado",        bgColor: "#000000",  accentSample: "#ffffff" },
  { id: "dark-brand",        nome: "Dark Brand",         descricao: "Dark + Lime · OPE",             bgColor: "#0A0E1A",  accentSample: "#BFD64B" },
  { id: "thread",            nome: "Thread",             descricao: "Branco · estilo X/Twitter",     bgColor: "#ffffff",  accentSample: "#1DA1F2" },
];

// ─── Templates (inline styles para html-to-image) ────────────────────────────

function TemplateEditorial({ card, author, index, total }: { card: CardData; author: AuthorData; index: number; total: number }) {
  const accent = author.accentColor || "#E85D26";
  return (
    <div style={{ width: 1080, height: 1080, background: "#ffffff", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 60px 20px", borderBottom: "1px solid #e5e7eb" }}>
        <span style={{ fontSize: 18, color: "#9ca3af", letterSpacing: 2, fontWeight: 500 }}>Content Machine</span>
        <span style={{ fontSize: 18, color: "#9ca3af" }}>{author.handle}</span>
        <span style={{ fontSize: 18, color: "#9ca3af" }}>{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "50px 60px 40px" }}>
        {card.tag && (
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: "uppercase" }}>{card.tag}</span>
          </div>
        )}
        <h1 style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, color: "#111827", margin: "0 0 36px", letterSpacing: -1 }}>
          {card.headline || "Título do card"}
        </h1>
        {card.imageUrl && (
          <div style={{ flex: 1, marginBottom: 36, borderRadius: 20, overflow: "hidden", maxHeight: 380 }}>
            <img src={card.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        {card.body && (
          <p style={{ fontSize: 28, lineHeight: 1.6, color: "#374151", margin: 0 }}>{card.body}</p>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 60px 28px", borderTop: "1px solid #e5e7eb" }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{author.nome}</span>
        <span style={{ fontSize: 18, color: "#9ca3af", letterSpacing: 1 }}>
          {index + 1 < total ? "ARRASTE PARA O LADO →" : (card.cta || "GUARDA ESTE CONTEÚDO")}
        </span>
      </div>
    </div>
  );
}

function TemplateEditorialCompact({ card, author, index, total }: { card: CardData; author: AuthorData; index: number; total: number }) {
  const accent = author.accentColor || "#C2840A";
  return (
    <div style={{ width: 1080, height: 1080, background: "#F8F6F1", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 4, background: accent }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "60px 80px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <span style={{ fontSize: 20, color: "#9ca3af", fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 72, fontWeight: 800, color: "#111827", fontStyle: "italic", letterSpacing: -1 }}>{card.tag ? card.tag + " " : ""}</span>
          <span style={{ fontSize: 72, fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: -2 }}>{card.headline || "TÍTULO DO CARD"}</span>
        </div>
        {card.body && (
          <p style={{ fontSize: 32, lineHeight: 1.65, color: "#374151", marginBottom: 40 }}>{card.body}</p>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 20, color: "#9ca3af", fontStyle: "italic" }}>
            {index + 1 < total ? "ARRASTE PARA O LADO" : (card.cta || "GUARDA ESTE CONTEÚDO")}
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>{author.handle}</span>
        </div>
      </div>
    </div>
  );
}

function TemplateFotoTotal({ card, author, index, total }: { card: CardData; author: AuthorData; index: number; total: number }) {
  const accent = author.accentColor || "#BFD64B";
  return (
    <div style={{ width: 1080, height: 1080, background: "#0a0a0a", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", overflow: "hidden", position: "relative" }}>
      {card.imageUrl && (
        <img src={card.imageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.85) 100%)" }} />
      <div style={{ position: "absolute", top: 48, left: 56, zIndex: 10 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: 2, textTransform: "uppercase", background: "rgba(0,0,0,0.4)", padding: "8px 16px", borderRadius: 8 }}>
          {author.handle}
        </span>
      </div>
      {card.tag && (
        <div style={{ position: "absolute", top: 48, right: 56, zIndex: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: accent, background: "rgba(0,0,0,0.5)", border: `1px solid ${accent}`, padding: "8px 16px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 2 }}>
            {card.tag}
          </span>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "0 60px 60px" }}>
        <h1 style={{ fontSize: 88, fontWeight: 900, color: "#ffffff", lineHeight: 1.0, margin: "0 0 32px", letterSpacing: -2, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
          {card.headline || "TÍTULO DO CARD"}
        </h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {card.body && <p style={{ fontSize: 24, color: "rgba(255,255,255,0.85)", maxWidth: "70%", lineHeight: 1.5, margin: 0 }}>{card.body}</p>}
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", padding: "10px 20px", borderRadius: 30, letterSpacing: 2, whiteSpace: "nowrap" }}>
            {index + 1 < total ? "PASSE PARA O LADO »" : (card.cta || "GUARDA ESTE CONTEÚDO")}
          </span>
        </div>
      </div>
    </div>
  );
}

function TemplateFotoSplit({ card, author, index, total }: { card: CardData; author: AuthorData; index: number; total: number }) {
  const accent = author.accentColor || "#C9A84C";
  return (
    <div style={{ width: 1080, height: 1080, fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 560, background: "#1a1a2e", position: "relative", overflow: "hidden" }}>
        {card.imageUrl && (
          <img src={card.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", top: 32, left: 40 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.5)", padding: "6px 14px", borderRadius: 6, letterSpacing: 2 }}>{author.handle}</span>
        </div>
      </div>
      <div style={{ flex: 1, background: "#111827", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 60px" }}>
        {card.tag && (
          <p style={{ fontSize: 16, fontWeight: 700, color: accent, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 16px" }}>{card.tag}</p>
        )}
        <h2 style={{ fontSize: 52, fontWeight: 800, color: "#ffffff", lineHeight: 1.15, margin: "0 0 20px", letterSpacing: -1 }}>
          {card.headline || "Título do card"}
        </h2>
        {card.body && (
          <p style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: "0 0 24px" }}>{card.body}</p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>
            {index + 1 < total ? "ARRASTE PARA O LADO →" : (card.cta || "")}
          </span>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

function TemplateDarkMinimal({ card, author, index, total }: { card: CardData; author: AuthorData; index: number; total: number }) {
  return (
    <div style={{ width: 1080, height: 1080, background: "#000000", fontFamily: "'Georgia', 'Times New Roman', serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px", textAlign: "center", position: "relative" }}>
      <span style={{ position: "absolute", top: 50, right: 60, fontSize: 20, color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif" }}>{String(index + 1).padStart(2, "0")}</span>
      {card.tag && (
        <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 4, textTransform: "uppercase", fontFamily: "'Inter', sans-serif", margin: "0 0 40px" }}>{card.tag}</p>
      )}
      <h1 style={{ fontSize: 80, fontWeight: 700, color: "#ffffff", lineHeight: 1.15, margin: "0 0 48px", letterSpacing: -1 }}>
        {card.headline || "TEXTO PRINCIPAL"}
      </h1>
      {card.body && (
        <p style={{ fontSize: 30, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontWeight: 400, margin: 0 }}>
          {card.body}
        </p>
      )}
      <p style={{ position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center", fontSize: 18, color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif", letterSpacing: 3, textTransform: "uppercase" }}>
        {card.cta || (index + 1 < total ? "CONTINUA →" : author.handle)}
      </p>
    </div>
  );
}

function TemplateDarkBrand({ card, author, index, total }: { card: CardData; author: AuthorData; index: number; total: number }) {
  const accent = author.accentColor || "#BFD64B";
  return (
    <div style={{ width: 1080, height: 1080, background: "#0A0E1A", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", display: "flex", flexDirection: "column", padding: "60px 72px", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56 }}>
        {card.tag ? (
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 3, color: accent, background: `${accent}18`, border: `1px solid ${accent}44`, padding: "8px 18px", borderRadius: 40, textTransform: "uppercase" }}>
            {card.tag}
          </span>
        ) : <span />}
        <span style={{ fontSize: 18, color: "#4a5568" }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>
      <h1 style={{ fontSize: 76, fontWeight: 900, color: "#F0ECE4", lineHeight: 1.05, margin: "0 0 36px", letterSpacing: -2 }}>
        {card.headline || "Título do card"}
      </h1>
      <div style={{ width: 80, height: 4, background: accent, borderRadius: 2, marginBottom: 36 }} />
      {card.imageUrl && (
        <div style={{ flex: 1, borderRadius: 16, overflow: "hidden", marginBottom: 36, maxHeight: 380 }}>
          <img src={card.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      {card.body && (
        <p style={{ fontSize: 30, color: "#8892a4", lineHeight: 1.65, margin: "0 0 auto" }}>{card.body}</p>
      )}
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 40, borderTop: "1px solid #1a2035" }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: accent, letterSpacing: 1 }}>{author.handle}</span>
        <span style={{ fontSize: 16, color: "#4a5568", letterSpacing: 2 }}>
          {index + 1 < total ? "CONTINUA →" : (card.cta || "GUARDA ESTE CONTEÚDO")}
        </span>
      </div>
    </div>
  );
}

function TemplateThread({ card, author, index, total }: { card: CardData; author: AuthorData; index: number; total: number }) {
  return (
    <div style={{ width: 1080, height: 1080, background: "#ffffff", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", display: "flex", flexDirection: "column", padding: "72px 80px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 56 }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#e5e7eb", overflow: "hidden", flexShrink: 0 }}>
          {author.avatarUrl && <img src={author.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>{author.nome || "Nome"}</span>
            <span style={{ fontSize: 28 }}>✅</span>
          </div>
          <span style={{ fontSize: 24, color: "#9ca3af" }}>{author.handle || "@handle"}</span>
        </div>
      </div>
      {card.tag && (
        <p style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 32px", textTransform: "uppercase", letterSpacing: 1 }}>{card.tag}</p>
      )}
      <div style={{ flex: 1 }}>
        {card.headline && (
          <h2 style={{ fontSize: 52, fontWeight: 800, color: "#111827", lineHeight: 1.2, margin: "0 0 36px" }}>{card.headline}</h2>
        )}
        {card.imageUrl && (
          <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 36, maxHeight: 360 }}>
            <img src={card.imageUrl} alt="" style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}
        {card.body && (
          <p style={{ fontSize: 34, color: "#374151", lineHeight: 1.7, margin: 0 }}>{card.body}</p>
        )}
      </div>
      <div style={{ paddingTop: 40, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 20, color: "#d1d5db" }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <span style={{ fontSize: 20, color: "#9ca3af" }}>
          {card.cta || (index + 1 < total ? "CONTINUA ↓" : "SEGUE PARA MAIS")}
        </span>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsedToCardData(pc: ParsedCard): CardData {
  return {
    tag: pc.tipo === "cover" ? "" : pc.numero > 1 ? `${pc.numero - 1}` : "",
    headline: pc.titulo,
    body: pc.corpo,
    imageUrl: "",
    cta: pc.tipo === "cta" ? "GUARDA ESTE CONTEÚDO" : "",
  };
}

function renderCard(c: CardData, author: AuthorData, templateId: TemplateId, i: number, total: number) {
  const props = { card: c, author, index: i, total };
  switch (templateId) {
    case "editorial":         return <TemplateEditorial {...props} />;
    case "editorial-compact": return <TemplateEditorialCompact {...props} />;
    case "foto-total":        return <TemplateFotoTotal {...props} />;
    case "foto-split":        return <TemplateFotoSplit {...props} />;
    case "dark-minimal":      return <TemplateDarkMinimal {...props} />;
    case "dark-brand":        return <TemplateDarkBrand {...props} />;
    case "thread":            return <TemplateThread {...props} />;
  }
}

// ─── Miniatura de pré-visualização do estilo ─────────────────────────────────

function TemplateThumbnail({ tmpl }: { tmpl: TemplateInfo }) {
  const isLight = tmpl.bgColor === "#ffffff" || tmpl.bgColor === "#F8F6F1";
  const bar  = isLight ? "#e5e7eb" : "#ffffff22";
  const bar2 = isLight ? "#f3f4f6" : "#ffffff11";

  if (tmpl.id === "foto-split") {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, background: "#2a3555" }} />
        <div style={{ height: "40%", background: "#111827", padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
          <div style={{ height: 6, background: "#ffffff33", borderRadius: 2, width: "65%" }} />
          <div style={{ height: 4, background: "#ffffff15", borderRadius: 2, width: "85%" }} />
        </div>
      </div>
    );
  }

  if (tmpl.id === "thread") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#fff", padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#e5e7eb" }} />
          <div style={{ height: 5, background: "#d1d5db", borderRadius: 2, width: 50 }} />
        </div>
        <div style={{ height: 7, background: "#d1d5db", borderRadius: 2, marginBottom: 5, width: "85%" }} />
        <div style={{ height: 5, background: "#e5e7eb", borderRadius: 2, width: "70%" }} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", background: tmpl.bgColor, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 7, justifyContent: "center" }}>
      <div style={{ width: 28, height: 3, background: tmpl.accentSample, borderRadius: 2 }} />
      <div style={{ height: 12, background: bar, borderRadius: 3, width: "82%" }} />
      <div style={{ height: 6, background: bar2, borderRadius: 2, width: "90%" }} />
      <div style={{ height: 5, background: bar2, borderRadius: 2, width: "68%" }} />
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DesignEditor() {
  const { user } = useUser();
  const [initialized, setInitialized] = useState(false);

  // Wizard
  const [fase, setFase] = useState<"conteudo" | "estilo" | "marca" | "preview">("conteudo");

  // Conteúdo
  const [rawContent, setRawContent] = useState("");
  const [tema, setTema] = useState("");
  const [cards, setCards] = useState<CardData[]>([]);

  // Estilo
  const [templateId, setTemplateId] = useState<TemplateId>("dark-brand");

  // Marca
  const [author, setAuthor] = useState<AuthorData>({
    nome: "", handle: "@handle", avatarUrl: "", accentColor: "#BFD64B",
  });

  // Preview
  const [cardIdx, setCardIdx] = useState(0);

  // Export
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState<number | null>(null);
  const capturedRef = useRef<string[]>([]);
  const hiddenRef = useRef<HTMLDivElement>(null);

  // Inicializa a partir do Clerk (fila do calendário + marca guardada)
  useEffect(() => {
    if (!user || initialized) return;
    setInitialized(true);

    const queue = user.unsafeMetadata?.designQueue as { rawContent?: string; tema?: string } | undefined;
    const brand = user.unsafeMetadata?.brandSettings as { nome?: string; handle?: string; avatarUrl?: string; accentColor?: string } | undefined;

    if (brand) {
      setAuthor({
        nome: brand.nome || user.fullName || "",
        handle: brand.handle || "@handle",
        avatarUrl: brand.avatarUrl || "",
        accentColor: brand.accentColor || "#BFD64B",
      });
    } else if (user.fullName) {
      setAuthor(prev => ({ ...prev, nome: user.fullName || prev.nome }));
    }

    if (queue?.rawContent) {
      const parsed = parseCarouselCards(queue.rawContent);
      setCards(parsed.map(parsedToCardData));
      setRawContent(queue.rawContent);
      setTema(queue.tema ?? "");
      setFase("estilo");
    }
  }, [user, initialized]);

  // Fila de exportação: captura 1 card de cada vez
  useEffect(() => {
    if (exportStep === null) return;

    const timer = setTimeout(async () => {
      if (!hiddenRef.current) return;
      try {
        const png = await toPng(hiddenRef.current, { pixelRatio: 1, cacheBust: true });
        capturedRef.current[exportStep] = png;

        if (exportStep < cards.length - 1) {
          setExportStep(exportStep + 1);
        } else {
          const zip = new JSZip();
          capturedRef.current.forEach((p, i) => {
            zip.file(`card-${String(i + 1).padStart(2, "0")}.png`, p.split(",")[1], { base64: true });
          });
          const blob = await zip.generateAsync({ type: "blob" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `carrossel-${(tema || "cards").slice(0, 30).replace(/\s+/g, "-")}.zip`;
          a.click();
          URL.revokeObjectURL(url);
          capturedRef.current = [];
          setExportStep(null);
          setIsExporting(false);
        }
      } catch {
        setExportStep(null);
        setIsExporting(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [exportStep, cards.length, tema]);

  function handleParseContent() {
    if (!rawContent.trim()) return;
    const parsed = parseCarouselCards(rawContent);
    if (parsed.length === 0) return;
    setCards(parsed.map(parsedToCardData));
    setCardIdx(0);
    setFase("estilo");
  }

  async function handleSaveBrand() {
    if (user) {
      try {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            brandSettings: {
              nome: author.nome,
              handle: author.handle,
              avatarUrl: author.avatarUrl,
              accentColor: author.accentColor,
            },
          },
        });
      } catch { /* continua mesmo com erro */ }
    }
    setCardIdx(0);
    setFase("preview");
  }

  function startExport() {
    if (!cards.length || isExporting) return;
    capturedRef.current = new Array(cards.length);
    setIsExporting(true);
    setExportStep(0);
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAuthor(prev => ({ ...prev, avatarUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  const PREVIEW_W = 440;
  const scale = PREVIEW_W / 1080;
  const THUMB_W = 78;
  const scaleThumb = THUMB_W / 1080;

  const STEPS = ["Conteúdo", "Estilo", "Marca", "Preview"];
  const stepIdx = fase === "conteudo" ? 0 : fase === "estilo" ? 1 : fase === "marca" ? 2 : 3;

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#0A0E1A", color: "#F0ECE4" }}>

      {/* Elemento oculto para exportação (renderiza o card activo fora do ecrã) */}
      <div style={{ position: "fixed", left: -9999, top: -9999, zIndex: -1, width: 1080, height: 1080, overflow: "hidden" }}>
        <div ref={hiddenRef} style={{ width: 1080, height: 1080 }}>
          {exportStep !== null && cards[exportStep] &&
            renderCard(cards[exportStep], author, templateId, exportStep, cards.length)
          }
        </div>
      </div>

      {/* Barra de topo */}
      <div style={{ borderBottom: "1px solid #1a2035", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d1220" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/content" style={{ fontSize: 13, color: "#8892a4", textDecoration: "none" }}>← Conteúdo</a>
          <span style={{ color: "#1a2035" }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#F0ECE4" }}>
            {tema ? `${tema.slice(0, 45)}${tema.length > 45 ? "…" : ""}` : "Editor de Design"}
          </span>
        </div>
        {/* Indicador de passos */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20,
                background: i === stepIdx ? "#BFD64B" : i < stepIdx ? "#BFD64B22" : "#1a2035",
                color: i === stepIdx ? "#0A0E1A" : i < stepIdx ? "#BFD64B" : "#4a5568",
              }}>
                {i < stepIdx ? "✓ " : ""}{s}
              </span>
              {i < STEPS.length - 1 && <span style={{ color: "#2a3555", fontSize: 12 }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>

        {/* ── PASSO 0: CONTEÚDO (manual) ─────────────────────────────────────── */}
        {fase === "conteudo" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: "#BFD64B", background: "#BFD64B15", border: "1px solid #BFD64B33", padding: "4px 14px", borderRadius: 20 }}>
                PASSO 0 · CONTEÚDO
              </span>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: "16px 0 8px" }}>Cola o conteúdo da IA</h1>
              <p style={{ color: "#8892a4", fontSize: 14, margin: 0 }}>
                Copia o roteiro/copy gerado e cola aqui. Os cards são criados automaticamente.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#4a5568", display: "block", marginBottom: 8 }}>TÍTULO DO CARROSSEL (OPCIONAL)</label>
                <input
                  type="text"
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  placeholder="ex: 5 Razões Para Treinar Hoje"
                  style={{ width: "100%", background: "#111827", border: "1px solid #1a2035", borderRadius: 12, padding: "12px 16px", color: "#F0ECE4", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#4a5568", display: "block", marginBottom: 8 }}>CONTEÚDO (TEXTO DA IA)</label>
                <textarea
                  value={rawContent}
                  onChange={e => setRawContent(e.target.value)}
                  rows={16}
                  placeholder={"Exemplo:\n\nCARD 1 (GANCHO)\nJá tentaste mil dietas e nunca resultou? O problema não és tu.\n\nCARD 2 (PONTO 1)\nA dieta standard foi desenhada para falhar..."}
                  style={{ width: "100%", background: "#111827", border: "1px solid #1a2035", borderRadius: 12, padding: "16px", color: "#F0ECE4", fontSize: 13, lineHeight: 1.6, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "monospace" }}
                />
              </div>

              <button
                onClick={handleParseContent}
                disabled={!rawContent.trim()}
                style={{ background: rawContent.trim() ? "#BFD64B" : "#1a2035", color: rawContent.trim() ? "#0A0E1A" : "#4a5568", border: "none", borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 800, cursor: rawContent.trim() ? "pointer" : "not-allowed", transition: "all 0.15s" }}
              >
                Criar Cards Automaticamente →
              </button>
            </div>
          </div>
        )}

        {/* ── PASSO 1: ESTILO ────────────────────────────────────────────────── */}
        {fase === "estilo" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: "#BFD64B", background: "#BFD64B15", border: "1px solid #BFD64B33", padding: "4px 14px", borderRadius: 20 }}>
                PASSO 1 · {cards.length} CARDS PRONTOS
              </span>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: "16px 0 8px" }}>Escolhe o estilo</h1>
              <p style={{ color: "#8892a4", fontSize: 14, margin: 0 }}>
                Um clique — todos os {cards.length} cards usam este template.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14, marginBottom: 40 }}>
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  style={{
                    background: "#111827", border: templateId === t.id ? "2px solid #BFD64B" : "2px solid #1a2035",
                    borderRadius: 14, padding: 0, cursor: "pointer", overflow: "hidden", textAlign: "left",
                    transform: templateId === t.id ? "scale(1.02)" : "scale(1)", transition: "all 0.15s",
                  }}
                >
                  <div style={{ height: 120, background: t.bgColor, position: "relative", overflow: "hidden" }}>
                    <TemplateThumbnail tmpl={t} />
                    {templateId === t.id && (
                      <div style={{ position: "absolute", top: 8, right: 8, background: "#BFD64B", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#0A0E1A" }}>✓</div>
                    )}
                  </div>
                  <div style={{ padding: "10px 14px", background: templateId === t.id ? "#0d1a00" : "#0d1218" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: templateId === t.id ? "#BFD64B" : "#F0ECE4", margin: 0 }}>{t.nome}</p>
                    <p style={{ fontSize: 11, color: "#4a5568", margin: "3px 0 0" }}>{t.descricao}</p>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setFase("conteudo")}
                style={{ background: "none", border: "1px solid #1a2035", borderRadius: 10, padding: "12px 24px", color: "#8892a4", fontSize: 14, cursor: "pointer" }}
              >
                ← Alterar conteúdo
              </button>
              <button
                onClick={() => setFase("marca")}
                style={{ background: "#BFD64B", color: "#0A0E1A", border: "none", borderRadius: 10, padding: "12px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
              >
                Próximo: A tua Marca →
              </button>
            </div>
          </div>
        )}

        {/* ── PASSO 2: MARCA ─────────────────────────────────────────────────── */}
        {fase === "marca" && (
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: "#BFD64B", background: "#BFD64B15", border: "1px solid #BFD64B33", padding: "4px 14px", borderRadius: 20 }}>
                PASSO 2 · MARCA
              </span>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: "16px 0 8px" }}>A tua marca</h1>
              <p style={{ color: "#8892a4", fontSize: 14, margin: 0 }}>
                Guardado automaticamente. Nunca tens de preencher de novo.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#4a5568", display: "block", marginBottom: 8 }}>NOME</label>
                <input
                  type="text"
                  value={author.nome}
                  onChange={e => setAuthor(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Telmo Cerveira"
                  style={{ width: "100%", background: "#111827", border: "1px solid #1a2035", borderRadius: 12, padding: "14px 16px", color: "#F0ECE4", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#4a5568", display: "block", marginBottom: 8 }}>HANDLE</label>
                <input
                  type="text"
                  value={author.handle}
                  onChange={e => setAuthor(p => ({ ...p, handle: e.target.value }))}
                  placeholder="@coach_teo"
                  style={{ width: "100%", background: "#111827", border: "1px solid #1a2035", borderRadius: 12, padding: "14px 16px", color: "#F0ECE4", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#4a5568", display: "block", marginBottom: 12 }}>COR DE DESTAQUE</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["#BFD64B", "#E85D26", "#C9A84C", "#E91E8C", "#3B82F6", "#10B981", "#ffffff"].map(c => (
                    <button
                      key={c}
                      onClick={() => setAuthor(p => ({ ...p, accentColor: c }))}
                      style={{
                        width: 36, height: 36, borderRadius: "50%", background: c, cursor: "pointer",
                        border: author.accentColor === c ? "3px solid #fff" : "2px solid #2a3555",
                        transform: author.accentColor === c ? "scale(1.2)" : "scale(1)",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={author.accentColor}
                    onChange={e => setAuthor(p => ({ ...p, accentColor: e.target.value }))}
                    style={{ width: 36, height: 36, borderRadius: "50%", cursor: "pointer", border: "2px solid #2a3555", background: "transparent", padding: 2 }}
                    title="Cor personalizada"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#4a5568", display: "block", marginBottom: 8 }}>AVATAR (OPCIONAL · template Thread)</label>
                {author.avatarUrl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={author.avatarUrl} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
                    <button onClick={() => setAuthor(p => ({ ...p, avatarUrl: "" }))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13 }}>Remover</button>
                  </div>
                ) : (
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: 72, border: "2px dashed #1a2035", borderRadius: 12, cursor: "pointer" }}>
                    <span style={{ color: "#4a5568", fontSize: 13 }}>Carregar foto de perfil</span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                  </label>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button
                onClick={() => setFase("estilo")}
                style={{ flex: 1, background: "none", border: "1px solid #1a2035", borderRadius: 12, padding: "14px", color: "#8892a4", fontSize: 14, cursor: "pointer" }}
              >
                ← Voltar
              </button>
              <button
                onClick={handleSaveBrand}
                style={{ flex: 2, background: "#BFD64B", color: "#0A0E1A", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 800, cursor: "pointer" }}
              >
                ✨ Criar Carrossel →
              </button>
            </div>
          </div>
        )}

        {/* ── PASSO 3: PREVIEW + DOWNLOAD ────────────────────────────────────── */}
        {fase === "preview" && (
          <div>
            {/* Cabeçalho */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: "#BFD64B", marginBottom: 4 }}>
                  {cards.length} CARDS · {TEMPLATES.find(t => t.id === templateId)?.nome?.toUpperCase()}
                </div>
                {tema && <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#F0ECE4" }}>{tema}</h2>}
              </div>
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <button
                  onClick={() => setFase("estilo")}
                  style={{ background: "none", border: "1px solid #1a2035", borderRadius: 10, padding: "10px 16px", color: "#8892a4", fontSize: 13, cursor: "pointer" }}
                >
                  Alterar estilo
                </button>
                <button
                  onClick={startExport}
                  disabled={isExporting}
                  style={{
                    background: isExporting ? "#1a2035" : "#BFD64B",
                    color: isExporting ? "#4a5568" : "#0A0E1A",
                    border: "none", borderRadius: 10, padding: "10px 22px",
                    fontSize: 14, fontWeight: 800,
                    cursor: isExporting ? "not-allowed" : "pointer",
                    minWidth: 180, textAlign: "center",
                  }}
                >
                  {isExporting
                    ? `⏳ Card ${(exportStep ?? 0) + 1} / ${cards.length}…`
                    : `↓ Download ZIP (${cards.length} cards)`}
                </button>
              </div>
            </div>

            {/* Layout: preview principal + miniaturas */}
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

              {/* Preview principal */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: PREVIEW_W, height: PREVIEW_W, overflow: "hidden", borderRadius: 4, boxShadow: "0 20px 60px rgba(0,0,0,0.7)", flexShrink: 0 }}>
                  <div style={{ width: 1080, height: 1080, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                    {cards[cardIdx] && renderCard(cards[cardIdx], author, templateId, cardIdx, cards.length)}
                  </div>
                </div>

                {/* Navegação */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <button
                    onClick={() => setCardIdx(i => Math.max(0, i - 1))}
                    disabled={cardIdx === 0}
                    style={{ width: 36, height: 36, borderRadius: "50%", background: "#1a2035", color: "#8892a4", border: "none", cursor: cardIdx === 0 ? "not-allowed" : "pointer", opacity: cardIdx === 0 ? 0.3 : 1 }}
                  >←</button>
                  <span style={{ fontSize: 13, color: "#8892a4", minWidth: 60, textAlign: "center" }}>{cardIdx + 1} / {cards.length}</span>
                  <button
                    onClick={() => setCardIdx(i => Math.min(cards.length - 1, i + 1))}
                    disabled={cardIdx === cards.length - 1}
                    style={{ width: 36, height: 36, borderRadius: "50%", background: "#1a2035", color: "#8892a4", border: "none", cursor: cardIdx === cards.length - 1 ? "not-allowed" : "pointer", opacity: cardIdx === cards.length - 1 ? 0.3 : 1 }}
                  >→</button>
                </div>
              </div>

              {/* Coluna de miniaturas */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 560, overflowY: "auto" }}>
                {cards.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setCardIdx(i)}
                    style={{
                      width: THUMB_W, height: THUMB_W, borderRadius: 6, overflow: "hidden",
                      border: i === cardIdx ? "2px solid #BFD64B" : "2px solid #1a2035",
                      cursor: "pointer", position: "relative", flexShrink: 0, padding: 0, background: "none",
                    }}
                  >
                    <div style={{ width: 1080, height: 1080, transform: `scale(${scaleThumb})`, transformOrigin: "top left", pointerEvents: "none" }}>
                      {renderCard(c, author, templateId, i, cards.length)}
                    </div>
                    <div style={{ position: "absolute", bottom: 2, right: 3, fontSize: 9, fontWeight: 700, color: i === cardIdx ? "#BFD64B" : "rgba(255,255,255,0.4)" }}>
                      {i + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {isExporting && (
              <div style={{ marginTop: 20, background: "#111827", border: "1px solid #1a2035", borderRadius: 12, padding: "14px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 14, height: 14, border: "2px solid #BFD64B33", borderTop: "2px solid #BFD64B", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: 13, color: "#8892a4" }}>A exportar card {(exportStep ?? 0) + 1} de {cards.length}…</span>
                </div>
                <div style={{ background: "#1a2035", borderRadius: 20, height: 6, overflow: "hidden" }}>
                  <div style={{ background: "#BFD64B", height: "100%", borderRadius: 20, width: `${(((exportStep ?? 0) + 1) / cards.length) * 100}%`, transition: "width 0.3s" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
