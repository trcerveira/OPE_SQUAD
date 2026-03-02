"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";


interface EditorialLine {
  numero: string;
  nome: string;
  temaCentral: string;
  tensaoCentral: string;
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

interface BulkResult {
  row: CalendarioRow;
  content: string;
  error?: string;
}

interface FormCalendario {
  dias: number;
  formatos: string[];
  objectivo: string;
  dataInicio: string;
}

const formatosDisponiveis = [
  { id: "reels7s",    label: "Reels 7s",    icon: "🎬", desc: "Reel de 7 segundos — alcance viral" },
  { id: "reelsLongo", label: "Reels Longo", icon: "🎥", desc: "Reel 30-90s — educação e autoridade" },
  { id: "carrossel",  label: "Carrossel",   icon: "📱", desc: "Sequência de cards — saves e partilhas" },
  { id: "postFeed",   label: "Post Feed",   icon: "📷", desc: "Post de imagem — presença no feed" },
  { id: "threads",    label: "Threads / X", icon: "🧵", desc: "Post de texto — posicionamento" },
  { id: "story",      label: "Story",       icon: "💭", desc: "Story diário — proximidade e engagement" },
];

const objectivos = [
  { id: "crescimento", label: "Crescimento & Engagement", icon: "📈", desc: "90% TOPO — alcance e awareness" },
  { id: "vendas",      label: "Vendas",                   icon: "💰", desc: "Mix MEIO/FUNDO — autoridade e conversão" },
  { id: "ambos",       label: "Ambos — 50/50",            icon: "⚖️", desc: "Equilíbrio entre crescimento e vendas" },
];

const coresPaleta = [
  { bg: "rgba(191,214,75,0.15)",  text: "#BFD64B" },
  { bg: "rgba(99,179,237,0.15)",  text: "#63B3ED" },
  { bg: "rgba(252,129,74,0.15)",  text: "#FC814A" },
];

// Converte formato do calendário → format+subtype da API generate
function mapFormato(formato: string): { format: string; subtype: string } {
  const f = formato.toLowerCase();
  if (f.includes("viral 7s") || f.includes("viral7s"))        return { format: "reel",      subtype: "viral7s" };
  if (f.includes("problema") || f.includes("solução"))        return { format: "reel",      subtype: "problemaSolucao" };
  if (f.includes("infotenimento") && f.includes("reel"))      return { format: "reel",      subtype: "infotenimento" };
  if (f.includes("utilidade") && f.includes("reel"))          return { format: "reel",      subtype: "utilidade" };
  if (f.includes("opinião") && f.includes("reel"))            return { format: "reel",      subtype: "opiniao" };
  if (f.includes("carrossel") && f.includes("utilidade"))     return { format: "carrossel", subtype: "utilidade" };
  if (f.includes("carrossel") && f.includes("infotenimento")) return { format: "carrossel", subtype: "infotenimento" };
  if (f.includes("carrossel") && f.includes("narrativa"))     return { format: "carrossel", subtype: "opiniao" };
  if (f.includes("carrossel") && f.includes("vendas"))        return { format: "carrossel", subtype: "vendas" };
  if (f.includes("carrossel"))                                return { format: "carrossel", subtype: "utilidade" };
  if (f.includes("threads") || f.includes("/x"))              return { format: "post",      subtype: "twitter" };
  if (f.includes("story"))                                    return { format: "story",     subtype: "narrativaDensa" };
  if (f.includes("post"))                                     return { format: "post",      subtype: "instagram" };
  return { format: "reel", subtype: "viral7s" };
}

export default function CalendarioPlanner() {
  const { user } = useUser();

  const [fase, setFase] = useState<"form" | "loading" | "tabela" | "bulk" | "bulkDone">("form");
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState<FormCalendario>({
    dias: 7,
    formatos: [],
    objectivo: "",
    dataInicio: "",
  });
  const [diasCustom, setDiasCustom] = useState(false);
  const [rows, setRows] = useState<CalendarioRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Bulk generation
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
  const [expandedBulk, setExpandedBulk] = useState<string | null>(null);
  const [copiedBulk, setCopiedBulk] = useState<string | null>(null);

  const editorialLines = (user?.unsafeMetadata?.editorialLines as EditorialLine[]) ?? [];
  const temEditorias = editorialLines.length > 0;

  const formPreenchido =
    form.dias > 0 &&
    form.formatos.length > 0 &&
    form.objectivo !== "" &&
    form.dataInicio !== "";

  function toggleFormato(id: string) {
    setForm((prev) => ({
      ...prev,
      formatos: prev.formatos.includes(id)
        ? prev.formatos.filter((f) => f !== id)
        : [...prev.formatos, id],
    }));
  }

  function updateRow(index: number, field: keyof CalendarioRow, value: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function copiarBulk(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedBulk(id);
    setTimeout(() => setCopiedBulk(null), 2000);
  }

  // Guarda o conteúdo na fila de design do Clerk e abre o editor
  async function criarCarrossel(r: BulkResult) {
    if (user) {
      try {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            designQueue: {
              rawContent: r.content,
              tema: r.row.tema,
              formato: r.row.formato,
            },
          },
        });
      } catch { /* abre na mesma */ }
    }
    window.open("/design", "_blank");
  }

  // Guarda calendário no Clerk e vai para /content
  async function guardarEIr() {
    setGuardando(true);
    try {
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            calendarioRows: rows,
            calendarioComplete: true,
          },
        });
      }
    } catch { /* abre na mesma */ }
    window.open("/content", "_blank");
    setGuardando(false);
  }

  // Gera o conteúdo para TODOS os posts do calendário sequencialmente
  async function gerarBulk() {
    setFase("bulk");
    setBulkProgress(0);
    setBulkResults([]);

    const vozDNA = user?.unsafeMetadata?.vozDNA ?? {};
    const results: BulkResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mapeado = mapFormato(row.formato);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            format: mapeado.format,
            subtype: mapeado.subtype,
            topic: row.tema,
            vozDNA,
          }),
        });
        const data = await res.json();
        results.push({
          row,
          content: data.content ?? "",
          error: res.ok ? undefined : (data.error ?? "Erro desconhecido"),
        });
      } catch {
        results.push({ row, content: "", error: "Erro de ligação" });
      }

      setBulkProgress(i + 1);
      setBulkResults([...results]);

      // Pequena pausa entre pedidos para não sobrecarregar a API
      if (i < rows.length - 1) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    setFase("bulkDone");
  }

  async function gerarCalendario() {
    setFase("loading");
    setError(null);

    try {
      const res = await fetch("/api/calendario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, editorialLines }),
      });

      let data: { calendario?: Omit<CalendarioRow, "id">[]; error?: string };
      try {
        data = await res.json();
      } catch {
        setError("A geração demorou demasiado. Tenta novamente — pode demorar até 60 segundos.");
        setFase("form");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Erro ao gerar calendário.");
        setFase("form");
        return;
      }

      if (!data.calendario || data.calendario.length === 0) {
        setError("Resposta inválida da IA. Tenta novamente.");
        setFase("form");
        return;
      }

      const rowsComId = data.calendario.map((row, i) => ({ ...row, id: `row-${i}` }));
      setRows(rowsComId);
      setFase("tabela");
    } catch {
      setError("Erro de ligação. Verifica a tua conexão e tenta novamente.");
      setFase("form");
    }
  }

  // Mapa de cores por linha editorial
  const coresEditorias: Record<string, { bg: string; text: string }> = {};
  editorialLines.forEach((ed, i) => {
    coresEditorias[ed.nome] = coresPaleta[i % coresPaleta.length];
  });

  // ─── LOADING (calendário) ────────────────────────────────────────────────
  if (fase === "loading") {
    const total = form.dias * form.formatos.length;
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-12 h-12 border-2 border-[#BFD64B]/30 border-t-[#BFD64B] rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-[#F0ECE4] font-semibold">A construir o teu calendário estratégico...</p>
          <p className="text-[#8892a4] text-sm mt-1">
            {form.dias} dias × {form.formatos.length} formato(s)/dia = {total} posts. Pode demorar até 60 segundos.
          </p>
        </div>
      </div>
    );
  }

  // ─── BULK (a gerar conteúdo) ────────────────────────────────────────────
  if (fase === "bulk") {
    const percentagem = Math.round((bulkProgress / rows.length) * 100);
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-4">
            A GERAR CONTEÚDO
          </div>
          <h1 className="text-2xl font-bold text-[#F0ECE4] mb-2">
            {bulkProgress} de {rows.length} posts gerados
          </h1>
          <p className="text-[#8892a4] text-sm">
            A IA está a escrever o conteúdo para cada post do teu calendário...
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="bg-[#1a2035] rounded-full h-3 mb-8 overflow-hidden">
          <div
            className="bg-[#BFD64B] h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentagem}%` }}
          />
        </div>
        <p className="text-center text-[#BFD64B] text-sm font-bold mb-10">{percentagem}%</p>

        {/* Posts já gerados */}
        {bulkResults.length > 0 && (
          <div className="flex flex-col gap-2">
            {bulkResults.map((r, i) => (
              <div
                key={i}
                className={`rounded-xl border px-4 py-3 flex items-center gap-3 text-sm ${
                  r.error
                    ? "border-red-500/30 bg-red-900/10"
                    : "border-[#BFD64B]/30 bg-[#BFD64B]/5"
                }`}
              >
                <span className={r.error ? "text-red-400" : "text-[#BFD64B]"}>
                  {r.error ? "✗" : "✓"}
                </span>
                <span className="text-[#8892a4] text-xs w-20 shrink-0">{r.row.data}</span>
                <span className="text-[#F0ECE4] truncate flex-1">{r.row.tema}</span>
                <span className="text-[#4a5568] text-xs shrink-0">{r.row.formato}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── BULK DONE (resultados) ──────────────────────────────────────────────
  if (fase === "bulkDone") {
    const sucessos = bulkResults.filter((r) => !r.error).length;
    const erros = bulkResults.filter((r) => r.error).length;
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-4">
            CONTEÚDO GERADO
          </div>
          <h1 className="text-2xl font-bold text-[#F0ECE4] mb-2">
            {sucessos} posts escritos {erros > 0 && `· ${erros} com erro`}
          </h1>
          <p className="text-[#8892a4] text-sm">
            Todo o conteúdo foi guardado no teu histórico. Clica em cada post para ver e copiar.
          </p>
        </div>

        <div className="flex gap-3 justify-center mb-8">
          <a
            href="/content"
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold py-3 px-6 rounded-xl text-sm hover:opacity-90 transition-all"
          >
            Ver Histórico →
          </a>
          <button
            onClick={() => setFase("tabela")}
            className="text-[#8892a4] text-sm hover:text-[#BFD64B] transition-colors px-4 py-3"
          >
            ← Voltar ao calendário
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {bulkResults.map((r, i) => (
            <div
              key={i}
              className="bg-[#111827] border border-[#1a2035] rounded-xl overflow-hidden"
            >
              {/* Header do post */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1a2035] transition-colors"
                onClick={() => setExpandedBulk(expandedBulk === r.row.id ? null : r.row.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-sm shrink-0 ${r.error ? "text-red-400" : "text-[#BFD64B]"}`}>
                    {r.error ? "✗" : "✓"}
                  </span>
                  <span className="text-[#8892a4] text-xs shrink-0 w-20">{r.row.data}</span>
                  <span className="text-[#F0ECE4] text-sm truncate">{r.row.tema}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[#4a5568] text-xs hidden sm:block">{r.row.formato}</span>
                  <span className="text-[#8892a4] text-xs">{expandedBulk === r.row.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Conteúdo expandido */}
              {expandedBulk === r.row.id && (
                <div className="px-4 pb-4">
                  {r.error ? (
                    <p className="text-red-400 text-sm py-2">Erro: {r.error}</p>
                  ) : (
                    <>
                      <pre className="text-[#F0ECE4] text-sm leading-relaxed whitespace-pre-wrap font-sans bg-[#0d1420] rounded-lg p-4 mb-3 max-h-96 overflow-y-auto">
                        {r.content}
                      </pre>
                      <div className="flex gap-3">
                        <button
                          onClick={() => copiarBulk(r.row.id, r.content)}
                          className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                            copiedBulk === r.row.id
                              ? "bg-[#BFD64B] text-[#0A0E1A]"
                              : "border border-[#2a3555] text-[#8892a4] hover:border-[#BFD64B]/50 hover:text-[#F0ECE4]"
                          }`}
                        >
                          {copiedBulk === r.row.id ? "✓ Copiado!" : "Copiar"}
                        </button>
                        {r.row.formato.toLowerCase().includes("carrossel") && (
                          <button
                            onClick={() => criarCarrossel(r)}
                            className="text-xs font-bold px-4 py-2 rounded-lg transition-all bg-[#BFD64B]/10 border border-[#BFD64B]/40 text-[#BFD64B] hover:bg-[#BFD64B]/20"
                          >
                            ✨ Criar Design ↗
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── TABELA ──────────────────────────────────────────────────────────────
  if (fase === "tabela") {
    return (
      <div className="max-w-7xl mx-auto py-8">

        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-3">
              CALENDÁRIO GERADO
            </div>
            <h1 className="text-2xl font-bold text-[#F0ECE4]">
              {form.dias} dias · {form.formatos.length} formato(s)/dia · {rows.length} posts
            </h1>
            <p className="text-[#8892a4] text-sm mt-1">
              Ajusta os temas se quiseres — depois gera o conteúdo de todos de uma vez.
            </p>
          </div>
          <button
            onClick={() => setFase("form")}
            className="text-[#8892a4] text-sm hover:text-[#BFD64B] transition-colors shrink-0 pt-1"
          >
            ↺ Novo calendário
          </button>
        </div>

        {/* Legenda das editorias */}
        {editorialLines.length > 0 && (
          <div className="flex gap-4 mb-6 flex-wrap">
            {editorialLines.map((ed, i) => {
              const cor = coresPaleta[i % coresPaleta.length];
              return (
                <span
                  key={ed.nome}
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: cor.bg, color: cor.text }}
                >
                  {ed.nome}
                </span>
              );
            })}
          </div>
        )}

        {/* Tabela */}
        <div className="overflow-x-auto rounded-xl border border-[#1a2035] mb-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0d1420] border-b border-[#1a2035]">
                {["DATA", "FORMATO", "LINHA EDITORIAL", "TEMA / TÍTULO ✎", "PLATAFORMA ✎", "LÓGICA ✎"].map((col, i) => (
                  <th
                    key={col}
                    className={`text-left text-[10px] font-bold tracking-widest px-4 py-3 ${
                      i >= 3 ? "text-[#BFD64B]/60" : "text-[#4a5568]"
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const cor = coresEditorias[row.linhaEditorial] ?? coresPaleta[0];
                const isEven = i % 2 === 0;
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-[#1a2035] ${isEven ? "bg-[#0A0E1A]" : "bg-[#0d1218]"} hover:bg-[#111827] transition-colors`}
                  >
                    <td className="px-4 py-3 text-[#8892a4] font-mono text-xs whitespace-nowrap">{row.data}</td>
                    <td className="px-4 py-3 text-[#F0ECE4] font-medium text-xs whitespace-nowrap">{row.formato}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-bold tracking-wide px-2 py-1 rounded-md whitespace-nowrap"
                        style={{ background: cor.bg, color: cor.text }}
                      >
                        {row.linhaEditorial}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[220px]">
                      <input
                        value={row.tema}
                        onChange={(e) => updateRow(i, "tema", e.target.value)}
                        className="w-full bg-transparent text-[#F0ECE4] text-sm focus:outline-none focus:bg-[#1a2640] focus:px-2 focus:rounded-lg transition-all"
                        placeholder="Escreve o tema..."
                      />
                    </td>
                    <td className="px-4 py-3 min-w-[100px]">
                      <input
                        value={row.plataforma}
                        onChange={(e) => updateRow(i, "plataforma", e.target.value)}
                        className="w-full bg-transparent text-[#8892a4] text-xs focus:outline-none focus:bg-[#1a2640] focus:px-2 focus:rounded-lg transition-all"
                        placeholder="Plataforma..."
                      />
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <input
                        value={row.logica}
                        onChange={(e) => updateRow(i, "logica", e.target.value)}
                        className="w-full bg-transparent text-[#8892a4] text-xs italic focus:outline-none focus:bg-[#1a2640] focus:px-2 focus:rounded-lg transition-all"
                        placeholder="Lógica estratégica..."
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4">
          {/* CTA principal — Gerar tudo */}
          <button
            onClick={gerarBulk}
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold py-4 px-10 rounded-xl text-lg hover:opacity-90 transition-all flex items-center gap-3"
          >
            <span>🚀</span>
            Gerar conteúdo para todos os {rows.length} posts
          </button>
          <p className="text-[#4a5568] text-xs">
            A IA escreve o roteiro/copy de cada post. Tudo guardado no histórico automaticamente.
          </p>

          {/* CTAs secundários */}
          <div className="flex gap-6 mt-2">
            <button
              onClick={guardarEIr}
              disabled={guardando}
              className="text-[#8892a4] text-sm hover:text-[#BFD64B] transition-colors disabled:opacity-50"
            >
              {guardando ? "A guardar..." : "Guardar e criar posts um a um ↗"}
            </button>
            <a href="/content" className="text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors">
              Ir para conteúdo sem guardar →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── FORMULÁRIO ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto py-8">

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
          CALENDÁRIO DE CONTEÚDO
        </div>
        <h1 className="text-3xl font-bold text-[#F0ECE4] mb-3">
          O teu plano estratégico
        </h1>
        <p className="text-[#8892a4] leading-relaxed">
          Define as regras. A IA monta o calendário — com temas reais para cada post.
        </p>
        <div className="mt-5 pt-5 border-t border-[#1a2035]">
          <p className="text-[#4a5568] text-xs mb-2">Queres criar apenas 1 post agora?</p>
          <a
            href="/content"
            className="text-[#8892a4] text-sm hover:text-[#BFD64B] transition-colors font-medium"
          >
            Saltar este passo → Ir para Conteúdo
          </a>
        </div>
      </div>

      {!temEditorias && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 mb-8">
          <p className="text-amber-400 text-sm">
            Ainda não criaste as tuas Linhas Editoriais.{" "}
            <a href="/editorial" className="underline hover:text-amber-300 font-semibold">
              Completa o passo Editorial primeiro →
            </a>
          </p>
        </div>
      )}

      {temEditorias && (
        <div className="bg-[#BFD64B]/5 border border-[#BFD64B]/20 rounded-xl p-4 mb-8">
          <p className="text-[10px] font-bold tracking-widest text-[#BFD64B] mb-2">LINHAS EDITORIAIS DETECTADAS</p>
          <div className="flex flex-wrap gap-3">
            {editorialLines.map((ed, i) => {
              const cor = coresPaleta[i % coresPaleta.length];
              return (
                <span
                  key={i}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: cor.bg, color: cor.text }}
                >
                  {ed.numero}. {ed.nome}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-8">

        <div>
          <label className="block text-xs font-bold tracking-widest text-[#8892a4] mb-3">
            1. QUANTOS DIAS DE CALENDÁRIO?
          </label>
          <div className="flex gap-3 flex-wrap">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => { setForm({ ...form, dias: d }); setDiasCustom(false); }}
                className={`px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  form.dias === d && !diasCustom
                    ? "bg-[#BFD64B] border-[#BFD64B] text-[#0A0E1A]"
                    : "bg-[#111827] border-[#1a2035] text-[#8892a4] hover:border-[#BFD64B]/40"
                }`}
              >
                {d} dias
              </button>
            ))}
            <button
              onClick={() => { setDiasCustom(true); setForm({ ...form, dias: 0 }); }}
              className={`px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                diasCustom
                  ? "bg-[#BFD64B] border-[#BFD64B] text-[#0A0E1A]"
                  : "bg-[#111827] border-[#1a2035] text-[#8892a4] hover:border-[#BFD64B]/40"
              }`}
            >
              Outro
            </button>
          </div>
          {diasCustom && (
            <input
              type="number"
              min={1}
              max={90}
              value={form.dias || ""}
              onChange={(e) => setForm({ ...form, dias: parseInt(e.target.value) || 0 })}
              placeholder="Quantos dias? (máx. 90)"
              className="mt-3 bg-[#111827] border border-[#1a2035] rounded-xl px-4 py-3 text-[#F0ECE4] focus:border-[#BFD64B]/50 focus:outline-none w-48 text-sm"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-[#8892a4] mb-3">
            2. QUE FORMATOS PUBLICAS POR DIA? <span className="text-[#4a5568] normal-case font-normal">(selecciona todos)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {formatosDisponiveis.map((f) => {
              const activo = form.formatos.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFormato(f.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    activo
                      ? "bg-[#BFD64B]/10 border-[#BFD64B]/50"
                      : "bg-[#111827] border-[#1a2035] hover:border-[#BFD64B]/20"
                  }`}
                >
                  <span className="text-xl block mb-1">{f.icon}</span>
                  <span className={`text-xs font-bold block ${activo ? "text-[#BFD64B]" : "text-[#F0ECE4]"}`}>
                    {f.label}
                  </span>
                  <span className="text-[10px] text-[#4a5568] leading-tight block mt-0.5">{f.desc}</span>
                </button>
              );
            })}
          </div>
          {form.formatos.length > 0 && form.dias > 0 && (
            <p className="text-xs text-[#BFD64B] mt-3 font-semibold">
              ✓ {form.formatos.length} formato(s)/dia → {form.dias * form.formatos.length} posts no total
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-[#8892a4] mb-3">
            3. QUAL É O TEU OBJECTIVO NESTE PERÍODO?
          </label>
          <div className="grid gap-3">
            {objectivos.map((o) => (
              <button
                key={o.id}
                onClick={() => setForm({ ...form, objectivo: o.id })}
                className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                  form.objectivo === o.id
                    ? "bg-[#BFD64B]/10 border-[#BFD64B]/50"
                    : "bg-[#111827] border-[#1a2035] hover:border-[#BFD64B]/20"
                }`}
              >
                <span className="text-2xl">{o.icon}</span>
                <div>
                  <span className={`text-sm font-bold block ${form.objectivo === o.id ? "text-[#BFD64B]" : "text-[#F0ECE4]"}`}>
                    {o.label}
                  </span>
                  <span className="text-xs text-[#4a5568]">{o.desc}</span>
                </div>
                {form.objectivo === o.id && <span className="ml-auto text-[#BFD64B] text-lg">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-[#8892a4] mb-3">
            4. QUANDO COMEÇAS?
          </label>
          <input
            type="date"
            value={form.dataInicio}
            onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
            className="bg-[#111827] border border-[#1a2035] rounded-xl px-4 py-3 text-[#F0ECE4] focus:border-[#BFD64B]/50 focus:outline-none [color-scheme:dark]"
          />
        </div>

      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mt-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={gerarCalendario}
        disabled={!formPreenchido}
        className="w-full bg-[#BFD64B] text-[#0A0E1A] font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-8"
      >
        Gerar Calendário
      </button>
      {!formPreenchido && (
        <p className="text-center text-[#4a5568] text-xs mt-2">
          Responde a todas as perguntas para continuar
        </p>
      )}
    </div>
  );
}
