"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import type { GeneratedContent } from "@/lib/supabase/types";
import ViralResearch from "@/components/content/ViralResearch";
import ContentDesigner from "@/components/content/ContentDesigner";

// Plataformas disponíveis
const platforms = [
  { id: "instagram", label: "Instagram", icon: "📸", desc: "Post feed" },
  { id: "linkedin",  label: "LinkedIn",  icon: "💼", desc: "Post profissional" },
  { id: "twitter",   label: "X / Twitter", icon: "🐦", desc: "Thread" },
  { id: "email",     label: "Email",     icon: "✉️", desc: "Newsletter" },
];

const topicSuggestions = [
  "A maior lição que aprendi ao tentar (e falhar) no meu negócio",
  "Por que a maioria das pessoas nunca começa — e como eu ultrapassei isso",
  "O erro que quase me fez desistir (e o que mudou tudo)",
];

const platformLabels: Record<string, string> = {
  instagram: "📸 Instagram",
  linkedin: "💼 LinkedIn",
  twitter: "🐦 X/Twitter",
  email: "✉️ Email",
};

interface VozDNA {
  arquetipo?: string;
  descricaoArquetipo?: string;
  tomEmTresPalavras?: string[];
  vocabularioActivo?: string[];
  vocabularioProibido?: string[];
  frasesAssinatura?: string[];
  regrasEstilo?: string[];
}

