"use client";

import { useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { toPng } from "html-to-image";

// ─── Tipos ───────────────────────────────────────────────────────────────────

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
  textColor: string;
  estilo: string;
}

// ─── Templates disponíveis ───────────────────────────────────────────────────

const TEMPLATES: TemplateInfo[] = [
  { id: "editorial",         nome: "Editorial",          descricao: "Branco · foto + texto",        bgColor: "#ffffff", textColor: "#111", estilo: "A" },
  { id: "editorial-compact", nome: "Editorial Compacto", descricao: "Branco · copy densa",           bgColor: "#F8F6F1", textColor: "#111", estilo: "A" },
  { id: "foto-total",        nome: "Foto Total",         descricao: "Foto fullscreen · overlay",    bgColor: "#1a1a2e", textColor: "#fff", estilo: "B" },
  { id: "foto-split",        nome: "Foto Split",         descricao: "Foto em cima · bloco em baixo", bgColor: "#111",   textColor: "#fff", estilo: "B" },
  { id: "dark-minimal",      nome: "Dark Minimal",       descricao: "Preto · texto centrado",        bgColor: "#000000", textColor: "#fff", estilo: "C" },
  { id: "dark-brand",        nome: "Dark Brand",         descricao: "Dark + Lime · marca",           bgColor: "#0A0E1A", textColor: "#fff", estilo: "C" },
  { id: "thread",            nome: "Thread",             descricao: "Branco · estilo Twitter",       bgColor: "#ffffff", textColor: "#111", estilo: "D" },
];

const CARD_VAZIO: CardData = {
  tag: "", headline: "", body: "", imageUrl: "", cta: "",
};

// ─── Render dos templates (1080×1080 inline styles para export) ──────────────

