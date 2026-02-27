"use client";

import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

const templates = [
  { id: "dark",  label: "Dark",  bg: "#0A0E1A", text: "#F0ECE4", accent: "#BFD64B", sub: "#8892a4" },
  { id: "lime",  label: "Lime",  bg: "#BFD64B", text: "#0A0E1A", accent: "#0A0E1A", sub: "#2a3555" },
  { id: "white", label: "White", bg: "#F0ECE4", text: "#0A0E1A", accent: "#BFD64B", sub: "#4a5568" },
];

const formats = [
  { id: "square", label: "📸 Post",  w: 1080, h: 1080, preview: 360 },
  { id: "story",  label: "📱 Story", w: 1080, h: 1920, preview: 320 },
  { id: "wide",   label: "🖥️ LinkedIn", w: 1200, h: 628, preview: 360 },
];

interface ContentDesignerProps {
  content: string;
  platform: string;
}

export default function ContentDesigner({ content, platform }: ContentDesignerProps) {
  // Extrai a primeira linha como headline e as seguintes como corpo
  const lines = content.split("\n").filter((l) => l.trim());
  const defaultHeadline = lines[0] ?? "";
  const defaultBody = lines.slice(1, 5).join("\n");

  const [isOpen, setIsOpen]             = useState(false);
  const [selectedTemplate, setTemplate] = useState("dark");
  const [selectedFormat, setFormat]     = useState("square");
  const [headline, setHeadline]         = useState(defaultHeadline);
  const [body, setBody]                 = useState(defaultBody);
  const [isExporting, setIsExporting]   = useState(false);
  const [exported, setExported]         = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const tpl    = templates.find((t) => t.id === selectedTemplate) ?? templates[0];
  const fmt    = formats.find((f) => f.id === selectedFormat)     ?? formats[0];
  const ratio  = fmt.h / fmt.w;
  const pw     = fmt.preview;
  const ph     = Math.round(pw * ratio);

  async function handleExport() {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: fmt.w / pw, // exporta em resolução real (1080px)
        cacheBust: true,
      });
      const link     = document.createElement("a");
      link.download  = `post-${platform}-${Date.now()}.png`;
      link.href      = dataUrl;
      link.click();
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error("Erro ao exportar:", err);
    } finally {
      setIsExporting(false);
    }
  }

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

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2035]">
        <div className="flex items-center gap-2">
          <span>🎨</span>
          <span className="text-[#F0ECE4] font-bold text-sm">Criar Design</span>
          <span className="text-[#4a5568] text-xs hidden sm:block">— exporta como PNG pronto a publicar</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[#4a5568] hover:text-[#8892a4] transition-colors text-sm px-2"
        >
          ✕
        </button>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Controlos */}
        <div className="space-y-5">

          {/* Estilo */}
          <div>
            <div className="text-[#4a5568] text-[10px] font-bold tracking-widest mb-2">ESTILO</div>
            <div className="flex gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  style={{ background: t.bg, color: t.text, borderColor: selectedTemplate === t.id ? "#BFD64B" : "#2a3555" }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border-2 transition-all"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formato */}
          <div>
            <div className="text-[#4a5568] text-[10px] font-bold tracking-widest mb-2">FORMATO</div>
            <div className="flex gap-2">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedFormat === f.id
                      ? "border-[#BFD64B] bg-[#BFD64B]/10 text-[#BFD64B]"
                      : "border-[#2a3555] text-[#8892a4]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Headline */}
          <div>
            <div className="text-[#4a5568] text-[10px] font-bold tracking-widest mb-2">HEADLINE</div>
            <textarea
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              rows={3}
              className="w-full bg-[#111827] border border-[#2a3555] rounded-lg px-3 py-2.5 text-[#F0ECE4] text-sm focus:outline-none focus:border-[#BFD64B] transition-colors resize-none"
            />
          </div>

          {/* Corpo */}
          <div>
            <div className="text-[#4a5568] text-[10px] font-bold tracking-widest mb-2">TEXTO SECUNDÁRIO (opcional)</div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Deixa vazio para só mostrar o headline"
              className="w-full bg-[#111827] border border-[#2a3555] rounded-lg px-3 py-2.5 text-[#F0ECE4] text-sm focus:outline-none focus:border-[#BFD64B] transition-colors resize-none placeholder-[#4a5568]"
            />
          </div>

          {/* Exportar */}
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
              `⬇ Descarregar PNG (${fmt.w}×${fmt.h})`
            )}
          </button>

          <p className="text-[#4a5568] text-xs text-center">
            Resolução real: {fmt.w}×{fmt.h}px — pronto para {selectedFormat === "story" ? "Stories" : selectedFormat === "wide" ? "LinkedIn" : "feed Instagram"}
          </p>
        </div>

        {/* Preview canvas */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-[#4a5568] text-[10px] font-bold tracking-widest">PRÉ-VISUALIZAÇÃO</div>

          {/* Canvas que vai ser exportado */}
          <div
            ref={canvasRef}
            style={{
              width:    pw,
              height:   ph,
              background: tpl.bg,
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
              display:  "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding:  32,
              boxSizing: "border-box",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {/* Barra de destaque no topo */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: 5,
              background: tpl.accent,
            }} />

            {/* Headline */}
            <div style={{
              color:      tpl.text,
              fontSize:   headline.length > 100 ? 16 : headline.length > 60 ? 20 : 24,
              fontWeight: 800,
              lineHeight: 1.35,
              textAlign:  "center",
              marginBottom: body ? 20 : 0,
              wordBreak:  "break-word",
            }}>
              {headline}
            </div>

            {/* Separador */}
            {body && (
              <div style={{
                width: 40,
                height: 3,
                background: tpl.accent,
                borderRadius: 2,
                marginBottom: 16,
              }} />
            )}

            {/* Corpo */}
            {body && (
              <div style={{
                color:     tpl.sub,
                fontSize:  12,
                lineHeight: 1.7,
                textAlign: "center",
                whiteSpace: "pre-line",
              }}>
                {body.length > 200 ? body.substring(0, 200) + "..." : body}
              </div>
            )}

            {/* Ponto de marca no canto */}
            <div style={{
              position:  "absolute",
              bottom:    16,
              right:     20,
              color:     tpl.accent,
              fontSize:  10,
              fontWeight: 700,
              letterSpacing: 3,
            }}>
              ●
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
