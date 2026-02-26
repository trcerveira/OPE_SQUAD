"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

// Plataformas disponíveis
const platforms = [
  {
    id: "instagram",
    label: "Instagram",
    icon: "📸",
    desc: "Post feed ou carrossel",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "💼",
    desc: "Post profissional",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    icon: "🐦",
    desc: "Thread ou tweet único",
  },
  {
    id: "email",
    label: "Email",
    icon: "✉️",
    desc: "Newsletter ou broadcast",
  },
];

// Sugestões de tópicos baseadas em contextos comuns de solopreneurs
const topicSuggestions = [
  "A maior lição que aprendi ao tentar (e falhar) no meu negócio",
  "Por que a maioria das pessoas nunca começa — e como eu ultrapassei isso",
  "O erro que quase me fez desistir (e o que mudou tudo)",
  "3 coisas que ninguém te diz sobre [o meu nicho]",
  "Como passei de [situação anterior] para [situação actual]",
  "A verdade sobre [mito comum no meu nicho]",
];

interface VoiceDNA {
  niche?: string;
  offer?: string;
  pain?: string;
  tone?: string;
  differentiator?: string;
}

export default function ContentFactory() {
  const { user } = useUser();
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Obtém o Voice DNA do Clerk
  const voiceDNA = (user?.unsafeMetadata?.voiceDNA as VoiceDNA) ?? {};
  const onboardingComplete = user?.unsafeMetadata?.onboardingComplete as boolean;

  async function handleGenerate() {
    if (!selectedPlatform || !topic.trim()) return;

    setIsGenerating(true);
    setError("");
    setGeneratedContent("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPlatform,
          topic: topic.trim(),
          voiceDNA,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro desconhecido");
        return;
      }

      setGeneratedContent(data.content);
    } catch {
      setError("Erro de ligação. Tenta novamente.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSuggestion(suggestion: string) {
    // Substitui [o meu nicho] pelo nicho real se disponível
    const personalised = voiceDNA.niche
      ? suggestion.replace("[o meu nicho]", voiceDNA.niche)
      : suggestion;
    setTopic(personalised);
  }

  // Se o onboarding não está completo, mostra aviso
  if (!onboardingComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="bg-[#111827] border border-[#BFD64B]/30 rounded-xl p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-xl font-bold text-[#F0ECE4] mb-3">
            Voice DNA Necessário
          </h2>
          <p className="text-[#8892a4] text-sm mb-6">
            Para gerar conteúdo na tua voz, preciso primeiro de perceber quem és.
            Faz o onboarding — demora 15 minutos e fazemos uma vez só.
          </p>
          <a
            href="/onboarding"
            className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Fazer Onboarding →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-4">
          ⚡ CONTENT FACTORY
        </div>
        <h1 className="text-3xl font-bold text-[#F0ECE4] mb-2">
          Gera conteúdo na tua voz
        </h1>
        <p className="text-[#8892a4]">
          A IA usa o teu Voice DNA para criar conteúdo que soa a ti — não a uma máquina.
        </p>
      </div>

      {/* Passo 1: Escolher plataforma */}
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

          {/* Sugestões de tópicos */}
          <div className="mt-3">
            <div className="text-[#8892a4] text-xs mb-2">
              Precisas de inspiração? Clica numa sugestão:
            </div>
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs text-[#8892a4] border border-[#2a3555] rounded-lg px-3 py-1.5 hover:border-[#BFD64B]/50 hover:text-[#F0ECE4] transition-all"
                >
                  {s.length > 50 ? s.substring(0, 50) + "..." : s}
                </button>
              ))}
            </div>
          </div>

          {/* Botão gerar */}
          <div className="mt-5">
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="bg-[#BFD64B] text-[#0A0E1A] font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A0E1A] border-t-transparent rounded-full animate-spin" />
                  A gerar...
                </>
              ) : (
                "Gerar conteúdo →"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">
            <strong>Erro:</strong> {error}
          </p>
          {error.includes("API key") && (
            <p className="text-[#8892a4] text-xs mt-2">
              Adiciona a tua ANTHROPIC_API_KEY ao ficheiro .env.local
            </p>
          )}
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
              onClick={handleCopy}
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

          {/* Acções pós-geração */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="text-sm text-[#8892a4] border border-[#2a3555] rounded-lg px-4 py-2 hover:border-[#BFD64B]/50 hover:text-[#F0ECE4] transition-all disabled:opacity-50"
            >
              Regenerar
            </button>
            <button
              onClick={() => {
                setGeneratedContent("");
                setTopic("");
                setSelectedPlatform("");
              }}
              className="text-sm text-[#8892a4] hover:text-[#F0ECE4] transition-colors px-4 py-2"
            >
              Novo conteúdo
            </button>
          </div>
        </div>
      )}

      {/* Voice DNA activo — mostra ao utilizador o que a IA usa */}
      <div className="border-t border-[#1a2035] pt-6">
        <div className="text-[#8892a4] text-xs font-bold tracking-widest mb-3">
          A IA ESTÁ A USAR O TEU VOICE DNA
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {voiceDNA.niche && (
            <div className="bg-[#111827] rounded-lg px-3 py-2">
              <div className="text-[#BFD64B] text-[10px] font-bold tracking-widest">NICHO</div>
              <div className="text-[#F0ECE4] text-xs mt-0.5 truncate">{voiceDNA.niche}</div>
            </div>
          )}
          {voiceDNA.tone && (
            <div className="bg-[#111827] rounded-lg px-3 py-2">
              <div className="text-[#BFD64B] text-[10px] font-bold tracking-widest">TOM</div>
              <div className="text-[#F0ECE4] text-xs mt-0.5 capitalize">{voiceDNA.tone}</div>
            </div>
          )}
          {voiceDNA.differentiator && (
            <div className="bg-[#111827] rounded-lg px-3 py-2">
              <div className="text-[#BFD64B] text-[10px] font-bold tracking-widest">DIFERENCIAL</div>
              <div className="text-[#F0ECE4] text-xs mt-0.5 truncate">{voiceDNA.differentiator}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
