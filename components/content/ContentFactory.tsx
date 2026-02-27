"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import type { GeneratedContent } from "@/lib/supabase/types";
import ViralResearch from "@/components/content/ViralResearch";

// Formatos disponíveis
const formats = [
  { id: "reel",     label: "Reel",      icon: "🎬", desc: "Roteiro para vídeo curto" },
  { id: "carrossel",label: "Carrossel", icon: "📱", desc: "Sequência de cards" },
  { id: "story",    label: "Story",     icon: "💭", desc: "Sequência de stories" },
  { id: "post",     label: "Post",      icon: "✍️", desc: "Post para redes sociais" },
  { id: "legenda",  label: "Legenda",   icon: "📝", desc: "Legenda com storytelling" },
  { id: "email",    label: "Email",     icon: "✉️", desc: "Email marketing" },
];

// Sub-tipos por formato
const subtypes: Record<string, { id: string; label: string; desc: string }[]> = {
  reel: [
    { id: "viral7s",       label: "Viral 7S",         desc: "7 cenas × 7 segundos — máxima retenção" },
    { id: "utilidade",     label: "Utilidade",         desc: "Ensina algo concreto e accionável" },
    { id: "opiniao",       label: "Opinião",           desc: "Planta uma bandeira de posicionamento" },
    { id: "infotenimento", label: "Infotenimento",     desc: "Informa + entretém ao mesmo tempo" },
    { id: "problemaSolucao", label: "Problema/Solução", desc: "Identifica dor e apresenta solução" },
  ],
  carrossel: [
    { id: "utilidade",     label: "Utilidade",     desc: "Ensino directo — 10 cards educativos" },
    { id: "infotenimento", label: "Infotenimento", desc: "Pautas quentes com densidade" },
    { id: "opiniao",       label: "Opinião",       desc: "Storytelling + ponto de vista pessoal" },
    { id: "vendas",        label: "Vendas",        desc: "7 narrativas para vender produto/serviço" },
  ],
  story: [
    { id: "narrativaDensa", label: "Narrativa Densa",  desc: "Conhecimento em narrativa com oralidade extrema" },
    { id: "posicionamento", label: "Posicionamento",   desc: "Teses filosóficas que plantam crenças" },
    { id: "vendas",         label: "Vendas",           desc: "Amplifica dor e apresenta solução como alívio" },
  ],
  post: [
    { id: "instagram", label: "Instagram", desc: "Post feed optimizado para algoritmo 2025" },
    { id: "linkedin",  label: "LinkedIn",  desc: "Post profissional com hook forte" },
    { id: "twitter",   label: "X/Twitter", desc: "Thread com golden nugget" },
    { id: "email",     label: "Email",     desc: "Newsletter para subscribers" },
  ],
  legenda: [
    { id: "storytelling", label: "Storytelling", desc: "Legenda com narrativa pessoal e CTA de partilha" },
  ],
  email: [
    { id: "boasVindas",  label: "Boas-Vindas",      desc: "Primeiro email para novo subscritor" },
    { id: "nutricao",    label: "Nutrição de Lead",  desc: "Educa e aquece para decisão futura" },
    { id: "vendaDireta", label: "Venda Directa",     desc: "Vende directamente com AIDA + Halbert" },
  ],
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

interface CalendarioRow {
  id: string;
  data: string;
  formato: string;
  linhaEditorial: string;
  tema: string;
  plataforma: string;
  logica: string;
}

// Converte o formato do calendário no formato+subtipo do ContentFactory
function mapFormato(formato: string): { format: string; subtype: string } {
  const f = formato.toLowerCase();
  if (f.includes("viral 7s") || f.includes("viral7s"))          return { format: "reel",      subtype: "viral7s" };
  if (f.includes("problema") || f.includes("solução"))          return { format: "reel",      subtype: "problemaSolucao" };
  if (f.includes("infotenimento") && f.includes("reel"))        return { format: "reel",      subtype: "infotenimento" };
  if (f.includes("utilidade") && f.includes("reel"))            return { format: "reel",      subtype: "utilidade" };
  if (f.includes("opinião") && f.includes("reel"))              return { format: "reel",      subtype: "opiniao" };
  if (f.includes("carrossel") && f.includes("utilidade"))       return { format: "carrossel", subtype: "utilidade" };
  if (f.includes("carrossel") && f.includes("infotenimento"))   return { format: "carrossel", subtype: "infotenimento" };
  if (f.includes("carrossel") && f.includes("narrativa"))       return { format: "carrossel", subtype: "opiniao" };
  if (f.includes("carrossel") && f.includes("vendas"))          return { format: "carrossel", subtype: "vendas" };
  if (f.includes("carrossel"))                                  return { format: "carrossel", subtype: "utilidade" };
  if (f.includes("threads") || f.includes("/x"))                return { format: "post",      subtype: "twitter" };
  if (f.includes("story"))                                      return { format: "story",     subtype: "narrativaDensa" };
  if (f.includes("post"))                                       return { format: "post",      subtype: "instagram" };
  if (f.includes("reel"))                                       return { format: "reel",      subtype: "viral7s" };
  return { format: "post", subtype: "instagram" };
}

export default function ContentFactory() {
  const { user } = useUser();
  const [tab, setTab] = useState<"generate" | "calendar" | "history">("generate");

  // Selecção de formato
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedSubtype, setSelectedSubtype] = useState("");
  const [topic, setTopic] = useState("");

  // Estado de geração
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Histórico
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const vozDNA = (user?.unsafeMetadata?.vozDNA as VozDNA) ?? {};
  const vozDNAComplete = user?.unsafeMetadata?.vozDNAComplete as boolean;
  const calendarioRows = (user?.unsafeMetadata?.calendarioRows as CalendarioRow[]) ?? [];
  const temCalendario = calendarioRows.length > 0;

  // Resetar sub-tipo quando o formato muda
  function handleFormatSelect(formatId: string) {
    setSelectedFormat(formatId);
    setSelectedSubtype("");
    setGeneratedContent("");
    setError("");
  }

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      if (res.ok) setHistory(data.content ?? []);
    } catch { /* silencioso */ }
    finally { setIsLoadingHistory(false); }
  }, []);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab, loadHistory]);

  async function handleGenerate() {
    if (!selectedFormat || !selectedSubtype || !topic.trim()) return;
    setIsGenerating(true);
    setError("");
    setGeneratedContent("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: selectedFormat,
          subtype: selectedSubtype,
          topic: topic.trim(),
          vozDNA,
        }),
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

  // Etiqueta legível para o histórico
  const formatLabel = (platform: string) => {
    const [f, s] = platform.split("/");
    const fmt = formats.find((x) => x.id === f);
    const sub = subtypes[f]?.find((x) => x.id === s);
    if (fmt && sub) return `${fmt.icon} ${fmt.label} — ${sub.label}`;
    return platform;
  };

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
        <h1 className="text-3xl font-bold text-[#F0ECE4] mb-4">Gera conteúdo na tua voz</h1>
        <div className="flex gap-1 border-b border-[#1a2035]">
          {[
            { id: "generate",  label: "Gerar" },
            ...(temCalendario ? [{ id: "calendar", label: `📅 Calendário (${calendarioRows.length})` }] : []),
            { id: "history",   label: `Histórico${history.length > 0 ? ` (${history.length})` : ""}` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as "generate" | "calendar" | "history")}
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
          {/* PASSO 1 — Formato */}
          <div className="mb-8">
            <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">
              PASSO 1 — QUE TIPO DE CONTEÚDO?
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFormatSelect(f.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedFormat === f.id
                      ? "border-[#BFD64B] bg-[#BFD64B]/10"
                      : "border-[#2a3555] bg-[#111827] hover:border-[#BFD64B]/50"
                  }`}
                >
                  <div className="text-xl mb-1">{f.icon}</div>
                  <div className="font-bold text-[#F0ECE4] text-xs">{f.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* PASSO 2 — Sub-tipo */}
          {selectedFormat && (
            <div className="mb-8">
              <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">
                PASSO 2 — QUE ESTILO?
              </div>
              <div className="flex flex-col gap-2">
                {subtypes[selectedFormat]?.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubtype(s.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      selectedSubtype === s.id
                        ? "border-[#BFD64B] bg-[#BFD64B]/10"
                        : "border-[#2a3555] bg-[#111827] hover:border-[#BFD64B]/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#F0ECE4] text-sm">{s.label}</div>
                      <div className="text-[#8892a4] text-xs mt-0.5">{s.desc}</div>
                    </div>
                    {selectedSubtype === s.id && (
                      <span className="text-[#BFD64B] text-xs font-bold shrink-0">✓ Seleccionado</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASSO 3 — Tema */}
          {selectedFormat && selectedSubtype && (
            <div className="mb-8">
              <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">
                PASSO 3 — QUAL É O TEMA?
              </div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Descreve o tema ou a ideia que queres desenvolver..."
                rows={3}
                autoFocus
                className="w-full bg-[#111827] border border-[#2a3555] rounded-xl px-5 py-4 text-[#F0ECE4] placeholder-[#4a5568] text-base focus:outline-none focus:border-[#BFD64B] transition-colors resize-none"
              />

              {/* Ângulos Únicos */}
              {topic.trim().length > 5 && (
                <ViralResearch
                  selectedPlatform={selectedFormat}
                  topic={topic}
                  onSelectAngle={(hook) => setTopic(hook)}
                />
              )}

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

              <div className="flex gap-3 mt-4 flex-wrap">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="text-sm text-[#8892a4] border border-[#2a3555] rounded-lg px-4 py-2 hover:border-[#BFD64B]/50 hover:text-[#F0ECE4] transition-all disabled:opacity-50"
                >
                  Regenerar
                </button>
                <button
                  onClick={() => { setGeneratedContent(""); setTopic(""); setSelectedFormat(""); setSelectedSubtype(""); }}
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
              <div className="text-[#8892a4] text-xs font-bold tracking-widest mb-3">VOZ & DNA ACTIVO</div>
              <div className="bg-[#111827] border border-[#1a2035] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[#BFD64B] text-[10px] font-bold tracking-widest mb-0.5">ARQUÉTIPO</div>
                    <div className="text-[#F0ECE4] text-sm font-bold">{vozDNA.arquetipo}</div>
                  </div>
                  {vozDNA.tomEmTresPalavras && (
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {vozDNA.tomEmTresPalavras.map((p) => (
                        <span key={p} className="bg-[#BFD64B]/10 text-[#BFD64B] text-[10px] font-bold px-2 py-1 rounded-full border border-[#BFD64B]/20">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* TAB: Calendário */}
      {tab === "calendar" && (
        <div>
          <p className="text-[#8892a4] text-sm mb-6">
            Selecciona um post do teu calendário — o formato e o tema ficam pré-preenchidos.
          </p>
          <div className="flex flex-col gap-2">
            {calendarioRows.map((row, i) => (
              <button
                key={row.id ?? i}
                onClick={() => {
                  const mapeado = mapFormato(row.formato);
                  handleFormatSelect(mapeado.format);
                  setSelectedSubtype(mapeado.subtype);
                  setTopic(row.tema);
                  setTab("generate");
                }}
                className="bg-[#111827] border border-[#2a3555] rounded-xl px-4 py-3 text-left hover:border-[#BFD64B]/50 hover:bg-[#1a2035] transition-all flex items-center gap-4"
              >
                <span className="text-[#8892a4] font-mono text-xs shrink-0 w-20">{row.data}</span>
                <span className="text-[#4a5568] text-xs shrink-0 w-32 truncate">{row.formato}</span>
                <span className="text-[#F0ECE4] text-sm flex-1 truncate">{row.tema}</span>
                <span className="text-[#BFD64B] text-xs shrink-0">Usar →</span>
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a href="/calendario" className="text-[#4a5568] text-xs hover:text-[#8892a4] transition-colors">
              Editar calendário →
            </a>
          </div>
        </div>
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
              <button onClick={() => setTab("generate")} className="mt-4 text-[#BFD64B] text-sm hover:opacity-80 transition-opacity">
                Gerar agora →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((item) => (
                <div key={item.id} className="bg-[#111827] border border-[#2a3555] rounded-xl overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1a2035] transition-colors"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm shrink-0">{formatLabel(item.platform)}</span>
                      <span className="text-[#8892a4] text-sm truncate">{item.topic}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[#4a5568] text-xs">{formatDate(item.created_at)}</span>
                      <span className="text-[#8892a4] text-xs">{expandedId === item.id ? "▲" : "▼"}</span>
                    </div>
                  </div>
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
