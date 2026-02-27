"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface ViralResearchResult {
  hooks: string[];
  topics: string[];
  formats: string[];
  insight: string;
  fromCache?: boolean;
}

interface ViralResearchProps {
  selectedPlatform: string;
  onSelectInsight: (text: string) => void;
}

export default function ViralResearch({ selectedPlatform, onSelectInsight }: ViralResearchProps) {
  const { user } = useUser();
  const savedNiche = (user?.unsafeMetadata?.niche as string) ?? "";

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [niche, setNiche] = useState(savedNiche);
  const [result, setResult] = useState<ViralResearchResult | null>(null);
  const [error, setError] = useState("");

  async function handleResearch() {
    if (!niche.trim()) return;
    setIsLoading(true);
    setError("");
    setResult(null);

    // Guarda nicho automaticamente ao pesquisar
    if (niche.trim() !== savedNiche && user) {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          niche: niche.trim().toLowerCase(),
        },
      });
    }

    try {
      const res = await fetch("/api/viral-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: selectedPlatform, niche: niche.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro na pesquisa. Tenta novamente.");
        return;
      }
      setResult(data);
    } catch {
      setError("Erro de ligação. Tenta novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectAndClose(text: string) {
    onSelectInsight(text);
    setIsOpen(false);
  }

  // Botão fechado
  if (!isOpen) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 text-sm border border-dashed border-[#2a3555] rounded-xl px-4 py-3 hover:border-[#BFD64B]/40 hover:text-[#F0ECE4] transition-all w-full group"
        >
          <span className="text-base group-hover:scale-110 transition-transform">🔍</span>
          <div className="flex flex-col items-start">
            <span className="font-medium text-[#F0ECE4]/70 group-hover:text-[#F0ECE4] transition-colors">
              Pesquisar o que está viral no teu nicho
            </span>
            <span className="text-[#4a5568] text-xs">
              {savedNiche ? `Nicho: ${savedNiche}` : "Web · YouTube · Reddit · Instagram · LinkedIn"}
            </span>
          </div>
          <span className="ml-auto text-[#4a5568] text-xs group-hover:text-[#BFD64B] transition-colors">
            ▼
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-[#0d1420] border border-[#2a3555] rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2035]">
        <div className="flex items-center gap-2">
          <span>🔍</span>
          <span className="text-[#F0ECE4] font-bold text-sm">Pesquisa Viral</span>
          <span className="text-[#4a5568] text-xs hidden sm:block">— o que está a funcionar no teu nicho</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[#4a5568] hover:text-[#8892a4] transition-colors text-sm px-2 py-1"
        >
          ✕
        </button>
      </div>

      {/* Campo de nicho */}
      <div className="p-5">
        <div className="mb-1 text-[#4a5568] text-xs font-bold tracking-widest">
          O TEU NICHO
        </div>
        <div className="flex gap-3">
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) handleResearch();
            }}
            placeholder="Ex: fitness masculino, coaching de negócios, nutrição..."
            className="flex-1 bg-[#111827] border border-[#2a3555] rounded-lg px-4 py-2.5 text-[#F0ECE4] placeholder-[#4a5568] text-sm focus:outline-none focus:border-[#BFD64B] transition-colors"
          />
          <button
            onClick={handleResearch}
            disabled={isLoading || !niche.trim()}
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed text-sm whitespace-nowrap flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-[#0A0E1A] border-t-transparent rounded-full animate-spin" />
                A pesquisar...
              </>
            ) : (
              "Pesquisar →"
            )}
          </button>
        </div>

        {/* Info de cache/guardar */}
        {niche.trim() && niche.trim().toLowerCase() !== savedNiche && !isLoading && (
          <p className="text-[#4a5568] text-xs mt-2">
            O nicho será guardado automaticamente quando pesquisares.
          </p>
        )}
        {savedNiche && niche.trim().toLowerCase() === savedNiche && (
          <p className="text-[#4a5568] text-xs mt-2">
            ✓ Nicho guardado no teu perfil
          </p>
        )}

        {error && (
          <p className="text-red-400 text-xs mt-3">⚠️ {error}</p>
        )}

        {isLoading && (
          <div className="mt-4 flex items-center gap-2 text-[#4a5568] text-xs">
            <div className="w-3 h-3 border-2 border-[#BFD64B]/40 border-t-[#BFD64B] rounded-full animate-spin" />
            A pesquisar conteúdo viral de {niche} na web...
          </div>
        )}
      </div>

      {/* Resultados */}
      {result && (
        <div className="px-5 pb-5 space-y-5">

          {/* Badge cache */}
          {result.fromCache && (
            <div className="flex items-center gap-1.5 text-[#4a5568] text-xs">
              <span>⚡</span>
              <span>Resultado do cache de hoje — fresco e rápido</span>
            </div>
          )}

          {/* Insight principal */}
          {result.insight && (
            <div className="bg-[#BFD64B]/10 border border-[#BFD64B]/20 rounded-lg px-4 py-3">
              <p className="text-[#BFD64B] text-[10px] font-bold tracking-widest mb-1">
                💡 PADRÃO DOMINANTE AGORA
              </p>
              <p className="text-[#F0ECE4] text-sm">{result.insight}</p>
            </div>
          )}

          {/* Hooks virais */}
          {result.hooks?.length > 0 && (
            <div>
              <div className="text-[#BFD64B] text-[10px] font-bold tracking-widest mb-2">
                🎯 HOOKS VIRAIS — clica para usar como tema
              </div>
              <div className="space-y-2">
                {result.hooks.map((hook, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAndClose(hook)}
                    className="w-full text-left bg-[#111827] border border-[#2a3555] rounded-lg px-4 py-2.5 text-[#F0ECE4] text-sm hover:border-[#BFD64B]/50 hover:bg-[#BFD64B]/5 transition-all group"
                  >
                    <span className="text-[#4a5568] text-xs mr-2 group-hover:text-[#BFD64B] transition-colors">
                      →
                    </span>
                    {hook}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Temas em alta */}
          {result.topics?.length > 0 && (
            <div>
              <div className="text-[#BFD64B] text-[10px] font-bold tracking-widest mb-2">
                🔥 TEMAS EM ALTA — clica para usar
              </div>
              <div className="flex flex-wrap gap-2">
                {result.topics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAndClose(topic)}
                    className="text-sm bg-[#111827] border border-[#2a3555] rounded-lg px-3 py-1.5 text-[#8892a4] hover:border-[#BFD64B]/50 hover:text-[#F0ECE4] hover:bg-[#BFD64B]/5 transition-all"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formatos */}
          {result.formats?.length > 0 && (
            <div>
              <div className="text-[#BFD64B] text-[10px] font-bold tracking-widest mb-2">
                📋 FORMATOS QUE FUNCIONAM
              </div>
              <div className="space-y-2">
                {result.formats.map((format, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-[#8892a4]">
                    <span className="text-[#BFD64B] shrink-0 mt-0.5 text-xs">◆</span>
                    <span>{format}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nova pesquisa */}
          <div className="pt-2 border-t border-[#1a2035]">
            <button
              onClick={handleResearch}
              disabled={isLoading}
              className="text-[#4a5568] text-xs hover:text-[#8892a4] transition-colors disabled:opacity-50"
            >
              ↻ Pesquisar novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