export default function ContentFactory() {
  const { user } = useUser();
  const [tab, setTab] = useState<"generate" | "history">("generate");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const vozDNA = (user?.unsafeMetadata?.vozDNA as VozDNA) ?? {};
  const vozDNAComplete = user?.unsafeMetadata?.vozDNAComplete as boolean;

  // Carrega histórico quando o tab muda para history
  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      if (res.ok) setHistory(data.content ?? []);
    } catch {
      // silencioso — histórico não é crítico
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab, loadHistory]);

  async function handleGenerate() {
    if (!selectedPlatform || !topic.trim()) return;
    setIsGenerating(true);
    setError("");
    setGeneratedContent("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: selectedPlatform, topic: topic.trim(), vozDNA }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro desconhecido"); return; }
      setGeneratedContent(data.content);
    } catch {
      setError("Erro de ligação. Tenta novamente.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/content?id=${id}`, { method: "DELETE" });
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-PT", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  }

  if (!vozDNAComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="bg-[#111827] border border-[#BFD64B]/30 rounded-xl p-8 max-w-md text-center">
          <div className="text-4xl mb-4">🎙️</div>
          <h2 className="text-xl font-bold text-[#F0ECE4] mb-3">Voz & DNA Necessário</h2>
          <p className="text-[#8892a4] text-sm mb-6">
            Define o teu Voz & DNA primeiro — 8 perguntas que codificam exactamente como a tua marca fala.
          </p>
          <a href="/voz-dna" className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
            Definir Voz & DNA →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">

      {/* Header + tabs */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-4">
          ⚡ CONTENT FACTORY
        </div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-[#F0ECE4]">Gera conteúdo na tua voz</h1>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-4 border-b border-[#1a2035]">
          {[
            { id: "generate", label: "Gerar" },
            { id: "history",  label: `Histórico${history.length > 0 ? ` (${history.length})` : ""}` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as "generate" | "history")}
              className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
                tab === t.id
                  ? "text-[#BFD64B] border-[#BFD64B]"
                  : "text-[#8892a4] border-transparent hover:text-[#F0ECE4]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: Gerar */}
      {tab === "generate" && (
        <>
          {/* Passo 1: Plataforma */}
          <div className="mb-8">
            <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">
              PASSO 1 — ONDE VAIS PUBLICAR?
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedPlatform === p.id
                      ? "border-[#BFD64B] bg-[#BFD64B]/10"
                      : "border-[#2a3555] bg-[#111827] hover:border-[#BFD64B]/50"
                  }`}
                >
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="font-bold text-[#F0ECE4] text-sm">{p.label}</div>
                  <div className="text-[#8892a4] text-xs mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pesquisa Viral — aparece depois de seleccionar plataforma */}
          {selectedPlatform && (
            <ViralResearch
              selectedPlatform={selectedPlatform}
              onSelectInsight={(text) => setTopic(text)}
            />
          )}

          {/* Passo 2: Tema */}
          {selectedPlatform && (
            <div className="mb-8">
              <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">
                PASSO 2 — SOBRE O QUE QUERES ESCREVER?
              </div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Por que 25 minutos de treino são suficientes para transformar o corpo..."
                rows={3}
                autoFocus
                className="w-full bg-[#111827] border border-[#2a3555] rounded-xl px-5 py-4 text-[#F0ECE4] placeholder-[#4a5568] text-base focus:outline-none focus:border-[#BFD64B] transition-colors resize-none"
              />
              <div className="mt-3">
                <div className="text-[#8892a4] text-xs mb-2">Sugestões:</div>
                <div className="flex flex-wrap gap-2">
                  {topicSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setTopic(s)}
                      className="text-xs text-[#8892a4] border border-[#2a3555] rounded-lg px-3 py-1.5 hover:border-[#BFD64B]/50 hover:text-[#F0ECE4] transition-all"
                    >
                      {s.length > 50 ? s.substring(0, 50) + "..." : s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || isGenerating}
                  className="bg-[#BFD64B] text-[#0A0E1A] font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <><div className="w-4 h-4 border-2 border-[#0A0E1A] border-t-transparent rounded-full animate-spin" />A gerar...</>
                  ) : "Gerar conteúdo →"}
                </button>
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm"><strong>Erro:</strong> {error}</p>
            </div>
          )}

          {/* Conteúdo gerado */}
          {generatedContent && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[#BFD64B] text-xs font-bold tracking-widest">
                  CONTEÚDO GERADO
                </div>
                <button
                  onClick={() => handleCopy(generatedContent)}
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                    copied
                      ? "bg-[#BFD64B] text-[#0A0E1A]"
                      : "border border-[#2a3555] text-[#8892a4] hover:border-[#BFD64B]/50 hover:text-[#F0ECE4]"
                  }`}
                >
                  {copied ? "✓ Copiado!" : "Copiar"}
                </button>
              </div>
              <div className="bg-[#111827] border border-[#2a3555] rounded-xl p-6">
                <pre className="text-[#F0ECE4] text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {generatedContent}
                </pre>
              </div>
              {/* Designer de imagem para redes sociais */}
              <ContentDesigner
                content={generatedContent}
                platform={selectedPlatform}
                niche={(user?.unsafeMetadata?.niche as string) || ""}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="text-sm text-[#8892a4] border border-[#2a3555] rounded-lg px-4 py-2 hover:border-[#BFD64B]/50 hover:text-[#F0ECE4] transition-all disabled:opacity-50"
                >
                  Regenerar
                </button>
                <button
                  onClick={() => { setGeneratedContent(""); setTopic(""); setSelectedPlatform(""); }}
                  className="text-sm text-[#8892a4] hover:text-[#F0ECE4] transition-colors px-4 py-2"
                >
                  Novo conteúdo
                </button>
                <button
                  onClick={() => setTab("history")}
                  className="text-sm text-[#BFD64B] hover:opacity-80 transition-opacity px-4 py-2 ml-auto"
                >
                  Ver histórico →
                </button>
              </div>
            </div>
          )}

          {/* Voz & DNA activo */}
          {vozDNA.arquetipo && (
            <div className="border-t border-[#1a2035] pt-6">
              <div className="text-[#8892a4] text-xs font-bold tracking-widest mb-3">
                VOZ & DNA ACTIVO
              </div>
              <div className="bg-[#111827] border border-[#1a2035] rounded-xl p-4 space-y-3">
                {/* Arquétipo + tom */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[#BFD64B] text-[10px] font-bold tracking-widest mb-0.5">ARQUÉTIPO</div>
                    <div className="text-[#F0ECE4] text-sm font-bold">{vozDNA.arquetipo}</div>
                  </div>
                  {vozDNA.tomEmTresPalavras && (
                    <div className="flex gap-1.5">
                      {vozDNA.tomEmTresPalavras.map((p) => (
                        <span key={p} className="bg-[#BFD64B]/10 text-[#BFD64B] text-[10px] font-bold px-2 py-1 rounded-full border border-[#BFD64B]/20">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Vocabulário */}
                {vozDNA.vocabularioActivo && vozDNA.vocabularioActivo.length > 0 && (
                  <div>
                    <div className="text-[#4a5568] text-[10px] font-bold tracking-widest mb-1.5">PALAVRAS ACTIVAS</div>
                    <div className="flex flex-wrap gap-1.5">
                      {vozDNA.vocabularioActivo.slice(0, 8).map((w) => (
                        <span key={w} className="bg-[#0d1420] text-[#8892a4] text-[10px] px-2 py-0.5 rounded border border-[#1a2035]">
                          {w}
                        </span>
                      ))}
                      {vozDNA.vocabularioActivo.length > 8 && (
                        <span className="text-[#4a5568] text-[10px] px-1">+{vozDNA.vocabularioActivo.length - 8}</span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end">
                  <a href="/voz-dna" className="text-[#4a5568] text-xs hover:text-[#8892a4] transition-colors">
                    Editar DNA →
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB: Histórico */}
      {tab === "history" && (
        <div>
          {isLoadingHistory ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#BFD64B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">✍️</div>
              <p className="text-[#8892a4]">Ainda não geraste nenhum conteúdo.</p>
              <button
                onClick={() => setTab("generate")}
                className="mt-4 text-[#BFD64B] text-sm hover:opacity-80 transition-opacity"
              >
                Gerar agora →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#111827] border border-[#2a3555] rounded-xl overflow-hidden"
                >
                  {/* Cabeçalho do card */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1a2035] transition-colors"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm shrink-0">
                        {platformLabels[item.platform] ?? item.platform}
                      </span>
                      <span className="text-[#8892a4] text-sm truncate">{item.topic}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[#4a5568] text-xs">{formatDate(item.created_at)}</span>
                      <span className="text-[#8892a4] text-xs">
                        {expandedId === item.id ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo expandido */}
                  {expandedId === item.id && (
                    <div className="px-4 pb-4">
                      <pre className="text-[#F0ECE4] text-sm leading-relaxed whitespace-pre-wrap font-sans bg-[#0d1420] rounded-lg p-4 mb-3">
                        {item.content}
                      </pre>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(item.content)}
                          className="text-xs border border-[#2a3555] text-[#8892a4] rounded-lg px-3 py-1.5 hover:border-[#BFD64B]/50 hover:text-[#F0ECE4] transition-all"
                        >
                          Copiar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs text-red-500/60 hover:text-red-400 transition-colors px-3 py-1.5"
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
