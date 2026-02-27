"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Editoria {
  numero: string;
  nome: string;
  temaCentral: string;
  perspectivaUnica: string;
  tomDeVoz: string;
  expressoes: string[];
  vocabulario: string[];
  elementosObrigatorios: string[];
  publicoAlvo: string[];
  tensaoCentral: string;
  temasEPautas: string[];
}

interface FormData {
  especialidade: string;
  publicoAlvo: string;
  transformacao: string;
  diferenciacao: string;
}

const camposVazios: FormData = {
  especialidade: "",
  publicoAlvo: "",
  transformacao: "",
  diferenciacao: "",
};

export default function EditorialLines() {
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(camposVazios);
  const [editorias, setEditorias] = useState<Editoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [gerado, setGerado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const preenchido = Object.values(form).every((v) => v.trim().length >= 10);

  async function irParaCalendario() {
    if (!user || editorias.length === 0) return;
    setGuardando(true);
    setError(null);
    try {
      // Guarda apenas os dados essenciais das editorias no Clerk
      const editorialMinimal = editorias.map((ed) => ({
        numero: ed.numero,
        nome: ed.nome,
        temaCentral: ed.temaCentral,
        tensaoCentral: ed.tensaoCentral,
      }));
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          editorialLines: editorialMinimal,
          editorialComplete: true,
        },
      });
      router.push("/calendario");
    } catch {
      setError("Erro ao guardar. Tenta novamente.");
      setGuardando(false);
    }
  }

  async function gerarLinhaEditorial() {
    if (!preenchido) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/editorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form }),
      });

      let data: { editorias?: Editoria[]; error?: string };
      try {
        data = await res.json();
      } catch {
        setError("A geração demorou demasiado. Tenta novamente — pode demorar até 60 segundos.");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Erro ao gerar linha editorial.");
        return;
      }

      if (!data.editorias || data.editorias.length === 0) {
        setError("Resposta inválida da IA. Tenta novamente.");
        return;
      }

      setEditorias(data.editorias);
      setGerado(true);
      setActiveTab(0);
    } catch {
      setError("Erro de ligação. Verifica a tua conexão e tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  const cores = [
    { bg: "rgba(191,214,75,0.08)", border: "rgba(191,214,75,0.3)", accent: "#BFD64B" },
    { bg: "rgba(99,179,237,0.08)", border: "rgba(99,179,237,0.3)", accent: "#63B3ED" },
    { bg: "rgba(252,129,74,0.08)", border: "rgba(252,129,74,0.3)", accent: "#FC814A" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-12 h-12 border-2 border-[#BFD64B]/30 border-t-[#BFD64B] rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-[#F0ECE4] font-semibold">A construir a tua arquitectura editorial...</p>
          <p className="text-[#8892a4] text-sm mt-1">Pode demorar um momento.</p>
        </div>
      </div>
    );
  }

  if (!gerado) {
    return (
      <div className="max-w-2xl mx-auto py-8">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
            LINHA EDITORIAL
          </div>
          <h1 className="text-3xl font-bold text-[#F0ECE4] mb-3">
            A tua arquitectura de conteúdo
          </h1>
          <p className="text-[#8892a4] leading-relaxed">
            Responde a 4 perguntas. O Claude cria as tuas 3 editorias — os pilares que estruturam toda a tua comunicação.
          </p>
        </div>

        <div className="space-y-5 mb-8">

          <div>
            <label className="block text-xs font-bold tracking-widest text-[#8892a4] mb-2">
              1. QUAL É A TUA ESPECIALIDADE E O QUE FAZES MELHOR QUE NINGUÉM?
            </label>
            <textarea
              value={form.especialidade}
              onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
              placeholder="Ex: Ajudo solopreneurs a construir sistemas de conteúdo automatizados com IA. A minha especialidade é transformar conhecimento disperso em máquinas de geração de leads..."
              className="w-full bg-[#111827] border border-[#1a2035] rounded-xl p-4 text-[#F0ECE4] placeholder-[#3a4555] text-sm resize-none focus:border-[#BFD64B]/50 focus:outline-none transition-colors"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest text-[#8892a4] mb-2">
              2. PARA QUEM TRABALHAS E QUAL É A DOR MAIS PROFUNDA DELES?
            </label>
            <textarea
              value={form.publicoAlvo}
              onChange={(e) => setForm({ ...form, publicoAlvo: e.target.value })}
              placeholder="Ex: Solopreneurs com 2-5 anos de negócio que criam muito conteúdo mas não geram leads consistentes. A dor real: trabalham muito, crescem pouco, sentem que fazem tudo certo mas os resultados não aparecem..."
              className="w-full bg-[#111827] border border-[#1a2035] rounded-xl p-4 text-[#F0ECE4] placeholder-[#3a4555] text-sm resize-none focus:border-[#BFD64B]/50 focus:outline-none transition-colors"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest text-[#8892a4] mb-2">
              3. QUE TRANSFORMAÇÃO CONCRETA ENTREGAS? QUAL É O RESULTADO FINAL DO CLIENTE?
            </label>
            <textarea
              value={form.transformacao}
              onChange={(e) => setForm({ ...form, transformacao: e.target.value })}
              placeholder="Ex: O cliente passa de criar conteúdo aleatório para ter um sistema que gera leads todos os dias. Em 90 dias tem fluxo de conteúdo automatizado, funil activo e primeiros clientes do conteúdo..."
              className="w-full bg-[#111827] border border-[#1a2035] rounded-xl p-4 text-[#F0ECE4] placeholder-[#3a4555] text-sm resize-none focus:border-[#BFD64B]/50 focus:outline-none transition-colors"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest text-[#8892a4] mb-2">
              4. O QUE TE DIFERENCIA? CONTRA O QUE TE POSICIONAS NO MERCADO?
            </label>
            <textarea
              value={form.diferenciacao}
              onChange={(e) => setForm({ ...form, diferenciacao: e.target.value })}
              placeholder="Ex: Contra gurus que vendem hacks isolados. Contra freelancers que entregam peças sem estratégia. Eu construo infraestrutura — não posts, não prompts, não ferramentas. Sistema integrado do zero ao lead..."
              className="w-full bg-[#111827] border border-[#1a2035] rounded-xl p-4 text-[#F0ECE4] placeholder-[#3a4555] text-sm resize-none focus:border-[#BFD64B]/50 focus:outline-none transition-colors"
              rows={3}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={gerarLinhaEditorial}
          disabled={!preenchido}
          className="w-full bg-[#BFD64B] text-[#0A0E1A] font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Gerar Linha Editorial
        </button>
        {!preenchido && (
          <p className="text-center text-[#4a5568] text-xs mt-2">
            Preenche todos os campos para continuar
          </p>
        )}
      </div>
    );
  }

  const editoria = editorias[activeTab];
  const cor = cores[activeTab];

  return (
    <div className="max-w-3xl mx-auto py-8">

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-4">
          LINHA EDITORIAL GERADA
        </div>
        <h1 className="text-2xl font-bold text-[#F0ECE4]">
          A tua arquitectura de conteúdo
        </h1>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {editorias.map((ed, i) => (
          <button
            key={ed.numero}
            onClick={() => setActiveTab(i)}
            className="p-3 rounded-xl border-2 text-left transition-all"
            style={
              activeTab === i
                ? { background: cores[i].bg, borderColor: cores[i].border }
                : { background: "#111827", borderColor: "#1a2035" }
            }
          >
            <span
              className="text-xs font-bold block mb-1"
              style={{ color: activeTab === i ? cores[i].accent : "#4a5568" }}
            >
              EDITORIA {ed.numero}
            </span>
            <span
              className="text-xs font-semibold leading-tight"
              style={{ color: activeTab === i ? "#F0ECE4" : "#8892a4" }}
            >
              {ed.nome}
            </span>
          </button>
        ))}
      </div>

      {editoria && (
        <div className="space-y-5">

          <div className="rounded-xl p-5 border" style={{ background: cor.bg, borderColor: cor.border }}>
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: cor.accent }}>TEMA CENTRAL</p>
            <p className="text-[#F0ECE4] leading-relaxed">{editoria.temaCentral}</p>
          </div>

          <div className="bg-[#111827] border border-[#1a2035] rounded-xl p-5">
            <p className="text-xs font-bold tracking-widest text-[#8892a4] mb-2">PERSPECTIVA ÚNICA</p>
            <p className="text-[#F0ECE4] leading-relaxed">{editoria.perspectivaUnica}</p>
          </div>

          <div className="bg-[#0d1420] border-l-4 rounded-r-xl p-5" style={{ borderColor: cor.accent }}>
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: cor.accent }}>TENSÃO CENTRAL DO LEITOR</p>
            <p className="text-[#F0ECE4] text-lg font-semibold italic">&ldquo;{editoria.tensaoCentral}&rdquo;</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#111827] border border-[#1a2035] rounded-xl p-5">
              <p className="text-xs font-bold tracking-widest text-[#8892a4] mb-3">TOM DE VOZ</p>
              <p className="text-[#F0ECE4] text-sm leading-relaxed">{editoria.tomDeVoz}</p>
            </div>
            <div className="bg-[#111827] border border-[#1a2035] rounded-xl p-5">
              <p className="text-xs font-bold tracking-widest text-[#8892a4] mb-3">FRASES CARACTERÍSTICAS</p>
              <ul className="space-y-2">
                {editoria.expressoes.map((exp, i) => (
                  <li key={i} className="text-[#F0ECE4] text-sm flex gap-2">
                    <span style={{ color: cor.accent }}>›</span>
                    <span>&ldquo;{exp}&rdquo;</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1a2035] rounded-xl p-5">
            <p className="text-xs font-bold tracking-widest text-[#8892a4] mb-3">VOCABULÁRIO DA EDITORIA</p>
            <div className="flex flex-wrap gap-2">
              {editoria.vocabulario.map((word) => (
                <span key={word} className="text-xs font-medium px-3 py-1 rounded-full border"
                  style={{ borderColor: cor.border, color: cor.accent, background: cor.bg }}>
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#111827] border border-[#1a2035] rounded-xl p-5">
              <p className="text-xs font-bold tracking-widest text-[#8892a4] mb-3">PÚBLICO-ALVO</p>
              <ul className="space-y-2">
                {editoria.publicoAlvo.map((item, i) => (
                  <li key={i} className="text-[#8892a4] text-sm flex gap-2">
                    <span style={{ color: cor.accent }}>•</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#111827] border border-[#1a2035] rounded-xl p-5">
              <p className="text-xs font-bold tracking-widest text-[#8892a4] mb-3">ELEMENTOS OBRIGATÓRIOS</p>
              <ul className="space-y-2">
                {editoria.elementosObrigatorios.map((item, i) => (
                  <li key={i} className="text-[#8892a4] text-sm flex gap-2">
                    <span style={{ color: cor.accent }}>✓</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1a2035] rounded-xl p-5">
            <p className="text-xs font-bold tracking-widest text-[#8892a4] mb-3">TEMAS E PAUTAS</p>
            <div className="grid md:grid-cols-2 gap-2">
              {editoria.temasEPautas.map((tema, i) => (
                <div key={i} className="flex gap-2 items-start p-2 rounded-lg" style={{ background: cor.bg }}>
                  <span className="text-xs font-bold mt-0.5" style={{ color: cor.accent }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[#F0ECE4] text-sm">{tema}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={irParaCalendario}
              disabled={guardando}
              className="bg-[#BFD64B] text-[#0A0E1A] font-bold py-4 px-10 rounded-xl text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
            >
              {guardando ? "A guardar..." : "Criar Calendário →"}
            </button>
            <button
              onClick={() => { setGerado(false); setForm(camposVazios); setError(null); }}
              className="text-[#8892a4] text-sm hover:text-[#BFD64B] transition-colors py-2 px-4"
            >
              ↺ Recomeçar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
