"use client";

import { useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import * as htmlToImage from "html-to-image";

// ── Paletas de cores (2 OPE Brand + 8 Premium do agente premium-design.md) ───

const PALETTES = [
  // OPE Brand
  { id: "ope-dark",   grp: "OPE",     label: "OPE Dark",        bg: "#0A0E1A", text: "#F0ECE4", accent: "#BFD64B", sub: "#8892a4" },
  { id: "ope-light",  grp: "OPE",     label: "OPE Light",       bg: "#F0ECE4", text: "#0A0E1A", accent: "#0A0E1A", sub: "#4a5568" },
  // 8 Premium
  { id: "nocturne",   grp: "Premium", label: "Nocturne Cian",   bg: "#071111", text: "#E8F4F4", accent: "#7DE8EB", sub: "#8BAAAA" },
  { id: "obsidian",   grp: "Premium", label: "Obsidian Gold",   bg: "#0A0A0A", text: "#FAF5EB", accent: "#D4A853", sub: "#C4B99A" },
  { id: "carbon",     grp: "Premium", label: "Carbon Blue",     bg: "#0B1120", text: "#F1F5F9", accent: "#3B82F6", sub: "#94A3B8" },
  { id: "midnight",   grp: "Premium", label: "Midnight Violet", bg: "#0D0B1A", text: "#F5F0FF", accent: "#A855F7", sub: "#B8A8D4" },
  { id: "eclipse",    grp: "Premium", label: "Eclipse Rose",    bg: "#120B0D", text: "#FFF1F2", accent: "#F43F5E", sub: "#D4A8B0" },
  { id: "emerald",    grp: "Premium", label: "Stealth Emerald", bg: "#071210", text: "#F0FDF9", accent: "#10B981", sub: "#A8D4C4" },
  { id: "crimson",    grp: "Premium", label: "Crimson Noir",    bg: "#120A0A", text: "#FFF5F5", accent: "#EF4444", sub: "#D4A8A8" },
  { id: "arctic",     grp: "Premium", label: "Arctic Frost",    bg: "#0A1018", text: "#F0F9FF", accent: "#38BDF8", sub: "#A8C8E0" },
] as const;

type Palette = typeof PALETTES[number];
type PaletteId = Palette["id"];

// ── Formatos com dimensões oficiais por plataforma ────────────────────────────

const FORMATS = [
  { id: "post",      platform: "Instagram", label: "Post",      icon: "📸", w: 1080, h: 1080, layout: "square"   },
  { id: "reels",     platform: "Instagram", label: "Reels",     icon: "🎬", w: 1080, h: 1920, layout: "vertical" },
  { id: "story",     platform: "Instagram", label: "Story",     icon: "📱", w: 1080, h: 1920, layout: "vertical" },
  { id: "carousel",  platform: "Instagram", label: "Carrossel", icon: "🎠", w: 1080, h: 1080, layout: "square"   },
  { id: "linkedin",  platform: "LinkedIn",  label: "LinkedIn",  icon: "💼", w: 1200, h: 628,  layout: "wide"     },
  { id: "twitter",   platform: "Twitter/X", label: "X/Twitter", icon: "𝕏",  w: 1200, h: 675,  layout: "wide"     },
] as const;

type FormatId = typeof FORMATS[number]["id"];
type Layout = "square" | "vertical" | "wide";

// Largura máxima do preview em px para cada tipo de layout
const PREVIEW_W: Record<Layout, number> = { square: 330, vertical: 210, wide: 370 };

// ── Canvas: Post / Carrossel (1080×1080) ─────────────────────────────────────

function SquareCanvas({ pal, headline, body, handle, isCarousel }: {
  pal: Palette; headline: string; body: string; handle: string; isCarousel?: boolean;
}) {
  const fs = headline.length > 130 ? 44 : headline.length > 90 ? 54 : headline.length > 55 ? 64 : 74;
  const bodyText = body.length > 320 ? body.slice(0, 320) + "…" : body;

  return (
    <div style={{
      width: 1080, height: 1080,
      background: pal.bg,
      position: "relative",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "80px 88px",
      boxSizing: "border-box",
      fontFamily: "system-ui, -apple-system, Helvetica Neue, Arial, sans-serif",
      overflow: "hidden",
    }}>
      {/* Barra accent no topo */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: pal.accent }} />

      {/* Glow ambiental */}
      <div style={{
        position: "absolute", top: "15%", left: "5%", right: "5%", height: "65%",
        background: `radial-gradient(ellipse 70% 55% at 50% 45%, ${pal.accent}22 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Headline */}
      <div style={{
        color: pal.text, fontSize: fs, fontWeight: 800,
        lineHeight: 1.18, textAlign: "center",
        letterSpacing: "-0.025em",
        wordBreak: "break-word", overflowWrap: "break-word",
        maxWidth: "100%",
        marginBottom: bodyText ? 44 : 0,
        zIndex: 1,
      }}>
        {headline || "Headline do post"}
      </div>

      {/* Separador */}
      {bodyText && (
        <div style={{ width: 56, height: 5, background: pal.accent, borderRadius: 3, marginBottom: 36, zIndex: 1 }} />
      )}

      {/* Corpo */}
      {bodyText && (
        <div style={{
          color: pal.sub, fontSize: 30, lineHeight: 1.65,
          textAlign: "center", whiteSpace: "pre-line",
          wordBreak: "break-word", maxWidth: "100%", zIndex: 1,
        }}>
          {bodyText}
        </div>
      )}

      {/* Handle */}
      <div style={{
        position: "absolute", bottom: 44, right: 60,
        color: pal.accent, fontSize: 22, fontWeight: 700,
        letterSpacing: "0.06em", zIndex: 1,
      }}>
        {handle}
      </div>

      {/* Indicador de carrossel */}
      {isCarousel && (
        <div style={{
          position: "absolute", bottom: 50, left: 60,
          display: "flex", gap: 10, alignItems: "center",
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: i === 0 ? 28 : 10, height: 10, borderRadius: 5,
              background: i === 0 ? pal.accent : `${pal.accent}50`,
            }} />
          ))}
        </div>
      )}

      {/* Glow canto inferior esquerdo */}
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        width: 220, height: 220,
        background: `radial-gradient(circle at 0% 100%, ${pal.accent}20, transparent 65%)`,
      }} />
    </div>
  );
}

// ── Canvas: Story / Reels (1080×1920) ────────────────────────────────────────

function VerticalCanvas({ pal, headline, body, handle, isReels }: {
  pal: Palette; headline: string; body: string; handle: string; isReels?: boolean;
}) {
  const fs = headline.length > 130 ? 52 : headline.length > 90 ? 64 : headline.length > 55 ? 76 : 88;
  const bodyText = body.length > 500 ? body.slice(0, 500) + "…" : body;

  return (
    <div style={{
      width: 1080, height: 1920,
      background: pal.bg,
      position: "relative",
      fontFamily: "system-ui, -apple-system, Helvetica Neue, Arial, sans-serif",
      overflow: "hidden",
    }}>
      {/* Barra accent no topo */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: pal.accent }} />

      {/* Gradient escuro em baixo (estilo overlay de vídeo para Reels) */}
      {isReels && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "65%",
          background: `linear-gradient(to top, ${pal.bg}FF 0%, ${pal.bg}CC 40%, transparent 100%)`,
        }} />
      )}

      {/* Glow ambiental */}
      <div style={{
        position: "absolute",
        top: isReels ? "42%" : "18%",
        left: "5%", right: "5%", height: "55%",
        background: `radial-gradient(ellipse 75% 55% at 50% 45%, ${pal.accent}18 0%, transparent 70%)`,
      }} />

      {/* Conteúdo */}
      <div style={{
        position: "absolute",
        top: isReels ? undefined : "22%",
        bottom: isReels ? "200px" : undefined,
        left: 80, right: 80,
      }}>
        {/* Handle como eyebrow (apenas no modo Story) */}
        {!isReels && (
          <div style={{
            color: pal.accent, fontSize: 26, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: 32,
          }}>
            {handle}
          </div>
        )}

        {/* Headline */}
        <div style={{
          color: pal.text, fontSize: fs, fontWeight: 800,
          lineHeight: 1.12, letterSpacing: "-0.03em",
          wordBreak: "break-word", overflowWrap: "break-word",
          marginBottom: bodyText ? 52 : 0,
        }}>
          {headline || "Headline do post"}
        </div>

        {/* Separador */}
        {bodyText && (
          <div style={{ width: 60, height: 5, background: pal.accent, borderRadius: 3, marginBottom: 40 }} />
        )}

        {/* Corpo */}
        {bodyText && (
          <div style={{
            color: pal.sub, fontSize: 34, lineHeight: 1.65,
            whiteSpace: "pre-line", wordBreak: "break-word",
          }}>
            {bodyText}
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div style={{
        position: "absolute", bottom: 72, left: 80, right: 80,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ color: pal.accent, fontSize: 26, fontWeight: 700, letterSpacing: "0.08em" }}>
          {handle}
        </div>
        {isReels && (
          <div style={{ color: pal.text, fontSize: 22, letterSpacing: "0.12em", opacity: 0.5 }}>
            SWIPE ▶
          </div>
        )}
      </div>
    </div>
  );
}

// ── Canvas: LinkedIn / Twitter (1200×628 ou 1200×675) ────────────────────────

function WideCanvas({ pal, headline, body, handle, platform }: {
  pal: Palette; headline: string; body: string; handle: string; platform: string;
}) {
  const fs = headline.length > 100 ? 50 : headline.length > 65 ? 60 : headline.length > 40 ? 70 : 78;
  const bodyText = body.length > 260 ? body.slice(0, 260) + "…" : body;

  return (
    <div style={{
      width: 1200, height: 628,
      background: pal.bg,
      position: "relative",
      display: "flex", alignItems: "center",
      padding: "0 88px",
      gap: bodyText ? 72 : 0,
      boxSizing: "border-box",
      fontFamily: "system-ui, -apple-system, Helvetica Neue, Arial, sans-serif",
      overflow: "hidden",
    }}>
      {/* Barra accent no topo */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: pal.accent }} />

      {/* Glow canto direito */}
      <div style={{
        position: "absolute", right: 0, bottom: 0,
        width: 500, height: 500,
        background: `radial-gradient(circle at 100% 100%, ${pal.accent}18, transparent 65%)`,
      }} />

      {/* Coluna esquerda — headline */}
      <div style={{ flex: bodyText ? "1.2" : "1" }}>
        <div style={{
          color: pal.accent, fontSize: 20, fontWeight: 600,
          letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24,
        }}>
          {platform === "LinkedIn" ? "💼" : "𝕏"} {handle}
        </div>
        <div style={{
          color: pal.text, fontSize: fs, fontWeight: 800,
          lineHeight: 1.12, letterSpacing: "-0.03em",
          wordBreak: "break-word", overflowWrap: "break-word",
        }}>
          {headline || "Headline do post"}
        </div>
      </div>

      {/* Divisor vertical */}
      {bodyText && (
        <div style={{ width: 4, height: "56%", background: pal.accent, borderRadius: 2, opacity: 0.5, flexShrink: 0 }} />
      )}

      {/* Coluna direita — corpo */}
      {bodyText && (
        <div style={{ flex: 1 }}>
          <div style={{ color: pal.sub, fontSize: 28, lineHeight: 1.65, whiteSpace: "pre-line", wordBreak: "break-word" }}>
            {bodyText}
          </div>
        </div>
      )}

      {/* Handle rodapé */}
      <div style={{
        position: "absolute", bottom: 30, right: 60,
        color: pal.accent, fontSize: 20, fontWeight: 700,
        letterSpacing: "0.06em", opacity: 0.7,
      }}>
        {handle}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface ContentDesignerProps {
  content: string;
  platform: string;
  niche?: string;
}

export default function ContentDesigner({ content, platform, niche: nicheProp }: ContentDesignerProps) {
  const { user } = useUser();
  const niche = nicheProp || (user?.unsafeMetadata?.niche as string) || "";

  // Extrai headline e corpo do conteúdo gerado
  const lines = content.split("\n").filter((l) => l.trim());
  const rawHeadline = lines[0]?.replace(/^[#*\-]+\s*/, "").trim() ?? "";
  const rawBody = lines
    .slice(1)
    .filter((l) => l.trim() && !l.startsWith("#"))
    .slice(0, 8)
    .join("\n");

  const [isOpen, setIsOpen] = useState(false);
  const [paletteId, setPaletteId] = useState<PaletteId>("ope-dark");
  const [formatId, setFormatId] = useState<FormatId>(() => {
    if (platform === "linkedin") return "linkedin";
    if (platform === "twitter") return "twitter";
    if (platform === "reels") return "reels";
    return "post";
  });
  const [headline, setHeadline] = useState(rawHeadline);
  const [body, setBody] = useState(rawBody);
  const [handle, setHandle] = useState("@opesquad");

  // Criador de legenda
  const [caption, setCaption] = useState("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);

  // Exportar
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const pal = (PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0]) as Palette;
  const fmt = FORMATS.find((f) => f.id === formatId) ?? FORMATS[0];
  const layout = fmt.layout as Layout;
  const previewW = PREVIEW_W[layout];
  const scale = previewW / fmt.w;
  const previewH = Math.round(fmt.h * scale);

  // Exporta PNG em resolução real (cancela o scale do preview durante a captura)
  async function handleExport() {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: 1,
        cacheBust: true,
        style: { transform: "none" }, // remove o scale visual durante a captura
      });
      const link = document.createElement("a");
      link.download = `${fmt.platform.toLowerCase()}-${fmt.id}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error("Erro ao exportar:", err);
    } finally {
      setIsExporting(false);
    }
  }

  // Gera legenda com IA
  async function handleGenerateCaption() {
    setIsGeneratingCaption(true);
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, body, platform: fmt.platform, niche }),
      });
      const data = await res.json();
      if (data.caption) setCaption(data.caption);
    } catch (err) {
      console.error("Erro ao gerar legenda:", err);
    } finally {
      setIsGeneratingCaption(false);
    }
  }

  async function copyCaption() {
    if (!caption) return;
    await navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    setTimeout(() => setCaptionCopied(false), 2500);
  }

  const charLimit = fmt.platform === "Twitter/X" ? 280 : fmt.platform === "Instagram" ? 2200 : 3000;

  // Botão fechado
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm border border-[#BFD64B]/40 text-[#BFD64B] rounded-lg px-4 py-2.5 hover:bg-[#BFD64B]/10 transition-all"
      >
        🎨 Criar design para publicar
      </button>
    );
  }

  return (
    <div className="mt-6 bg-[#0d1420] border border-[#2a3555] rounded-xl overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2035]">
        <div className="flex items-center gap-2">
          <span>🎨</span>
          <span className="text-[#F0ECE4] font-bold text-sm">Criar Design</span>
          <span className="text-[#4a5568] text-xs hidden sm:block">
            — exporta PNG {fmt.w}×{fmt.h}px pronto a publicar
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[#4a5568] hover:text-[#8892a4] transition-colors text-sm px-2"
        >
          ✕
        </button>
      </div>

      <div className="p-5 space-y-6">

        {/* ── FORMATO ── */}
        <div>
          <div className="text-[#4a5568] text-[10px] font-bold tracking-widest mb-3">FORMATO</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormatId(f.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border text-xs transition-all ${
                  formatId === f.id
                    ? "border-[#BFD64B] bg-[#BFD64B]/10 text-[#BFD64B]"
                    : "border-[#2a3555] text-[#8892a4] hover:border-[#BFD64B]/40"
                }`}
              >
                <span className="text-base">{f.icon}</span>
                <span className="font-medium">{f.label}</span>
                <span className="opacity-60" style={{ fontSize: 9 }}>{f.platform}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── PALETA DE CORES ── */}
        <div>
          <div className="text-[#4a5568] text-[10px] font-bold tracking-widest mb-3">PALETA DE CORES</div>

          {/* OPE Brand */}
          <div className="mb-3">
            <div className="text-[#4a5568] text-[9px] tracking-widest uppercase mb-2">OPE Brand</div>
            <div className="flex gap-2 flex-wrap">
              {PALETTES.filter((p) => p.grp === "OPE").map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPaletteId(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    paletteId === p.id ? "border-[#BFD64B]" : "border-[#2a3555]"
                  }`}
                  style={{ background: p.bg }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: p.accent, flexShrink: 0 }} />
                  <span style={{ color: p.text, fontWeight: paletteId === p.id ? 700 : 400 }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Premium Dark */}
          <div>
            <div className="text-[#4a5568] text-[9px] tracking-widest uppercase mb-2">Premium Dark</div>
            <div className="flex gap-2 flex-wrap">
              {PALETTES.filter((p) => p.grp === "Premium").map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPaletteId(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    paletteId === p.id ? "border-[#BFD64B]" : "border-[#2a3555]"
                  }`}
                  style={{ background: p.bg }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: p.accent, flexShrink: 0 }} />
                  <span style={{ color: p.text, fontWeight: paletteId === p.id ? 700 : 400 }}>
                    {p.label.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTEÚDO + PREVIEW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Controlos de texto */}
          <div className="space-y-4">
            <div>
              <div className="text-[#4a5568] text-[10px] font-bold tracking-widest mb-2">HEADLINE</div>
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                rows={3}
                className="w-full bg-[#111827] border border-[#2a3555] rounded-lg px-3 py-2.5 text-[#F0ECE4] text-sm focus:outline-none focus:border-[#BFD64B] resize-none transition-colors"
              />
            </div>

            <div>
              <div className="text-[#4a5568] text-[10px] font-bold tracking-widest mb-2">
                TEXTO SECUNDÁRIO <span className="opacity-50">(opcional)</span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Deixa vazio para só o headline"
                className="w-full bg-[#111827] border border-[#2a3555] rounded-lg px-3 py-2.5 text-[#F0ECE4] text-sm focus:outline-none focus:border-[#BFD64B] resize-none placeholder-[#4a5568] transition-colors"
              />
            </div>

            <div>
              <div className="text-[#4a5568] text-[10px] font-bold tracking-widest mb-2">HANDLE / MARCA</div>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-[#111827] border border-[#2a3555] rounded-lg px-3 py-2 text-[#F0ECE4] text-sm focus:outline-none focus:border-[#BFD64B] transition-colors"
              />
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-[#BFD64B] text-[#0A0E1A] font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A0E1A] border-t-transparent rounded-full animate-spin" />
                  A exportar...
                </>
              ) : exported ? (
                "✓ Descarregado!"
              ) : (
                `⬇ PNG ${fmt.w}×${fmt.h}px`
              )}
            </button>

            <p className="text-[#4a5568] text-[10px] text-center">
              {fmt.icon} {fmt.platform} {fmt.label} · {fmt.w}×{fmt.h}px oficial
            </p>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-[#4a5568] text-[10px] font-bold tracking-widest self-start sm:self-center">
              PRÉ-VISUALIZAÇÃO
            </div>

            {/* Wrapper que define o tamanho visual do preview */}
            <div style={{
              width: previewW,
              height: previewH,
              overflow: "hidden",
              borderRadius: 8,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              flexShrink: 0,
            }}>
              {/* Canvas em resolução real — escalado visualmente via CSS transform */}
              <div
                ref={canvasRef}
                style={{
                  width: fmt.w,
                  height: fmt.h,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                {layout === "square" && (
                  <SquareCanvas
                    pal={pal} headline={headline} body={body}
                    handle={handle} isCarousel={formatId === "carousel"}
                  />
                )}
                {layout === "vertical" && (
                  <VerticalCanvas
                    pal={pal} headline={headline} body={body}
                    handle={handle} isReels={formatId === "reels"}
                  />
                )}
                {layout === "wide" && (
                  <WideCanvas
                    pal={pal} headline={headline} body={body}
                    handle={handle} platform={fmt.platform}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── CRIADOR DE LEGENDA ── */}
        <div className="border-t border-[#1a2035] pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#4a5568] text-[10px] font-bold tracking-widest">✍️ CRIADOR DE LEGENDA</div>
            <button
              onClick={handleGenerateCaption}
              disabled={isGeneratingCaption || !headline}
              className="flex items-center gap-1.5 text-xs border border-[#BFD64B]/40 text-[#BFD64B] rounded-lg px-3 py-1.5 hover:bg-[#BFD64B]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isGeneratingCaption ? (
                <>
                  <div className="w-3 h-3 border border-[#BFD64B] border-t-transparent rounded-full animate-spin" />
                  A gerar...
                </>
              ) : (
                "✨ Gerar com IA"
              )}
            </button>
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={6}
            placeholder={`Escreve a tua legenda aqui ou clica em "Gerar com IA"...\n\nDica: a legenda é o texto que acompanha a imagem quando publicas.`}
            className="w-full bg-[#111827] border border-[#2a3555] rounded-lg px-3 py-3 text-[#F0ECE4] text-sm focus:outline-none focus:border-[#BFD64B] resize-none placeholder-[#4a5568] transition-colors"
          />

          <div className="flex items-center justify-between mt-2">
            <span className={`text-[10px] ${caption.length > charLimit ? "text-red-400" : "text-[#4a5568]"}`}>
              {caption.length} / {charLimit} chars · {fmt.platform}
            </span>
            <button
              onClick={copyCaption}
              disabled={!caption}
              className="flex items-center gap-1.5 text-xs border border-[#2a3555] text-[#8892a4] rounded-lg px-3 py-1.5 hover:border-[#BFD64B]/40 hover:text-[#BFD64B] disabled:opacity-30 transition-all"
            >
              {captionCopied ? "✓ Copiado!" : "📋 Copiar"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
