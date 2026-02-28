"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import SlidePreview from "./SlidePreview";
import UnsplashPicker from "./UnsplashPicker";

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface SlideData {
  textos: Record<number, string>; // texto 1-18
  imagens: Record<number, string>; // imagem01-09 (data URL ou URL)
}

export interface Palette {
  id: string;
  nome: string;
  cores: [string, string, string]; // [fundo, destaque, texto]
  deletavel?: boolean;
}

const PALETAS_BASE: Palette[] = [
  { id: "padrao",      nome: "Padrão",      cores: ["#F8FAFD", "#FF6A00", "#0F172A"] },
  { id: "corporativo", nome: "Corporativo", cores: ["#F4F5F7", "#0052CC", "#172B4D"] },
  { id: "natureza",    nome: "Natureza",    cores: ["#CEC5AD", "#A27B5C", "#2C4830"] },
  { id: "impacto",     nome: "Impacto",     cores: ["#F5F5F5", "#E63946", "#1E1E1E"] },
  { id: "dark",        nome: "Dark",        cores: ["#0B0F17", "#BFD64B", "#F0ECE4"] },
];

const PASSOS = ["Conteúdo", "Imagens", "Cores", "Exportar"];

// ── Componente principal ─────────────────────────────────────────────────────

export default function DesignMachine() {
  const [passo, setPasso] = useState(0);
  const [textoRaw, setTextoRaw] = useState("");
  const [textos, setTextos] = useState<Record<number, string>>({});
  const [imagens, setImagens] = useState<Record<number, string>>({});
  const [paleta, setPaleta] = useState<Palette>(PALETAS_BASE[0]);
  const [exportando, setExportando] = useState(false);
  const [progresso, setProgresso] = useState("");
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── Parser de texto ────────────────────────────────────────────────────────

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

  // ── Export ─────────────────────────────────────────────────────────────────

  const exportarZip = async () => {
    setExportando(true);
    const zip = new JSZip();
    for (let i = 0; i < 9; i++) {
      const el = slideRefs.current[i];
      if (!el) continue;
      setProgresso(`A exportar slide ${i + 1}/9…`);
      try {
        const png = await toPng(el, { pixelRatio: 1, cacheBust: true });
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

  // ── UI ─────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--text)" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--surface)", padding: "20px 24px" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
              ⚙️ Design Machine
            </h1>
            <p style={{ fontSize: 12, color: "#8892a4", margin: "4px 0 0" }}>
              Template Principal · 9 slides · 1080×1350px
            </p>
          </div>
          {/* Barra de passos */}
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

        {/* ── PASSO 0: Conteúdo ─────────────────────────────────────────── */}
        {passo === 0 && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>
                Cole o conteúdo gerado pela IA
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
                minHeight: 300,
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
                Aplicar conteúdo →
              </button>
              {Object.keys(textos).length > 0 && (
                <span style={{ fontSize: 12, color: "#4ade80" }}>
                  ✓ {Object.keys(textos).length} textos aplicados
                </span>
              )}
            </div>

            {/* Guia de formato */}
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

        {/* ── PASSO 1: Imagens ──────────────────────────────────────────── */}
        {passo === 1 && (
          <UnsplashPicker
            imagens={imagens}
            onChange={setImagens}
            onNext={() => setPasso(2)}
          />
        )}

        {/* ── PASSO 2: Cores ────────────────────────────────────────────── */}
        {passo === 2 && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>
              Escolhe a paleta de cores
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PALETAS_BASE.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPaleta(p)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px solid ${paleta.id === p.id ? "var(--accent)" : "var(--surface)"}`,
                    background: paleta.id === p.id ? "var(--surface)" : "transparent",
                    cursor: "pointer",
                    color: "var(--text)",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.nome}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {p.cores.map((cor, i) => (
                      <div
                        key={i}
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
              Ver preview →
            </button>
          </div>
        )}

        {/* ── PASSO 3: Preview + Export ─────────────────────────────────── */}
        {passo === 3 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Preview do carrossel</h2>
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
                {exportando ? progresso || "A exportar…" : "⬇ Exportar ZIP"}
              </button>
            </div>

            {/* Grid de slides em miniatura */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <div style={{
                    fontSize: 10,
                    color: "#8892a4",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}>
                    Slide {String(i + 1).padStart(2, "0")}
                  </div>
                  {/* Wrapper escalado para preview */}
                  <div style={{
                    width: "100%",
                    aspectRatio: "1080/1350",
                    overflow: "hidden",
                    borderRadius: 10,
                    border: "1px solid var(--surface)",
                  }}>
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
                        paleta={paleta}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
