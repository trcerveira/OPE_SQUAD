"use client";

import { useState } from "react";

interface Angulo {
  title: string;
  hook: string;
  why_unique: string;
}

interface AngulosUnicosProps {
  selectedPlatform: string;
  topic: string;
  onSelectAngle: (hook: string) => void;
}

export default function ViralResearch({ selectedPlatform, topic, onSelectAngle }: AngulosUnicosProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [angles, setAngles] = useState<Angulo[]>([]);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError("");
    setAngles([]);
    setSelectedIndex(null);

    try {
      const res = await fetch("/api/viral-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: selectedPlatform, topic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao gerar ângulos. Tenta novamente.");
        return;
      }
      if (data.angles?.length > 0) {
        setAngles(data.angles);
      }
    } catch {
      setError("Erro de ligação. Tenta novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelect(index: number) {
    setSelectedIndex(index);
    onSelectAngle(angles[index].hook);
    setTimeout(() => setIsOpen(false), 600);
  }

  // Botão fechado
  if (!isOpen) {
    return (
      <div className="mt-3">
        <button
          onClick={() => { setIsOpen(true); if (angles.length === 0) handleGenerate(); }}
          className="flex items-center gap-2 text-xs text-[#8892a4] border border-dashed border-[#2a3555] rounded-lg px-4 py-2.5 hover:border-[#BFD64B]/40 hover:text-[#BFD64B] transition-all w-full group"
        >
          <span className="text-sm">✨</span>
          <span className="font-medium">Ver os meus 5 ângulos únicos para este tema</span>
          <span className="ml-auto text-[#4a5568] group-hover:text-[#BFD64B] transition-colors">→</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-[#0d1420] border border-[#2a3555] rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a2035]">
        <div className="flex items-center gap-2">
          <span>✨</span>
          <span className="text-[#F0ECE4] font-bold text-sm">Ângulos Únicos</span>
          <span className="text-[#4a5568] text-xs hidden sm:block">— só tu podes tomar estes ângulos</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[#4a5568] hover:text-[#8892a4] transition-colors text-sm px-2 py-1"
        >
          ✕
        </button>
      </div>

      <div className="p-5">

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 text-[#4a5568] text-sm py-4">
            <div className="w-4 h-4 border-2 border-[#BFD64B]/40 border-t-[#BFD64B] rounded-full animate-spin shrink-0" />
            A analisar o teu Voice DNA e Genius Profile...
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="py-2">
            <p className="text-red-400 text-xs">⚠️ {error}</p>
            <button
              onClick={handleGenerate}
              className="mt-2 text-xs text-[#8892a4] hover:text-[#F0ECE4] transition-colors underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Ângulos */}
        {angles.length > 0 && (
          <div className="space-y-3">
            <div className="text-[#BFD64B] text-[10px] font-bold tracking-widest mb-4">
              5 ÂNGULOS QUE SÓ TU PODES TOMAR — clica para usar
            </div>
            {angles.map((angle, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left rounded-xl border p-4 transition-all group ${
                  selectedIndex === i
                    ? "border-[#BFD64B] bg-[#BFD64B]/10"
                    : "border-[#2a3555] bg-[#111827] hover:border-[#BFD64B]/50 hover:bg-[#BFD64B]/5"
                }`}
              >
                {/* Título do ângulo */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold tracking-widest shrink-0 ${
                    selectedIndex === i ? "text-[#BFD64B]" : "text-[#4a5568] group-hover:text-[#BFD64B]"
                  }`}>
                    {selectedIndex === i ? "✓" : `${i + 1}`}
                  </span>
                  <span className="text-[#F0ECE4] text-xs font-bold uppercase tracking-wide">
                    {angle.title}
                  </span>
                </div>

                {/* Hook */}
                <p className="text-[#F0ECE4] text-sm leading-relaxed mb-2">
                  "{angle.hook}"
                </p>

                {/* Porque único */}
                <p className="text-[#4a5568] text-xs group-hover:text-[#8892a4] transition-colors">
                  🎯 {angle.why_unique}
                </p>
              </button>
            ))}

            {/* Regenerar */}
            <div className="pt-1 border-t border-[#1a2035]">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="text-[#4a5568] text-xs hover:text-[#8892a4] transition-colors disabled:opacity-50"
              >
                ↻ Gerar novos ângulos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
