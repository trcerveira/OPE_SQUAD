"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Entrevista de 9 perguntas que gera o manifesto personalizado via Claude
// Modelada a partir do processo do "Manifestador" GPT

type Fase =
  | "intro"
  | "bloco1"
  | "bloco2"
  | "bloco3"
  | "gerando"
  | "manifesto";

interface Respostas {
  especialidade: string;
  personalidade: string;
  irritacoes: string;
  publicoAlvo: string;
  transformacao: string;
  resultados: string;
  crencas: string;
  proposito: string;
  visao: string;
}

interface ManifestoBloco {
  numero: string;
  titulo: string;
  corpo: string;
  destaque: string;
}

const perguntasPorBloco = {
  bloco1: [
    {
      id: "especialidade" as const,
      titulo: "Quem és tu no mercado?",
      descricao:
        "Qual é a tua especialidade, o teu percurso e o que te diferencia de todos os outros? Quanto mais denso e honesto, melhor o manifesto.",
      placeholder:
        "Ex: Sou especialista em X, venho de Y anos nesta área. O que me diferencia é... Vejo o mercado de uma forma diferente porque...",
      tipo: "textarea" as const,
    },
    {
      id: "personalidade" as const,
      titulo: "A personalidade da tua marca",
      descricao:
        "Se a tua marca fosse uma pessoa, como seria? Rebelde, Cuidadora, Estrategista, Visionária, Disruptiva? Explica o porquê.",
      placeholder:
        "Ex: A minha marca é Rebelde porque recuso os atalhos e as promessas vazias. É também Estrategista porque...",
      tipo: "textarea" as const,
    },
    {
      id: "irritacoes" as const,
      titulo: "O que te irrita no teu mercado?",
      descricao:
        "O que discordas profundamente? O que te recusas a fazer? O que te dá nojo no teu nicho? Sê brutal.",
      placeholder:
        "Ex: Odeio quando... Recuso-me a... O que me irrita é ver... Nunca vou fazer...",
      tipo: "textarea" as const,
    },
  ],
  bloco2: [
    {
      id: "publicoAlvo" as const,
      titulo: "O teu cliente ideal",
      descricao:
        "Quem é exatamente? Qual é a sua dor mais profunda, o que ninguém vê neles, o que os prende?",
      placeholder:
        "Ex: O meu cliente tem X anos, faz Y, e a dor que ninguém fala é... O que eles não vêem em si mesmos é...",
      tipo: "textarea" as const,
    },
    {
      id: "transformacao" as const,
      titulo: "A tua promessa de transformação",
      descricao:
        'Completa esta frase: "Transformo ___ em ___ sem ___." Ou usa o formato que sentires mais autêntico.',
      placeholder:
        'Ex: "Transformo solopreneurs com conhecimento mas sem sistema em criadores consistentes, sem sacrificar 4 horas por dia."',
      tipo: "textarea" as const,
    },
    {
      id: "resultados" as const,
      titulo: "Resultados concretos",
      descricao:
        "O que consegue o teu cliente depois de trabalhar contigo? Sê específico: tempo, leads, vendas, clareza, paz mental.",
      placeholder:
        "Ex: Depois de trabalharem comigo, conseguem... Em X semanas, tipicamente... O que mais muda é...",
      tipo: "textarea" as const,
    },
  ],
  bloco3: [
    {
      id: "crencas" as const,
      titulo: "As tuas crenças mais fortes",
      descricao:
        "O que acreditas profundamente sobre conteúdo, negócios, consistência, automação e empreendedorismo digital?",
      placeholder:
        "Ex: Acredito que... Para mim é inegociável... O que a maioria não percebe é... A minha verdade sobre X é...",
      tipo: "textarea" as const,
    },
    {
      id: "proposito" as const,
      titulo: "O teu grande PORQUÊ",
      descricao:
        "Porque fazes isto verdadeiramente? Não a resposta bonita — a resposta real. O que te fez começar? O que te faz continuar?",
      placeholder:
        "Ex: Faço isto porque... O que me move é... Há uma ferida nisto? Uma promessa? Uma missão?",
      tipo: "textarea" as const,
    },
    {
      id: "visao" as const,
      titulo: "O teu impacto no mercado",
      descricao:
        "Se tiveres sucesso total, que mudança trazes para o mundo? O que se torna 'novo normal' por causa do teu trabalho?",
      placeholder:
        "Ex: Quero um mundo onde... Daqui a 10 anos, o que mudei foi... O meu legado é...",
      tipo: "textarea" as const,
    },
  ],
};

