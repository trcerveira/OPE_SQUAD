"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import SlidePreview from "./SlidePreview";
import UnsplashPicker from "./UnsplashPicker";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SlideData {
  textos: Record<number, string>; // texto 1-18
  imagens: Record<number, string>; // imagem01-09 (data URL or URL)
}

export interface Palette {
  id: string;
  nome: string;
  cores: [string, string, string]; // [fundo, destaque, texto]
  deletavel?: boolean;
}

interface DesignMachineProps {
  brandName?: string;
  brandColors?: [string, string, string] | null;
}

const PALETAS_BASE: Palette[] = [
  { id: "padrao",      nome: "Padrão",      cores: ["#F8FAFD", "#FF6A00", "#0F172A"] },
  { id: "corporativo", nome: "Corporativo", cores: ["#F4F5F7", "#0052CC", "#172B4D"] },
  { id: "natureza",    nome: "Natureza",    cores: ["#CEC5AD", "#A27B5C", "#2C4830"] },
  { id: "impacto",     nome: "Impacto",     cores: ["#F5F5F5", "#E63946", "#1E1E1E"] },
  { id: "dark",        nome: "Dark",        cores: ["#0B0F17", "#BFD64B", "#F0ECE4"] },
];

const PASSOS = ["Conteúdo", "Imagens", "Cores", "Exportar"];

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

// ── Main component ───────────────────────────────────────────────────────────