function TemplateEditorial({ card, author, index, total }: { card: CardData; author: AuthorData; index: number; total: number }) {
  const accent = author.accentColor || "#E85D26";
  return (
    <div style={{ width: 1080, height: 1080, background: "#ffffff", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", display: "flex", flexDirection: "column", padding: "0", overflow: "hidden", position: "relative" }}>
      {/* Barra de topo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 60px 20px", borderBottom: "1px solid #e5e7eb" }}>
        <span style={{ fontSize: 18, color: "#9ca3af", letterSpacing: 2, fontWeight: 500 }}>Powered by Content Machine</span>
        <span style={{ fontSize: 18, color: "#9ca3af", letterSpacing: 1 }}>{author.handle}</span>
        <span style={{ fontSize: 18, color: "#9ca3af" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "50px 60px 40px" }}>
        {/* Tag */}
        {card.tag && (
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: "uppercase" }}>{card.tag}</span>
          </div>
        )}

        {/* Headline */}
        <h1 style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, color: "#111827", margin: "0 0 36px", letterSpacing: -1 }}>
          {card.headline || "Título do card"}
        </h1>

        {/* Imagem */}
        {card.imageUrl && (
          <div style={{ flex: 1, marginBottom: 36, borderRadius: 20, overflow: "hidden", maxHeight: 380 }}>
            <img src={card.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Body */}
        {card.body && (
          <p style={{ fontSize: 28, lineHeight: 1.6, color: "#374151", margin: card.imageUrl ? "0" : "0 0 auto" }}>
            {card.body}
          </p>
        )}
      </div>

      {/* Rodapé */}
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
    <div style={{ width: 1080, height: 1080, background: "#F8F6F1", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
      {/* Linha de topo */}
      <div style={{ height: 4, background: accent }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "60px 80px" }}>
        {/* Número */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <span style={{ fontSize: 20, color: "#9ca3af", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{String(index + 1).padStart(2, "0")}</span>
        </div>

        {/* Headline mista — itálico + bold como no exemplo */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 72, fontWeight: 800, color: "#111827", fontStyle: "italic", letterSpacing: -1 }}>{card.tag ? card.tag + " " : ""}</span>
          <span style={{ fontSize: 72, fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: -2 }}>{card.headline || "TÍTULO DO CARD"}</span>
        </div>

        {/* Corpo */}
        {card.body && (
          <p style={{ fontSize: 32, lineHeight: 1.65, color: "#374151", marginBottom: 40 }}>
            {card.body.split("**").map((part, i) =>
              i % 2 === 0
                ? <span key={i}>{part}</span>
                : <strong key={i} style={{ color: "#111" }}>{part}</strong>
            )}
          </p>
        )}

        <div style={{ flex: 1 }} />

        {/* Rodapé */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 20, color: "#9ca3af", fontStyle: "italic" }}>{card.cta || (index + 1 < total ? "ARRASTE PARA O LADO" : "GUARDA ESTE CONTEÚDO")}</span>
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
      {/* Imagem de fundo */}
      {card.imageUrl && (
        <img src={card.imageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}

      {/* Gradiente overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.85) 100%)" }} />

      {/* Logo / handle topo esquerdo */}
      <div style={{ position: "absolute", top: 48, left: 56, zIndex: 10 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: 2, textTransform: "uppercase", background: "rgba(0,0,0,0.4)", padding: "8px 16px", borderRadius: 8 }}>
          {author.handle}
        </span>
      </div>

      {/* Tag topo direito */}
      {card.tag && (
        <div style={{ position: "absolute", top: 48, right: 56, zIndex: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: accent, background: "rgba(0,0,0,0.5)", border: `1px solid ${accent}`, padding: "8px 16px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 2 }}>
            {card.tag}
          </span>
        </div>
      )}

      {/* Texto em baixo */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "0 60px 60px" }}>
        <h1 style={{ fontSize: 88, fontWeight: 900, color: "#ffffff", lineHeight: 1.0, margin: "0 0 32px", letterSpacing: -2, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
          {card.headline || "TÍTULO DO\nCARD"}
        </h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {card.body && <p style={{ fontSize: 24, color: "rgba(255,255,255,0.85)", maxWidth: "70%", lineHeight: 1.5, margin: 0 }}>{card.body}</p>}
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", padding: "10px 20px", borderRadius: 30, letterSpacing: 2, backdropFilter: "blur(4px)", whiteSpace: "nowrap" }}>
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
      {/* Metade superior — foto */}
      <div style={{ height: 560, background: "#1a1a2e", position: "relative", overflow: "hidden" }}>
        {card.imageUrl && (
          <img src={card.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        {/* Logo */}
        <div style={{ position: "absolute", top: 32, left: 40 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.5)", padding: "6px 14px", borderRadius: 6, letterSpacing: 2 }}>{author.handle}</span>
        </div>
      </div>

      {/* Metade inferior — bloco de texto */}
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
  const accent = author.accentColor || "#ffffff";
  return (
    <div style={{ width: 1080, height: 1080, background: "#000000", fontFamily: "'Georgia', 'Times New Roman', serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px", textAlign: "center", position: "relative" }}>
      {/* Número canto */}
      <span style={{ position: "absolute", top: 50, right: 60, fontSize: 20, color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif" }}>{String(index + 1).padStart(2, "0")}</span>

      {/* Tag */}
      {card.tag && (
        <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 4, textTransform: "uppercase", fontFamily: "'Inter', sans-serif", margin: "0 0 40px" }}>{card.tag}</p>
      )}

      {/* Headline grande centrada */}
      {card.imageUrl ? (
        <div style={{ background: "#111", borderRadius: 24, overflow: "hidden", width: "100%", marginBottom: 48, maxHeight: 360 }}>
          <img src={card.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {/* Texto dentro da caixa escura */}
          <div style={{ padding: "32px 40px", textAlign: "left" }}>
            <p style={{ fontSize: 36, fontWeight: 700, color: accent, letterSpacing: 3, textTransform: "uppercase", margin: 0, fontFamily: "'Inter', sans-serif", textAlign: "center" }}>
              {card.headline || "TEXTO PRINCIPAL"}
            </p>
          </div>
        </div>
      ) : (
        <h1 style={{ fontSize: 80, fontWeight: 700, color: "#ffffff", lineHeight: 1.15, margin: "0 0 48px", letterSpacing: -1 }}>
          {card.headline || "TEXTO PRINCIPAL"}
        </h1>
      )}

      {card.body && (
        <p style={{ fontSize: 30, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontWeight: 400, margin: 0 }}>
          {card.body}
        </p>
      )}

      {/* Handle em baixo */}
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
      {/* Topo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56 }}>
        {card.tag ? (
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 3, color: accent, background: `${accent}18`, border: `1px solid ${accent}44`, padding: "8px 18px", borderRadius: 40, textTransform: "uppercase" }}>
            {card.tag}
          </span>
        ) : <span />}
        <span style={{ fontSize: 18, color: "#4a5568" }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>

      {/* Headline */}
      <h1 style={{ fontSize: 76, fontWeight: 900, color: "#F0ECE4", lineHeight: 1.05, margin: "0 0 36px", letterSpacing: -2 }}>
        {card.headline || "Título do card"}
      </h1>

      {/* Divider lime */}
      <div style={{ width: 80, height: 4, background: accent, borderRadius: 2, marginBottom: 36 }} />

      {/* Imagem */}
      {card.imageUrl && (
        <div style={{ flex: 1, borderRadius: 16, overflow: "hidden", marginBottom: 36, maxHeight: 380 }}>
          <img src={card.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* Body */}
      {card.body && (
        <p style={{ fontSize: 30, color: "#8892a4", lineHeight: 1.65, margin: "0 0 auto" }}>
          {card.body}
        </p>
      )}

      <div style={{ flex: 1 }} />

      {/* Rodapé */}
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
      {/* Avatar + nome + handle */}
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

      {/* Titulo bold */}
      {card.tag && (
        <p style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 32px", textTransform: "uppercase", letterSpacing: 1 }}>{card.tag}</p>
      )}

      {/* Corpo principal */}
      <div style={{ flex: 1 }}>
        {card.headline && (
          <h2 style={{ fontSize: 52, fontWeight: 800, color: "#111827", lineHeight: 1.2, margin: "0 0 36px" }}>
            {card.headline}
          </h2>
        )}
        {card.imageUrl && (
          <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 36, maxHeight: 360 }}>
            <img src={card.imageUrl} alt="" style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}
        {card.body && (
          <p style={{ fontSize: 34, color: "#374151", lineHeight: 1.7, margin: 0 }}>
            {card.body}
          </p>
        )}
      </div>

      {/* Rodapé */}
      <div style={{ paddingTop: 40, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 20, color: "#d1d5db" }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <span style={{ fontSize: 20, color: "#9ca3af" }}>
          {card.cta || (index + 1 < total ? "CONTINUA ↓" : "SEGUE PARA MAIS")}
        </span>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DesignEditor() {
  const { user } = useUser();

  // Estado
  const [templateId, setTemplateId] = useState<TemplateId>("editorial");
  const [cards, setCards] = useState<CardData[]>([{ ...CARD_VAZIO }]);
  const [cardIdx, setCardIdx] = useState(0);
  const [author, setAuthor] = useState<AuthorData>({
    nome: "",
    handle: "@handle",
    avatarUrl: "",
    accentColor: "#BFD64B",
  });
  const [exporting, setExporting] = useState(false);
  const [exportAll, setExportAll] = useState(false);
  const [tab, setTab] = useState<"template" | "card" | "autor">("template");

  const previewRef = useRef<HTMLDivElement>(null);

  // Pré-preenche dados do Clerk se disponíveis
  const clerkNome = (user?.fullName ?? user?.firstName ?? "");
  if (author.nome === "" && clerkNome) {
    setAuthor(prev => ({ ...prev, nome: clerkNome }));
  }

  const card = cards[cardIdx] ?? CARD_VAZIO;
  const tmpl = TEMPLATES.find(t => t.id === templateId)!;

  function updateCard(field: keyof CardData, value: string) {
    setCards(prev => prev.map((c, i) => i === cardIdx ? { ...c, [field]: value } : c));
  }

  function addCard() {
    setCards(prev => [...prev, { ...CARD_VAZIO }]);
    setCardIdx(cards.length);
  }

  function removeCard(idx: number) {
    if (cards.length <= 1) return;
    setCards(prev => prev.filter((_, i) => i !== idx));
    setCardIdx(Math.max(0, idx - 1));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateCard("imageUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAuthor(prev => ({ ...prev, avatarUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  async function downloadCard(idx: number) {
    if (!previewRef.current) return;
    const el = previewRef.current.querySelector("[data-card-render]") as HTMLElement;
    if (!el) return;
    setExporting(true);
    try {
      const png = await toPng(el, { pixelRatio: 1, cacheBust: true });
      const a = document.createElement("a");
      a.href = png;
      a.download = `card-${String(idx + 1).padStart(2, "0")}.png`;
      a.click();
    } catch {}
    setExporting(false);
  }

  async function downloadTodos() {
    setExportAll(true);
    for (let i = 0; i < cards.length; i++) {
      setCardIdx(i);
      await new Promise(r => setTimeout(r, 400));
      await downloadCard(i);
      await new Promise(r => setTimeout(r, 200));
    }
    setExportAll(false);
  }

  function renderCard(c: CardData, i: number) {
    const props = { card: c, author, index: i, total: cards.length };
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

  // Escala do preview: 1080px → fit na área disponível (~500px)
  const PREVIEW_SIZE = 500;
  const scale = PREVIEW_SIZE / 1080;

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 56px)", background: "#0A0E1A" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "#1a2035", background: "#0d1220" }}>
        <div className="flex items-center gap-4">
          <a href="/content" className="text-sm text-[#8892a4] hover:text-[#F0ECE4] transition-colors">← Conteúdo</a>
          <span className="text-[#1a2035]">|</span>
          <span className="text-[#F0ECE4] font-bold text-sm">Editor de Design</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#BFD64B22", color: "#BFD64B", border: "1px solid #BFD64B44" }}>
            {tmpl.nome}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadTodos}
            disabled={exporting || exportAll}
            className="text-xs font-bold px-4 py-2 rounded-lg border transition-all disabled:opacity-50"
            style={{ borderColor: "#2a3555", color: "#8892a4" }}
          >
            {exportAll ? "A exportar..." : `↓ Todos (${cards.length})`}
          </button>
          <button
            onClick={() => downloadCard(cardIdx)}
            disabled={exporting || exportAll}
            className="text-xs font-bold px-5 py-2 rounded-lg transition-all disabled:opacity-50"
            style={{ background: "#BFD64B", color: "#0A0E1A" }}
          >
            {exporting ? "A exportar..." : "↓ Download PNG"}
          </button>
        </div>
      </div>

      <div className="flex flex-1">

        {/* ─── Painel esquerdo ──────────────────────────── */}
        <div className="flex flex-col border-r" style={{ width: 320, minWidth: 320, borderColor: "#1a2035", background: "#0d1220", overflowY: "auto" }}>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: "#1a2035" }}>
            {(["template", "card", "autor"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-3 text-xs font-bold transition-all"
                style={tab === t
                  ? { color: "#BFD64B", borderBottom: "2px solid #BFD64B" }
                  : { color: "#4a5568" }
                }
              >
                {t === "template" ? "ESTILO" : t === "card" ? "CARD" : "AUTOR"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">

            {/* ─── Tab: Estilo ─── */}
            {tab === "template" && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold tracking-widest text-[#4a5568] mb-3">ESCOLHE O ESTILO</p>
                {["A", "B", "C", "D"].map(grupo => (
                  <div key={grupo} className="mb-4">
                    <p className="text-[10px] text-[#4a5568] mb-2 font-bold tracking-widest">
                      {grupo === "A" ? "— EDITORIAL" : grupo === "B" ? "— FOTO" : grupo === "C" ? "— DARK" : "— THREAD"}
                    </p>
                    {TEMPLATES.filter(t => t.estilo === grupo).map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTemplateId(t.id)}
                        className="w-full mb-2 flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                        style={templateId === t.id
                          ? { background: "#BFD64B15", border: "1px solid #BFD64B44" }
                          : { background: "#111827", border: "1px solid #1a2035" }
                        }
                      >
                        {/* Mini preview */}
                        <div className="w-12 h-12 rounded-lg flex-shrink-0" style={{ background: t.bgColor, border: "1px solid #2a3555" }}>
                          <div style={{ height: "30%", background: `${t.bgColor === "#ffffff" || t.bgColor === "#F8F6F1" ? "#e5e7eb" : "rgba(255,255,255,0.1)"}`, margin: "6px 6px 3px", borderRadius: 3 }} />
                          <div style={{ height: "20%", background: `${t.bgColor === "#ffffff" || t.bgColor === "#F8F6F1" ? "#d1d5db" : "rgba(255,255,255,0.07)"}`, margin: "0 6px", borderRadius: 3 }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold" style={{ color: templateId === t.id ? "#BFD64B" : "#F0ECE4" }}>{t.nome}</p>
                          <p className="text-[10px]" style={{ color: "#4a5568" }}>{t.descricao}</p>
                        </div>
                        {templateId === t.id && <span className="ml-auto text-[#BFD64B] text-sm">✓</span>}
                      </button>
                    ))}
                  </div>
                ))}

                {/* Cor de destaque */}
                <div className="pt-4 border-t" style={{ borderColor: "#1a2035" }}>
                  <p className="text-[10px] font-bold tracking-widest text-[#4a5568] mb-3">COR DE DESTAQUE</p>
                  <div className="flex gap-2 flex-wrap">
                    {["#BFD64B", "#E85D26", "#C9A84C", "#E91E8C", "#3B82F6", "#10B981", "#ffffff"].map(c => (
                      <button
                        key={c}
                        onClick={() => setAuthor(prev => ({ ...prev, accentColor: c }))}
                        className="w-8 h-8 rounded-full transition-all"
                        style={{
                          background: c,
                          border: author.accentColor === c ? `3px solid #fff` : "2px solid #2a3555",
                          transform: author.accentColor === c ? "scale(1.2)" : "scale(1)",
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={author.accentColor}
                      onChange={e => setAuthor(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-8 h-8 rounded-full cursor-pointer border-2 p-0.5"
                      style={{ borderColor: "#2a3555", background: "transparent" }}
                      title="Cor personalizada"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Tab: Card ─── */}
            {tab === "card" && (
              <div className="space-y-4">
                {/* Navegação de cards */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold tracking-widest text-[#4a5568]">CARD {cardIdx + 1} DE {cards.length}</p>
                  <button onClick={addCard} className="text-xs font-bold text-[#BFD64B] hover:opacity-80">+ Novo card</button>
                </div>

                {/* Lista de cards */}
                <div className="flex gap-2 flex-wrap mb-3">
                  {cards.map((_, i) => (
                    <div key={i} className="relative">
                      <button
                        onClick={() => setCardIdx(i)}
                        className="w-9 h-9 rounded-lg text-xs font-bold transition-all"
                        style={cardIdx === i
                          ? { background: "#BFD64B", color: "#0A0E1A" }
                          : { background: "#1a2035", color: "#8892a4" }
                        }
                      >{i + 1}</button>
                      {cards.length > 1 && (
                        <button
                          onClick={() => removeCard(i)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500/70 text-white text-[9px] flex items-center justify-center hover:bg-red-500"
                        >✕</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Campos do card */}
                {[
                  { field: "tag" as keyof CardData,      label: "Tag / Categoria",     placeholder: "ex: COPYWRITING COM IA", rows: 1 },
                  { field: "headline" as keyof CardData,  label: "Título / Headline",    placeholder: "O título principal do card", rows: 3 },
                  { field: "body" as keyof CardData,      label: "Corpo do texto",       placeholder: "Texto de desenvolvimento...", rows: 5 },
                  { field: "cta" as keyof CardData,       label: "CTA (último card)",    placeholder: "ex: GUARDA ESTE CONTEÚDO", rows: 1 },
                ].map(({ field, label, placeholder, rows }) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold tracking-widest text-[#4a5568] mb-1.5">{label.toUpperCase()}</label>
                    <textarea
                      rows={rows}
                      value={card[field]}
                      onChange={e => updateCard(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-[#111827] border border-[#1a2035] rounded-lg px-3 py-2 text-[#F0ECE4] text-xs focus:border-[#BFD64B]/50 focus:outline-none resize-none"
                    />
                  </div>
                ))}

                {/* Upload de imagem */}
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-[#4a5568] mb-1.5">FOTO / IMAGEM</label>
                  {card.imageUrl ? (
                    <div className="relative">
                      <img src={card.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        onClick={() => updateCard("imageUrl", "")}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black"
                      >✕</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-[#BFD64B]/40" style={{ borderColor: "#1a2035" }}>
                      <span className="text-[#4a5568] text-xs">Clica para carregar</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                  <div className="mt-2">
                    <input
                      type="text"
                      value={card.imageUrl.startsWith("data:") ? "" : card.imageUrl}
                      onChange={e => updateCard("imageUrl", e.target.value)}
                      placeholder="Ou cola um URL de imagem"
                      className="w-full bg-[#111827] border border-[#1a2035] rounded-lg px-3 py-2 text-[#F0ECE4] text-xs focus:border-[#BFD64B]/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Tab: Autor ─── */}
            {tab === "autor" && (
              <div className="space-y-4">
                <p className="text-[10px] font-bold tracking-widest text-[#4a5568] mb-3">DADOS DO AUTOR / MARCA</p>
                {[
                  { field: "nome",   label: "Nome",   placeholder: "Telmo Cerveira" },
                  { field: "handle", label: "Handle", placeholder: "@coach_teo" },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold tracking-widest text-[#4a5568] mb-1.5">{label.toUpperCase()}</label>
                    <input
                      type="text"
                      value={author[field as keyof AuthorData] as string}
                      onChange={e => setAuthor(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-[#111827] border border-[#1a2035] rounded-lg px-3 py-2 text-[#F0ECE4] text-xs focus:border-[#BFD64B]/50 focus:outline-none"
                    />
                  </div>
                ))}

                {/* Avatar */}
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-[#4a5568] mb-1.5">AVATAR</label>
                  {author.avatarUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={author.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
                      <button onClick={() => setAuthor(prev => ({ ...prev, avatarUrl: "" }))} className="text-xs text-red-400 hover:text-red-300">Remover</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-[#BFD64B]/40" style={{ borderColor: "#1a2035" }}>
                      <span className="text-[#4a5568] text-xs">Carregar avatar</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Área de preview ──────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">

          {/* Preview escalado */}
          <div
            ref={previewRef}
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, position: "relative", flexShrink: 0 }}
          >
            {/* Sombra + canvas */}
            <div style={{ width: 1080, height: 1080, transform: `scale(${scale})`, transformOrigin: "top left", borderRadius: 0, boxShadow: "0 25px 80px rgba(0,0,0,0.6)" }} data-card-render>
              {renderCard(cards[cardIdx], cardIdx)}
            </div>
          </div>

          {/* Navegação entre cards */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCardIdx(i => Math.max(0, i - 1))}
              disabled={cardIdx === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: "#1a2035", color: "#8892a4" }}
            >←</button>

            <div className="flex gap-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCardIdx(i)}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={i === cardIdx ? { background: "#BFD64B" } : { background: "#1a2035" }}
                />
              ))}
            </div>

            <button
              onClick={() => setCardIdx(i => Math.min(cards.length - 1, i + 1))}
              disabled={cardIdx === cards.length - 1}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: "#1a2035", color: "#8892a4" }}
            >→</button>
          </div>

          <p className="text-[#4a5568] text-xs">
            Card {cardIdx + 1} de {cards.length} · 1080 × 1080 px · <span className="text-[#BFD64B]">{tmpl.nome}</span>
          </p>
        </div>

      </div>
    </div>
  );
}