const tituloBlocos: Record<string, string> = {
  bloco1: "BLOCO 1 — A TUA ESSÊNCIA",
  bloco2: "BLOCO 2 — O TEU PÚBLICO E PROMESSA",
  bloco3: "BLOCO 3 — O TEU POSICIONAMENTO",
};

const proximaFase: Record<Fase, Fase> = {
  intro: "bloco1",
  bloco1: "bloco2",
  bloco2: "bloco3",
  bloco3: "gerando",
  gerando: "manifesto",
  manifesto: "manifesto",
};

const progresso: Record<Fase, number> = {
  intro: 0,
  bloco1: 25,
  bloco2: 50,
  bloco3: 75,
  gerando: 90,
  manifesto: 100,
};

export default function ManifestoAssessment() {
  const { user } = useUser();
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("intro");
  const [respostas, setRespostas] = useState<Respostas>({
    especialidade: "",
    personalidade: "",
    irritacoes: "",
    publicoAlvo: "",
    transformacao: "",
    resultados: "",
    crencas: "",
    proposito: "",
    visao: "",
  });
  const [blocos, setBlocos] = useState<ManifestoBloco[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [aceitando, setAceitando] = useState(false);
  const [aceito, setAceito] = useState(false);

  function handleChange(key: keyof Respostas, value: string) {
    setRespostas((prev) => ({ ...prev, [key]: value }));
  }

  // Verifica se todas as perguntas do bloco actual estão preenchidas
  function blocoValido(b: "bloco1" | "bloco2" | "bloco3"): boolean {
    return perguntasPorBloco[b].every(
      (p) => respostas[p.id].trim().length >= 10
    );
  }

  async function gerarManifesto() {
    setFase("gerando");
    setErro(null);
    try {
      const res = await fetch("/api/manifesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: respostas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");
      setBlocos(data.blocks);
      setFase("manifesto");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao gerar manifesto");
      setFase("bloco3");
    }
  }

  async function aceitarManifesto() {
    if (!user) return;
    setAceitando(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          manifestoComplete: true,
          manifestoAnswers: respostas,
        },
      });
      setAceito(true);
      setTimeout(() => router.push("/onboarding"), 1400);
    } catch {
      setAceitando(false);
    }
  }

  function avancar(blocoActual?: "bloco1" | "bloco2" | "bloco3") {
    if (blocoActual === "bloco3") {
      gerarManifesto();
    } else {
      setFase(proximaFase[fase]);
    }
  }

  // ── INTRO ──────────────────────────────────────────────────────────────
  if (fase === "intro") {
    return (
      <div className="min-h-[80vh] flex items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-8">
            PASSO 2 DE 4 — MANIFESTO
          </div>
          <h1 className="text-5xl font-black text-[#F0ECE4] mb-4 leading-tight">
            O teu Manifesto<br />
            <span className="text-[#BFD64B]">começa aqui.</span>
          </h1>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-6">
            Um manifesto genérico não serve para nada. O teu manifesto tem de
            soar exactamente como tu — com as tuas palavras, as tuas irritações
            e a tua visão.
          </p>
          <p className="text-[#8892a4] text-base leading-relaxed mb-10">
            Vais responder a <strong className="text-[#F0ECE4]">9 perguntas</strong> em 3 blocos.
            Depois o motor de IA gera o teu manifesto personalizado.
            Leva <strong className="text-[#F0ECE4]">10 a 15 minutos</strong>. Faz uma vez só.
          </p>

          <div className="flex flex-col gap-3 mb-10">
            {[
              { bloco: "Bloco 1", titulo: "A tua essência", desc: "Quem és, a tua marca, o que te irrita" },
              { bloco: "Bloco 2", titulo: "O teu público e promessa", desc: "Cliente ideal, transformação, resultados" },
              { bloco: "Bloco 3", titulo: "O teu posicionamento", desc: "Crenças, propósito, impacto no mercado" },
            ].map((item) => (
              <div key={item.bloco} className="flex items-center gap-4 bg-[#111827] border border-[#1a2035] rounded-xl px-5 py-4">
                <div className="text-[#BFD64B] text-xs font-bold tracking-widest w-16 flex-shrink-0">{item.bloco}</div>
                <div>
                  <div className="text-[#F0ECE4] font-bold text-sm">{item.titulo}</div>
                  <div className="text-[#8892a4] text-xs">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setFase("bloco1")}
            className="inline-flex items-center gap-3 bg-[#BFD64B] text-[#0A0E1A] font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-all"
          >
            Começar entrevista →
          </button>
        </div>
      </div>
    );
  }

  // ── GERANDO ─────────────────────────────────────────────────────────────
  if (fase === "gerando") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-[#BFD64B]/20 border-t-[#BFD64B] rounded-full animate-spin mx-auto mb-8" />
          <h2 className="text-2xl font-bold text-[#F0ECE4] mb-3">
            A criar o teu manifesto...
          </h2>
          <p className="text-[#8892a4] text-base leading-relaxed">
            O Claude está a analisar as tuas respostas e a escrever o teu
            manifesto na tua voz. Isto demora 15 a 30 segundos.
          </p>
        </div>
      </div>
    );
  }

  // ── MANIFESTO GERADO ────────────────────────────────────────────────────
  if (fase === "manifesto") {
    return (
      <div className="min-h-screen">
        {/* Barra de progresso */}
        <div className="h-1 bg-[#1a2035] mb-0">
          <div className="h-1 bg-[#BFD64B] w-full transition-all" />
        </div>

        {/* Cabeçalho */}
        <div className="border-b border-[#1a2035] px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
            O TEU MANIFESTO PERSONALIZADO
          </div>
          <h1 className="text-4xl font-black text-[#F0ECE4] mb-4 leading-tight">
            O Manifesto de{" "}
            <span className="text-[#BFD64B]">{user?.firstName ?? "Solopreneur"}</span>
          </h1>
          <p className="text-[#8892a4] text-base max-w-xl mx-auto leading-relaxed">
            Gerado com base nas tuas respostas. Estas são as tuas palavras,
            a tua visão, o teu porquê.
          </p>
        </div>

        {/* Blocos do manifesto */}
        <div className="max-w-3xl mx-auto px-8 py-16 space-y-20">
          {blocos.map((bloco) => (
            <div key={bloco.numero}>
              <div className="text-[#BFD64B]/25 text-8xl font-black leading-none mb-4 select-none">
                {bloco.numero}
              </div>
              <h2 className="text-2xl font-bold text-[#F0ECE4] mb-4 leading-snug">
                {bloco.titulo}
              </h2>
              <p className="text-[#8892a4] text-base leading-relaxed mb-6">
                {bloco.corpo}
              </p>
              <div className="border-l-2 border-[#BFD64B] pl-5">
                <p className="text-[#F0ECE4] font-medium text-base italic leading-relaxed">
                  &ldquo;{bloco.destaque}&rdquo;
                </p>
              </div>
              {bloco.numero !== "10" && (
                <div className="mt-20 h-px bg-gradient-to-r from-transparent via-[#1a2035] to-transparent" />
              )}
            </div>
          ))}

          {/* CTA de aceitação */}
          <div className="pt-12 pb-8 text-center">
            <div className="bg-[#111827] border border-[#1a2035] rounded-2xl p-10">
              <div className="text-4xl mb-4">✊</div>
              <h3 className="text-2xl font-bold text-[#F0ECE4] mb-3">
                Este és tu?
              </h3>
              <p className="text-[#8892a4] text-base mb-8 max-w-md mx-auto leading-relaxed">
                Se sim, aceita o teu manifesto e avança para o próximo passo: definir o teu Voice DNA.
              </p>

              {aceito ? (
                <div className="flex items-center justify-center gap-3 text-[#BFD64B] font-bold text-lg">
                  <span className="text-2xl">✓</span>
                  Manifesto aceite. A redirecionar...
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={aceitarManifesto}
                    disabled={aceitando}
                    className="inline-flex items-center gap-3 bg-[#BFD64B] text-[#0A0E1A] font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {aceitando ? (
                      <>
                        <span className="w-5 h-5 border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A] rounded-full animate-spin" />
                        A guardar...
                      </>
                    ) : (
                      "Aceito este manifesto →"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setBlocos([]);
                      setFase("bloco1");
                    }}
                    className="inline-flex items-center gap-2 text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors"
                  >
                    Refazer entrevista
                  </button>
                </div>
              )}

              <p className="text-[#4a5568] text-xs mt-6">
                Próximo passo: Voice DNA — 5 perguntas sobre o teu nicho e voz
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── BLOCOS DE PERGUNTAS (bloco1, bloco2, bloco3) ──────────────────────
  const blocoKey = fase as "bloco1" | "bloco2" | "bloco3";
  const perguntas = perguntasPorBloco[blocoKey];
  const valido = blocoValido(blocoKey);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Barra de progresso */}
      <div className="h-1 bg-[#1a2035] rounded-full mb-12">
        <div
          className="h-1 bg-[#BFD64B] rounded-full transition-all duration-500"
          style={{ width: `${progresso[fase]}%` }}
        />
      </div>

      {/* Cabeçalho do bloco */}
      <div className="mb-10">
        <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">
          {tituloBlocos[fase]}
        </div>
        <p className="text-[#8892a4] text-sm">
          Responde com profundidade. Quanto mais denso, mais personalizado fica o teu manifesto.
        </p>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400 text-sm">
          {erro}
        </div>
      )}

      {/* Perguntas do bloco */}
      <div className="flex flex-col gap-10">
        {perguntas.map((pergunta, idx) => (
          <div key={pergunta.id}>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-[#BFD64B] text-xs font-bold tracking-widest pt-0.5 flex-shrink-0">
                {String(
                  (blocoKey === "bloco1" ? 0 : blocoKey === "bloco2" ? 3 : 6) +
                    idx +
                    1
                ).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-[#F0ECE4] font-bold text-base mb-1">
                  {pergunta.titulo}
                </h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  {pergunta.descricao}
                </p>
              </div>
            </div>

            <textarea
              value={respostas[pergunta.id]}
              onChange={(e) => handleChange(pergunta.id, e.target.value)}
              placeholder={pergunta.placeholder}
              rows={5}
              className="w-full bg-[#111827] border border-[#1a2035] rounded-xl px-5 py-4 text-[#F0ECE4] text-sm placeholder-[#3a4555] leading-relaxed resize-none focus:outline-none focus:border-[#BFD64B]/50 transition-colors"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${respostas[pergunta.id].length >= 10 ? "text-[#BFD64B]/60" : "text-[#3a4555]"}`}>
                {respostas[pergunta.id].length} caracteres
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between mt-12 pb-10">
        <button
          onClick={() => {
            const fases: Fase[] = ["intro", "bloco1", "bloco2", "bloco3"];
            const idx = fases.indexOf(fase);
            if (idx > 0) setFase(fases[idx - 1]);
          }}
          className="text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors"
        >
          ← Voltar
        </button>

        <button
          onClick={() => avancar(blocoKey)}
          disabled={!valido}
          className={`inline-flex items-center gap-2 font-bold px-8 py-3 rounded-xl transition-all ${
            valido
              ? "bg-[#BFD64B] text-[#0A0E1A] hover:opacity-90"
              : "bg-[#1a2035] text-[#4a5568] cursor-not-allowed"
          }`}
        >
          {blocoKey === "bloco3" ? "Gerar o meu Manifesto →" : "Próximo bloco →"}
        </button>
      </div>
    </div>
  );
}
