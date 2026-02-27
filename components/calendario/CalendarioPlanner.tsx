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

export default function CalendarioPlanner() {
  const { user } = useUser();
  const [fase, setFase] = useState<"form" | "loading" | "tabela">("form");
  const [form, setForm] = useState<FormCalendario>({
    dias: 7,
    formatos: [],
    objectivo: "",
    dataInicio: "",
  });
  const [diasCustom, setDiasCustom] = useState(false);
  const [rows, setRows] = useState<CalendarioRow[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  // Mapa de cores por linha editorial (baseado na posição)
  const coresEditorias: Record<string, { bg: string; text: string }> = {};
  editorialLines.forEach((ed, i) => {
    coresEditorias[ed.nome] = coresPaleta[i % coresPaleta.length];
  });

  // --- LOADING ---
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

  // --- TABELA ---
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
              Clica em qualquer célula a amarelo para editar — Tema, Plataforma e Lógica são editáveis.
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

        <div className="overflow-x-auto rounded-xl border border-[#1a2035]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0d1420] border-b border-[#1a2035]">
                {["DATA", "FORMATO", "LINHA EDITORIAL", "TEMA / TÍTULO", "PLATAFORMA", "LÓGICA"].map((col, i) => (
                  <th
                    key={col}
                    className={`text-left text-[10px] font-bold tracking-widest px-4 py-3 ${
                      i >= 3 ? "text-[#BFD64B]/60" : "text-[#4a5568]"
                    }`}
                  >
                    {col}{i >= 3 && " ✎"}
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
                    {/* DATA */}
                    <td className="px-4 py-3 text-[#8892a4] font-mono text-xs whitespace-nowrap">
                      {row.data}
                    </td>
                    {/* FORMATO */}
                    <td className="px-4 py-3 text-[#F0ECE4] font-medium text-xs whitespace-nowrap">
                      {row.formato}
                    </td>
                    {/* LINHA EDITORIAL */}
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-bold tracking-wide px-2 py-1 rounded-md whitespace-nowrap"
                        style={{ background: cor.bg, color: cor.text }}
                      >
                        {row.linhaEditorial}
                      </span>
                    </td>
                    {/* TEMA — editável */}
                    <td className="px-4 py-3 min-w-[220px]">
                      <input
                        value={row.tema}
                        onChange={(e) => updateRow(i, "tema", e.target.value)}
                        className="w-full bg-transparent text-[#F0ECE4] text-sm focus:outline-none focus:bg-[#1a2640] focus:px-2 focus:rounded-lg transition-all"
                        placeholder="Escreve o tema..."
                      />
                    </td>
                    {/* PLATAFORMA — editável */}
                    <td className="px-4 py-3 min-w-[100px]">
                      <input
                        value={row.plataforma}
                        onChange={(e) => updateRow(i, "plataforma", e.target.value)}
                        className="w-full bg-transparent text-[#8892a4] text-xs focus:outline-none focus:bg-[#1a2640] focus:px-2 focus:rounded-lg transition-all"
                        placeholder="Plataforma..."
                      />
                    </td>
                    {/* LÓGICA — editável */}
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

        {/* Botão próximo passo */}
        <div className="flex justify-center mt-10">
          <a
            href="/content"
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold py-4 px-10 rounded-xl text-lg hover:opacity-90 transition-all"
          >
            Gerar Conteúdo →
          </a>
        </div>
      </div>
    );
  }

  // --- FORMULÁRIO ---
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
      </div>

      {/* Aviso se não tem editorias */}
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

      {/* Editorias detectadas */}
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

        {/* Pergunta 1 — Dias */}
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

        {/* Pergunta 2 — Formatos */}
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

        {/* Pergunta 3 — Objectivo */}
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
                {form.objectivo === o.id && (
                  <span className="ml-auto text-[#BFD64B] text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pergunta 4 — Data de início */}
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