export default function DesignMachine({ brandName = "OPB CREW · POWERED BY IA", brandColors }: DesignMachineProps) {
  const [passo, setPasso] = useState(0);
  const [textoRaw, setTextoRaw] = useState("");
  const [textos, setTextos] = useState<Record<number, string>>({});
  const [imagens, setImagens] = useState<Record<number, string>>({});
  const [exportando, setExportando] = useState(false);
  const [progresso, setProgresso] = useState("");
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Custom palette state
  const [usarCustom, setUsarCustom] = useState(false);
  const [customCores, setCustomCores] = useState<[string, string, string]>(["#F8FAFD", "#FF6A00", "#0F172A"]);
  const [customErros, setCustomErros] = useState<[boolean, boolean, boolean]>([false, false, false]);

  // AI auto-generate state
  const [tema, setTema] = useState("");
  const [gerando, setGerando] = useState(false);
  const [erroGerar, setErroGerar] = useState("");

  // Zoom modal state
  const [zoomSlide, setZoomSlide] = useState<number | null>(null);

  // Build palette list with brand colors if available
  const allPaletas: Palette[] = brandColors
    ? [
        { id: "marca", nome: "Minha Marca", cores: brandColors },
        ...PALETAS_BASE,
      ]
    : PALETAS_BASE;

  // Default palette: brand colors if available, otherwise first base palette
  const [paleta, setPaleta] = useState<Palette>(allPaletas[0]);

  // ── Text parser ──────────────────────────────────────────────────────────

  const parseTextos = useCallback((raw: string) => {
    const mapa: Record<number, string> = {};
    const linhas = raw.split(/\r?\n/);
    for (const linha of linhas) {
      const m = linha.trim().match(/^texto\s*(\d+)\s*[-–]\s*(.+)$/i);
      if (m) mapa[parseInt(m[1])] = m[2].trim();
    }
    return mapa;
  }, []);

  const aplicarTextos = () => {
    const mapa = parseTextos(textoRaw);
    setTextos(mapa);
    if (Object.keys(mapa).length > 0) setPasso(1);
  };

  // ── AI auto-generate ─────────────────────────────────────────────────────

  const gerarComIA = async () => {
    if (!tema.trim() || gerando) return;
    setGerando(true);
    setErroGerar("");

    try {
      const res = await fetch("/api/generate-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: tema.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        setErroGerar(data.error || `Error ${res.status}`);
        setGerando(false);
        return;
      }

      const data = await res.json();
      const generatedTexts = data.textos as string;
      const keywords = data.keywords as string[];

      // Fill textarea + parse texts
      setTextoRaw(generatedTexts);
      const mapa = parseTextos(generatedTexts);
      setTextos(mapa);

      // Auto-search images with returned keywords
      if (keywords && keywords.length > 0) {
        autoFetchImages(keywords);
      }

      // Move to images step
      if (Object.keys(mapa).length > 0) setPasso(1);
    } catch {
      setErroGerar("Connection error. Check if the server is running.");
    }
    setGerando(false);
  };

  // Auto-fetch Unsplash images based on AI keywords
  const autoFetchImages = async (keywords: string[]) => {
    try {
      const query = keywords.slice(0, 5).join(" ");
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}&count=9`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        const autoImagens: Record<number, string> = {};
        data.photos.forEach((foto: { regular: string }, i: number) => {
          if (i < 9) autoImagens[i + 1] = foto.regular;
        });
        setImagens(autoImagens);
      }
    } catch {
      // Non-blocking — user can still add images manually
    }
  };

  // ── Custom palette ───────────────────────────────────────────────────────

  const atualizarCustomCor = (idx: 0 | 1 | 2, valor: string) => {
    const novasCores = [...customCores] as [string, string, string];
    novasCores[idx] = valor;
    setCustomCores(novasCores);

    const novosErros = [...customErros] as [boolean, boolean, boolean];
    novosErros[idx] = valor.length > 0 && !isValidHex(valor);
    setCustomErros(novosErros);

    if (usarCustom && isValidHex(valor)) {
      setPaleta({
        id: "custom",
        nome: "Personalizado",
        cores: novasCores,
      });
    }
  };

  const activarCustom = () => {
    setUsarCustom(true);
    if (customCores.every(c => isValidHex(c))) {
      setPaleta({ id: "custom", nome: "Personalizado", cores: customCores });
    }
  };

  const activarPaletaBase = (p: Palette) => {
    setUsarCustom(false);
    setPaleta(p);
  };

  // Effective palette (used in slides)
  const paletaEfectiva: Palette = usarCustom && customCores.every(c => isValidHex(c))
    ? { id: "custom", nome: "Personalizado", cores: customCores }
    : usarCustom ? paleta
    : paleta;

  // ── Export (pixelRatio 2 for professional quality) ────────────────────────

  const exportarZip = async () => {
    setExportando(true);
    const zip = new JSZip();
    for (let i = 0; i < 9; i++) {
      const el = slideRefs.current[i];
      if (!el) continue;
      setProgresso(`A exportar slide ${i + 1}/9…`);
      try {
        const png = await toPng(el, { pixelRatio: 2, cacheBust: true });
        const base64 = png.split(",")[1];
        zip.file(`${String(i + 1).padStart(2, "0")}_slide_${i + 1}.png`, base64, { base64: true });
      } catch (e) {
        console.error(`Erro slide ${i + 1}:`, e);
      }
    }
    setProgresso("A gerar ZIP…");
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "carrossel.zip";
    a.click();
    URL.revokeObjectURL(url);
    setProgresso("");
    setExportando(false);
  };

  // ── Close zoom on Escape key ─────────────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomSlide(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ── UI ─────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--text)" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--surface)", padding: "20px 24px" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
              Design Machine
            </h1>
            <p style={{ fontSize: 12, color: "#8892a4", margin: "4px 0 0" }}>
              Template Principal · 9 slides · 2160×2700px (retina)
            </p>
          </div>
          {/* Step bar */}
          <div className="flex items-center gap-2">
            {PASSOS.map((nome, i) => (
              <button
                key={i}
                onClick={() => i < passo || Object.keys(textos).length > 0 ? setPasso(i) : null}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: passo === i ? "var(--accent)" : "var(--surface)",
                  color: passo === i ? "var(--bg)" : "#8892a4",
                  transition: "all .2s",
                }}
              >
                {i + 1}. {nome}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── STEP 0: Content ─────────────────────────────────────────── */}
        {passo === 0 && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>

            {/* AI Auto-generate section */}
            <div style={{
              marginBottom: 24,
              padding: 20,
              borderRadius: 14,
              border: "2px solid var(--accent)",
              background: "rgba(191, 214, 75, 0.05)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>
                Gerar carrossel com IA
              </h2>
              <p style={{ fontSize: 13, color: "#8892a4", margin: "0 0 14px" }}>
                Escreve o tema e a IA gera os 18 textos + imagens automaticamente.
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && gerarComIA()}
                  placeholder="Ex: 5 erros que matam o teu negócio, Como ganhar os primeiros 1000 seguidores..."
                  disabled={gerando}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--surface)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  onClick={gerarComIA}
                  disabled={!tema.trim() || gerando}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    border: "none",
                    cursor: !tema.trim() || gerando ? "not-allowed" : "pointer",
                    backgroundColor: !tema.trim() || gerando ? "var(--surface)" : "var(--accent)",
                    color: !tema.trim() || gerando ? "#8892a4" : "var(--bg)",
                    minWidth: 160,
                    transition: "all .2s",
                  }}
                >
                  {gerando ? "A gerar..." : "Gerar com IA"}
                </button>
              </div>

              {gerando && (
                <div style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  backgroundColor: "rgba(191, 214, 75, 0.1)",
                  fontSize: 13,
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
                  A gerar 18 textos + imagens... (10-20 segundos)
                </div>
              )}

              {erroGerar && (
                <div style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  backgroundColor: "rgba(239,68,68,.1)",
                  color: "#fca5a5",
                  fontSize: 13,
                }}>
                  {erroGerar}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
              color: "#8892a4",
              fontSize: 12,
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--surface)" }} />
              <span>ou cola manualmente</span>
              <div style={{ flex: 1, height: 1, background: "var(--surface)" }} />
            </div>

            {/* Manual text input */}
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
                Cola o conteúdo gerado pela IA
              </h2>
              <p style={{ fontSize: 13, color: "#8892a4", margin: 0 }}>
                Formato: <code style={{ background: "var(--surface)", padding: "2px 6px", borderRadius: 4 }}>texto 1 - Título do cover</code>
              </p>
            </div>

            <textarea
              value={textoRaw}
              onChange={e => setTextoRaw(e.target.value)}
              placeholder={`texto 1 - Título principal do carrossel\ntexto 2 - Subtítulo ou tag line\ntexto 3 - Headline slide 2\ntexto 4 - Corpo do slide 2\n...\ntexto 18 - Texto do CTA final`}
              style={{
                width: "100%",
                minHeight: 240,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid var(--surface)",
                background: "var(--surface)",
                color: "var(--text)",
                fontSize: 13,
                fontFamily: "monospace",
                resize: "vertical",
                outline: "none",
              }}
            />

            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={aplicarTextos}
                disabled={!textoRaw.trim()}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  border: "none",
                  cursor: textoRaw.trim() ? "pointer" : "not-allowed",
                  backgroundColor: textoRaw.trim() ? "var(--accent)" : "var(--surface)",
                  color: textoRaw.trim() ? "var(--bg)" : "#8892a4",
                }}
              >
                Aplicar conteúdo
              </button>
              {Object.keys(textos).length > 0 && (
                <span style={{ fontSize: 12, color: "#4ade80" }}>
                  {Object.keys(textos).length} textos aplicados
                </span>
              )}
            </div>

            {/* Format guide */}
            <div style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 12,
              border: "1px solid var(--surface)",
              fontSize: 12,
              color: "#8892a4",
            }}>
              <p style={{ margin: "0 0 8px", fontWeight: 700, color: "var(--text)" }}>
                Estrutura do Template Principal (18 textos)
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                {[
                  "texto 1 — Tag/subtítulo do cover",
                  "texto 2 — Título principal (cover)",
                  "texto 3 — Headline slide 2",
                  "texto 4 — Corpo slide 2",
                  "texto 5 — Corpo slide 3 (§1)",
                  "texto 6 — Corpo slide 3 (§2)",
                  "texto 7 — Headline slide 4",
                  "texto 8 — Corpo slide 4",
                  "texto 9 — Corpo slide 5 (§1)",
                  "texto 10 — Corpo slide 5 (§2)",
                  "texto 11 — Headline slide 6",
                  "texto 12 — Corpo slide 6",
                  "texto 13 — Headline slide 7",
                  "texto 14 — Corpo slide 7",
                  "texto 15 — Corpo slide 8 (§1)",
                  "texto 16 — Corpo slide 8 (§2)",
                  "texto 17 — Corpo slide 8 (§3)",
                  "texto 18 — CTA / crédito final",
                ].map((item, i) => (
                  <div key={i} style={{ padding: "2px 0" }}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Images ──────────────────────────────────────────── */}
        {passo === 1 && (
          <UnsplashPicker
            imagens={imagens}
            onChange={setImagens}
            onNext={() => setPasso(2)}
          />
        )}

        {/* ── STEP 2: Colors ────────────────────────────────────────────── */}
        {passo === 2 && (
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>
              Escolhe a paleta de cores
            </h2>

            {/* Pre-defined palettes (includes brand if available) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {allPaletas.map(p => (
                <button
                  key={p.id}
                  onClick={() => activarPaletaBase(p)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${!usarCustom && paleta.id === p.id ? "var(--accent)" : "var(--surface)"}`,
                    background: !usarCustom && paleta.id === p.id ? "var(--surface)" : "transparent",
                    cursor: "pointer",
                    color: "var(--text)",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {p.id === "marca" ? "⭐ " : ""}{p.nome}
                  </span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {p.cores.map((cor, i) => (
                      <div
                        key={i}
                        title={cor}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          backgroundColor: cor,
                          border: "1px solid rgba(255,255,255,.15)",
                        }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom palette */}
            <div style={{
              padding: 16,
              borderRadius: 12,
              border: `2px solid ${usarCustom ? "var(--accent)" : "var(--surface)"}`,
              background: usarCustom ? "var(--surface)" : "transparent",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Personalizado</span>
                <button
                  onClick={activarCustom}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: usarCustom ? "var(--accent)" : "rgba(255,255,255,.1)",
                    color: usarCustom ? "var(--bg)" : "var(--text)",
                  }}
                >
                  {usarCustom ? "Activa" : "Usar esta"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {(["Fundo", "Destaque", "Texto"] as const).map((label, idx) => (
                  <div key={idx}>
                    <p style={{ fontSize: 11, color: "#8892a4", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                      {label}
                    </p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{
                        width: 32, height: 32,
                        borderRadius: 8,
                        backgroundColor: isValidHex(customCores[idx]) ? customCores[idx] : "#444",
                        border: "1px solid rgba(255,255,255,.15)",
                        flexShrink: 0,
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}>
                        <input
                          type="color"
                          value={isValidHex(customCores[idx]) ? customCores[idx] : "#888888"}
                          onChange={e => {
                            atualizarCustomCor(idx as 0 | 1 | 2, e.target.value);
                            if (usarCustom) activarCustom();
                          }}
                          style={{
                            position: "absolute", inset: 0,
                            opacity: 0,
                            cursor: "pointer",
                            width: "100%", height: "100%",
                          }}
                        />
                      </div>
                      <input
                        value={customCores[idx]}
                        onChange={e => {
                          atualizarCustomCor(idx as 0 | 1 | 2, e.target.value);
                          if (usarCustom) activarCustom();
                        }}
                        placeholder="#000000"
                        maxLength={7}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: `1px solid ${customErros[idx] ? "#ef4444" : "var(--surface)"}`,
                          background: "var(--bg)",
                          color: "var(--text)",
                          fontSize: 13,
                          fontFamily: "monospace",
                          outline: "none",
                        }}
                      />
                    </div>
                    {customErros[idx] && (
                      <p style={{ fontSize: 10, color: "#f87171", margin: "4px 0 0" }}>
                        Formato inválido (use #RRGGBB)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setPasso(3)}
              style={{
                marginTop: 20,
                padding: "10px 24px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                backgroundColor: "var(--accent)",
                color: "var(--bg)",
              }}
            >
              Ver preview
            </button>
          </div>
        )}

        {/* ── STEP 3: Preview + Export ─────────────────────────────────── */}
        {passo === 3 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Preview do carrossel</h2>
                <p style={{ fontSize: 12, color: "#8892a4", margin: 0 }}>
                  Paleta: <span style={{ color: "var(--text)", fontWeight: 600 }}>{paletaEfectiva.nome}</span>
                  {" · "}
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        width: 10, height: 10,
                        borderRadius: "50%",
                        backgroundColor: paletaEfectiva.cores[i],
                        border: "1px solid rgba(255,255,255,.2)",
                        marginLeft: 4,
                        verticalAlign: "middle",
                      }}
                    />
                  ))}
                  {" · "}
                  <span style={{ color: "#8892a4" }}>Clica num slide para ampliar</span>
                </p>
              </div>
              <button
                onClick={exportarZip}
                disabled={exportando}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  border: "none",
                  cursor: exportando ? "not-allowed" : "pointer",
                  backgroundColor: exportando ? "var(--surface)" : "var(--accent)",
                  color: exportando ? "#8892a4" : "var(--bg)",
                }}
              >
                {exportando ? progresso || "A exportar…" : "Exportar ZIP (2x)"}
              </button>
            </div>

            {/* Slide thumbnail grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}>
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={i}
                  style={{ position: "relative", cursor: "pointer" }}
                  onClick={() => setZoomSlide(i)}
                >
                  <div style={{
                    fontSize: 10,
                    color: "#8892a4",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}>
                    Slide {String(i + 1).padStart(2, "0")}
                  </div>
                  {/* Scaled wrapper for preview */}
                  <div style={{
                    width: "100%",
                    aspectRatio: "1080/1350",
                    overflow: "hidden",
                    borderRadius: 10,
                    border: "1px solid var(--surface)",
                    transition: "border-color .2s, transform .2s",
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "var(--surface)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <div style={{
                      transform: "scale(0.185)",
                      transformOrigin: "top left",
                      width: 1080,
                      height: 1350,
                    }}>
                      <SlidePreview
                        ref={(el) => { slideRefs.current[i] = el; }}
                        slideIndex={i}
                        textos={textos}
                        imagens={imagens}
                        paleta={paletaEfectiva}
                        brandName={brandName}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Zoom Modal ──────────────────────────────────────────────────── */}
      {zoomSlide !== null && (
        <div
          onClick={() => setZoomSlide(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setZoomSlide(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}
          >
            ✕
          </button>

          {/* Navigation: Previous */}
          {zoomSlide > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setZoomSlide(zoomSlide - 1); }}
              style={{
                position: "absolute",
                left: 20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 24,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
              }}
            >
              ‹
            </button>
          )}

          {/* Navigation: Next */}
          {zoomSlide < 8 && (
            <button
              onClick={e => { e.stopPropagation(); setZoomSlide(zoomSlide + 1); }}
              style={{
                position: "absolute",
                right: 20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 24,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
              }}
            >
              ›
            </button>
          )}

          {/* Slide label */}
          <div style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            zIndex: 10000,
          }}>
            Slide {String(zoomSlide + 1).padStart(2, "0")} / 09
          </div>

          {/* Full-size slide */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxHeight: "calc(100vh - 80px)",
              maxWidth: "calc(100vw - 80px)",
              overflow: "hidden",
              borderRadius: 12,
            }}
          >
            <div style={{
              width: 1080,
              height: 1350,
              transform: "scale(0.55)",
              transformOrigin: "center center",
            }}>
              <SlidePreview
                slideIndex={zoomSlide}
                textos={textos}
                imagens={imagens}
                paleta={paletaEfectiva}
                brandName={brandName}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
