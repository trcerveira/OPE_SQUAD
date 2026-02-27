"use client";

import { useState } from "react";

interface BrandColors {
  brand_bg: string;
  brand_surface: string;
  brand_accent: string;
  brand_text: string;
}

interface Props {
  initialColors: BrandColors;
}

// Paletas predefinidas para inspiração
const PRESETS = [
  {
    name: "OPB Original",
    colors: { brand_bg: "#0A0E1A", brand_surface: "#111827", brand_accent: "#BFD64B", brand_text: "#F0ECE4" },
  },
  {
    name: "Ocean Dark",
    colors: { brand_bg: "#0D1B2A", brand_surface: "#1B2838", brand_accent: "#00D4FF", brand_text: "#E8F4FD" },
  },
  {
    name: "Forest",
    colors: { brand_bg: "#0D1A0F", brand_surface: "#142214", brand_accent: "#4ADE80", brand_text: "#F0FDF4" },
  },
  {
    name: "Fire",
    colors: { brand_bg: "#1A0A0A", brand_surface: "#2A1010", brand_accent: "#FF6B35", brand_text: "#FFF1EC" },
  },
  {
    name: "Royal",
    colors: { brand_bg: "#0F0A1A", brand_surface: "#1A1028", brand_accent: "#A855F7", brand_text: "#F5F0FF" },
  },
  {
    name: "Gold",
    colors: { brand_bg: "#1A1400", brand_surface: "#261E00", brand_accent: "#F59E0B", brand_text: "#FFFBEB" },
  },
];

const COLOR_LABELS: Record<keyof BrandColors, string> = {
  brand_bg: "Fundo",
  brand_surface: "Containers",
  brand_accent: "Destaque / CTAs",
  brand_text: "Texto",
};

const COLOR_DESCRIPTIONS: Record<keyof BrandColors, string> = {
  brand_bg: "Cor principal do fundo da app",
  brand_surface: "Cor dos cards e painéis",
  brand_accent: "Cor dos botões e destaques",
  brand_text: "Cor do texto principal",
};

export default function BrandColorPicker({ initialColors }: Props) {
  const [colors, setColors] = useState<BrandColors>(initialColors);
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle");

  function applyToPage(c: BrandColors) {
    // Aplica as cores em tempo real para preview
    const root = document.documentElement;
    root.style.setProperty("--bg", c.brand_bg);
    root.style.setProperty("--surface", c.brand_surface);
    root.style.setProperty("--accent", c.brand_accent);
    root.style.setProperty("--text", c.brand_text);
  }

  function handleColorChange(key: keyof BrandColors, value: string) {
    const updated = { ...colors, [key]: value };
    setColors(updated);
    applyToPage(updated);
  }

  function applyPreset(preset: typeof PRESETS[0]) {
    setColors(preset.colors);
    applyToPage(preset.colors);
  }

  async function handleSave() {
    setEstado("loading");
    try {
      const res = await fetch("/api/settings/brand-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(colors),
      });
      if (!res.ok) throw new Error("Erro ao guardar");
      setEstado("success");
      setTimeout(() => setEstado("idle"), 3000);
    } catch {
      setEstado("error");
      setTimeout(() => setEstado("idle"), 3000);
    }
  }

  function resetToDefault() {
    const defaults = PRESETS[0].colors;
    setColors(defaults);
    applyToPage(defaults);
  }

  return (
    <div className="space-y-8">

      {/* Preview ao vivo */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          backgroundColor: colors.brand_bg,
          borderColor: colors.brand_accent + "33",
        }}
      >
        <p className="text-xs font-bold tracking-widest mb-4" style={{ color: colors.brand_accent }}>
          PREVIEW AO VIVO
        </p>
        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: colors.brand_surface }}>
          <p className="font-bold mb-1" style={{ color: colors.brand_text }}>
            OPB Crew Dashboard
          </p>
          <p className="text-sm" style={{ color: colors.brand_text + "99" }}>
            Assim ficará a tua interface personalizada.
          </p>
        </div>
        <button
          className="px-6 py-2 rounded-xl font-bold text-sm"
          style={{
            backgroundColor: colors.brand_accent,
            color: colors.brand_bg,
          }}
        >
          Botão de Acção →
        </button>
      </div>

      {/* Paletas predefinidas */}
      <div>
        <p className="text-xs font-bold tracking-widest text-[#8892a4] mb-3">
          PALETAS PREDEFINIDAS
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="rounded-xl p-3 border border-white/[0.08] hover:border-white/20 transition-all text-left group"
              style={{ backgroundColor: preset.colors.brand_bg }}
            >
              {/* Mini preview das 4 cores */}
              <div className="flex gap-1 mb-2">
                {Object.values(preset.colors).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p
                className="text-xs font-bold"
                style={{ color: preset.colors.brand_text }}
              >
                {preset.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Color pickers individuais */}
      <div>
        <p className="text-xs font-bold tracking-widest text-[#8892a4] mb-3">
          PERSONALIZAR CORES
        </p>
        <div className="space-y-3">
          {(Object.keys(COLOR_LABELS) as Array<keyof BrandColors>).map((key) => (
            <div
              key={key}
              className="flex items-center gap-4 bg-[#111827] rounded-xl p-4 border border-white/[0.06]"
            >
              {/* Color picker */}
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#F0ECE4] text-sm">{COLOR_LABELS[key]}</p>
                <p className="text-[#8892a4] text-xs">{COLOR_DESCRIPTIONS[key]}</p>
              </div>

              {/* Hex value */}
              <code className="text-[#BFD64B] text-xs font-mono shrink-0">
                {colors[key].toUpperCase()}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Botões de acção */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={estado === "loading"}
          className="flex-1 py-4 rounded-xl font-bold text-base transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: colors.brand_accent,
            color: colors.brand_bg,
          }}
        >
          {estado === "loading" && "A guardar..."}
          {estado === "success" && "✅ Guardado!"}
          {estado === "error" && "❌ Erro — tenta novamente"}
          {estado === "idle" && "Guardar paleta →"}
        </button>

        <button
          onClick={resetToDefault}
          className="px-5 py-4 rounded-xl font-bold text-sm bg-white/[0.05] text-[#8892a4] hover:text-[#F0ECE4] hover:bg-white/[0.08] transition-all"
        >
          Reset
        </button>
      </div>

    </div>
  );
}
