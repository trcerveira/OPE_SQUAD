"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LS_KEY_DNA     = "opesquad_voz_dna";
const LS_KEY_ANSWERS = "opesquad_voz_dna_answers";

// Entrevista de 8 perguntas que gera o DNA de voz da marca via Claude
// Passo 3 da sequência: Genius Zone → Manifesto → Voz & DNA → Content

type Fase =
  | "intro"
  | "bloco1"
  | "bloco2"
  | "bloco3"
  | "gerando"
  | "resultado";

interface Respostas {
  tom: string;
  personagem: string;
  emocao: string;
  vocabularioActivo: string;
  vocabularioProibido: string;
  frasesAssinatura: string;
  estrutura: string;
  posicao: string;
}

interface VozDNA {
  arquetipo: string;
  descricaoArquetipo: string;
  tomEmTresPalavras: string[];
  vocabularioActivo: string[];
  vocabularioProibido: string[];
  frasesAssinatura: string[];
  regrasEstilo: string[];
  exemplos: { contexto: string; texto: string }[];
}

const perguntasPorBloco = {
  bloco1: [
    {
      id: "tom" as const,
      titulo: "Como soa a tua marca quando fala?",
      descricao:
        "Descreve o tom: formal ou informal? Directo ou suave? Sério ou bem-humorado? Provocador ou encorajador? Quanto mais específico, mais o teu DNA vai ser preciso.",
      placeholder:
        "Ex: Informal e directo, como um amigo de confiança que diz a verdade sem filtros. Nunca corporativo. Nunca condescendente. Às vezes provoca para despertar, mas sempre com cuidado. Usa humor seco, não palhaçadas...",
      tipo: "textarea" as const,
    },
    {
      id: "personagem" as const,
      titulo: "Se a tua marca fosse uma pessoa famosa, quem seria?",
      descricao:
        "Pode ser real (David Goggins, Alex Hormozi, Seth Godin) ou fictício (Yoda, Harvey Specter, Ted Lasso). Explica porquê — o que têm em comum contigo.",
      placeholder:
        "Ex: Alex Hormozi na substância — directo, sem floreados, focado em resultados reais. Mas com a humanidade do Ted Lasso — acredita genuinamente nas pessoas. E a provocação do Dave Chappelle — não tem medo de dizer o que os outros evitam...",
      tipo: "textarea" as const,
    },
    {
      id: "emocao" as const,
      titulo: "Que emoção queres deixar quando alguém te lê?",
      descricao:
        "Não o que ensinas — o que sentem depois. Urgência? Clareza? Pertença? Inspiração? Desafio? Segurança? Pode ser mais do que uma, mas há uma dominante.",
      placeholder:
        "Ex: Quero que sintam clareza e urgência ao mesmo tempo — 'já sei o que tenho de fazer e não posso continuar a adiar'. Também quero que se sintam vistos, não julgados...",
      tipo: "textarea" as const,
    },
  ],
  bloco2: [
    {
      id: "vocabularioActivo" as const,
      titulo: "As tuas palavras — o que usas SEMPRE",
      descricao:
        "Lista as palavras, expressões e frases que são tuas. Que aparecem naturalmente no teu vocabulário e que identificam a tua voz. Sem limite — quanto mais, melhor.",
      placeholder:
        "Ex: sistema, prova, identidade, consistência, motor, ferramentas, 25 minutos, solopreneur, construir, diário, hábito, resultados reais, clareza, execução, sem atalhos...",
      tipo: "textarea" as const,
    },
    {
      id: "vocabularioProibido" as const,
      titulo: "As palavras que NUNCA uses",
      descricao:
        "Que palavras soam falsas, genéricas ou erradas na tua marca? As que te fazem encolher quando as ouves noutros criadores do teu nicho.",
      placeholder:
        "Ex: fácil, rápido, motivação, segredo, truque, passivo, incrível, épico, hacks, escalar, mindset (sem contexto), transformação (sem especificidade), gratidão (como tópico vazio)...",
      tipo: "textarea" as const,
    },
    {
      id: "frasesAssinatura" as const,
      titulo: "As tuas frases assinatura",
      descricao:
        "Expressões que já usas recorrentemente, ou que queres tornar marcas da tua comunicação. Frases que ficam na cabeça das pessoas.",
      placeholder:
        "Ex: '25 minutos. É tudo.' / 'Sistema, não motivação.' / 'Prova, não promessas.' / 'Primeiro constróis o hábito. Depois o hábito constrói-te.' / 'A indústria lucra com o teu falhanço.'...",
      tipo: "textarea" as const,
    },
  ],
  bloco3: [
    {
      id: "estrutura" as const,
      titulo: "Como estruturas as tuas mensagens?",
      descricao:
        "Preferes posts curtos e directos ou narrativas longas? Listas ou parágrafos corridos? Começas com história, dados ou afirmação directa? Usas muito ou pouco emojis?",
      placeholder:
        "Ex: Curto e directo na maioria. Às vezes uma micro-história de 3-4 frases para criar contexto, depois a conclusão directa. Prefiro parágrafos curtos a listas. Evito emojis excepto no final. Começo sempre com uma afirmação ou pergunta provocadora...",
      tipo: "textarea" as const,
    },
    {
      id: "posicao" as const,
      titulo: "Qual é a tua posição no mercado?",
      descricao:
        "Como te posicionas em relação ao status quo? És o Rebelde que critica o que está errado? O Mentor que guia? O Especialista frio com dados? O Amigo que acompanha? A combinação é única — descreve a tua.",
      placeholder:
        "Ex: Sou Rebelde na forma — critico o que o mercado vende como solução mas que não funciona. Sou Mentor no conteúdo — guio passo a passo. Não sou o especialista frio com dados. Sou mais 'amigo que foi pelo mesmo caminho e encontrou um sistema que funciona'...",
      tipo: "textarea" as const,
    },
  ],
};

const tituloBlocos: Record<string, string> = {
  bloco1: "BLOCO 1 — O TOM DA VOZ",
  bloco2: "BLOCO 2 — AS PALAVRAS DA MARCA",
  bloco3: "BLOCO 3 — O ESTILO E POSIÇÃO",
};

const proximaFase: Record<Fase, Fase> = {
  intro: "bloco1",
  bloco1: "bloco2",
  bloco2: "bloco3",
  bloco3: "gerando",
  gerando: "resultado",
  resultado: "resultado",
};

const progresso: Record<Fase, number> = {
  intro: 0,
  bloco1: 25,
  bloco2: 55,
  bloco3: 80,
  gerando: 92,
  resultado: 100,
};

export default function VozDNAAssessment() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("intro");
  const [respostas, setRespostas] = useState<Respostas>({
    tom: "",
    personagem: "",
    emocao: "",
    vocabularioActivo: "",
    vocabularioProibido: "",
    frasesAssinatura: "",
    estrutura: "",
    posicao: "",
  });
  const [dna, setDna] = useState<VozDNA | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  // Ao montar: verifica se já existe DNA guardado no localStorage (sessão anterior)
  useEffect(() => {
    try {
      const dnaGuardado = localStorage.getItem(LS_KEY_DNA);
      const respostasGuardadas = localStorage.getItem(LS_KEY_ANSWERS);
      if (dnaGuardado) {
        setDna(JSON.parse(dnaGuardado));
        setFase("resultado");
      }
      if (respostasGuardadas) {
        setRespostas(JSON.parse(respostasGuardadas));
      }
    } catch {
      // localStorage indisponível (SSR ou bloqueado) — continua normalmente
    }
  }, []);

  function handleChange(key: keyof Respostas, value: string) {
    setRespostas((prev) => ({ ...prev, [key]: value }));
  }

  function blocoValido(b: "bloco1" | "bloco2" | "bloco3"): boolean {
    return perguntasPorBloco[b].every(
      (p) => respostas[p.id].trim().length >= 10
    );
  }

  async function gerarDNA() {
    setFase("gerando");
    setErro(null);
    try {
      const res = await fetch("/api/voz-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: respostas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");

      // Guarda no localStorage imediatamente (backup rápido, sem depender do Clerk)
      try {
        localStorage.setItem(LS_KEY_DNA, JSON.stringify(data.dna));
        localStorage.setItem(LS_KEY_ANSWERS, JSON.stringify(respostas));
      } catch { /* localStorage pode estar cheio ou bloqueado */ }

      setDna(data.dna);
      setFase("resultado");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao gerar DNA. Tenta novamente.");
      setFase("bloco3");
    }
  }

  async function guardarDNA() {
    if (!isLoaded) {
      setErro("A carregar sessão... tenta novamente em segundos.");
      return;
    }
    if (!user) {
      setErro("Sessão expirada. Recarrega a página e tenta novamente.");
      return;
    }
    if (!dna) return;

    setGuardando(true);
    setErro(null);

    try {
      // Clerk metadata: apenas o DNA essencial (sem exemplos, sem respostas cruas)
      // Tudo o que o Content Factory precisa para gerar conteúdo na voz correcta:
      // ~1.4KB — bem dentro do limite de 8KB do Clerk
      const dnaParaClerk = {
        arquetipo:          dna.arquetipo,
        descricaoArquetipo: dna.descricaoArquetipo,
        tomEmTresPalavras:  dna.tomEmTresPalavras,
        vocabularioActivo:  dna.vocabularioActivo,
        vocabularioProibido: dna.vocabularioProibido,
        frasesAssinatura:   dna.frasesAssinatura,
        regrasEstilo:       dna.regrasEstilo,
        // exemplos omitidos — são só para display, não para geração de conteúdo
      };

      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          vozDNAComplete: true,
          vozDNA: dnaParaClerk,
        },
      });

      setGuardado(true);
      setTimeout(() => router.push("/content"), 1400);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao guardar. Tenta novamente.");
      setGuardando(false);
    }
  }

  function avancar(blocoActual?: "bloco1" | "bloco2" | "bloco3") {
    if (blocoActual === "bloco3") {
      gerarDNA().catch((err) => {
        setErro(err instanceof Error ? err.message : "Erro inesperado. Tenta novamente.");
        setFase("bloco3");
      });
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
            PASSO 3 DE 4 — VOZ & DNA
          </div>
          <h1 className="text-5xl font-black text-[#F0ECE4] mb-4 leading-tight">
            A tua Voz.<br />
            <span className="text-[#BFD64B]">O teu DNA.</span>
          </h1>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-6">
            Tens o teu Manifesto. Agora vamos codificar exactamente como a tua marca fala — as palavras que usa, as que nunca usa, o tom, o estilo. Este é o guia que o motor de IA vai seguir para gerar conteúdo na tua voz.
          </p>
          <p className="text-[#8892a4] text-base leading-relaxed mb-10">
            Vais responder a <strong className="text-[#F0ECE4]">8 perguntas</strong> em 3 blocos. O resultado é o teu <strong className="text-[#F0ECE4]">DNA de Voz</strong> — um documento que define a tua comunicação para sempre.
            Leva <strong className="text-[#F0ECE4]">10 minutos</strong>.
          </p>

          <div className="flex flex-col gap-3 mb-10">
            {[
              { bloco: "Bloco 1", titulo: "O tom da voz", desc: "Como soas, quem és como personagem, que emoção deixas" },
              { bloco: "Bloco 2", titulo: "As palavras da marca", desc: "Vocabulário activo, palavras proibidas, frases assinatura" },
              { bloco: "Bloco 3", titulo: "O estilo e posição", desc: "Como estruturas, onde te posicionas no mercado" },
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

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setFase("bloco1")}
              className="inline-flex items-center gap-3 bg-[#BFD64B] text-[#0A0E1A] font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-all"
            >
              Definir o meu DNA →
            </button>
            {/* Botão só aparece se já existe DNA guardado localmente */}
            {typeof window !== "undefined" && localStorage.getItem(LS_KEY_DNA) && (
              <button
                onClick={() => {
                  try {
                    const saved = localStorage.getItem(LS_KEY_DNA);
                    if (saved) { setDna(JSON.parse(saved)); setFase("resultado"); }
                  } catch { setFase("bloco1"); }
                }}
                className="inline-flex items-center gap-2 border border-[#BFD64B]/30 text-[#BFD64B] font-bold px-8 py-4 rounded-xl text-base hover:bg-[#BFD64B]/5 transition-all"
              >
                Ver DNA anterior →
              </button>
            )}
          </div>
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
            A construir o teu DNA...
          </h2>
          <p className="text-[#8892a4] text-base leading-relaxed">
            O Claude está a analisar as tuas respostas e a codificar a tua voz única. Isto demora 15 a 30 segundos.
          </p>
        </div>
      </div>
    );
  }

  // ── RESULTADO — DNA GERADO ───────────────────────────────────────────────
  if (fase === "resultado" && dna) {
    return (
      <div className="min-h-screen">
        {/* Barra de progresso */}
        <div className="h-1 bg-[#1a2035] mb-0">
          <div className="h-1 bg-[#BFD64B] w-full transition-all" />
        </div>

        {/* Cabeçalho */}
        <div className="border-b border-[#1a2035] px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
            O TEU DNA DE VOZ
          </div>
          <h1 className="text-4xl font-black text-[#F0ECE4] mb-3 leading-tight">
            {dna.arquetipo}
          </h1>
          <p className="text-[#8892a4] text-base max-w-xl mx-auto leading-relaxed">
            {dna.descricaoArquetipo}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            {dna.tomEmTresPalavras.map((p) => (
              <span key={p} className="bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-sm font-bold px-4 py-1.5 rounded-full">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Corpo do DNA */}
        <div className="max-w-3xl mx-auto px-8 py-14 space-y-12">

          {/* Vocabulário activo */}
          <div>
            <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">VOCABULÁRIO ACTIVO — USA SEMPRE</div>
            <div className="flex flex-wrap gap-2">
              {dna.vocabularioActivo.map((w) => (
                <span key={w} className="bg-[#111827] border border-[#1a2035] text-[#F0ECE4] text-sm px-3 py-1.5 rounded-lg">
                  {w}
                </span>
              ))}
            </div>
          </div>

          {/* Vocabulário proibido */}
          <div>
            <div className="text-red-400 text-xs font-bold tracking-widest mb-4">VOCABULÁRIO PROIBIDO — NUNCA USAR</div>
            <div className="flex flex-wrap gap-2">
              {dna.vocabularioProibido.map((w) => (
                <span key={w} className="bg-red-950/20 border border-red-900/30 text-red-400 text-sm px-3 py-1.5 rounded-lg line-through">
                  {w}
                </span>
              ))}
            </div>
          </div>

          {/* Frases assinatura */}
          <div>
            <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">FRASES ASSINATURA</div>
            <div className="flex flex-col gap-3">
              {dna.frasesAssinatura.map((f) => (
                <div key={f} className="border-l-2 border-[#BFD64B] pl-5">
                  <p className="text-[#F0ECE4] font-medium text-base italic">&ldquo;{f}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

          {/* Regras de estilo */}
          <div>
            <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">REGRAS DE ESTILO</div>
            <div className="flex flex-col gap-3">
              {dna.regrasEstilo.map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[#BFD64B] font-bold text-xs pt-1 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[#8892a4] text-sm leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Exemplos na tua voz */}
          <div>
            <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">EXEMPLOS NA TUA VOZ</div>
            <div className="flex flex-col gap-5">
              {dna.exemplos.map((ex, i) => (
                <div key={i} className="bg-[#111827] border border-[#1a2035] rounded-xl p-5">
                  <div className="text-[#4a5568] text-xs font-bold tracking-widest mb-3 uppercase">{ex.contexto}</div>
                  <p className="text-[#F0ECE4] text-sm leading-relaxed">{ex.texto}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA de activação */}
          <div className="pt-6 pb-8 text-center">
            <div className="bg-[#111827] border border-[#1a2035] rounded-2xl p-10">
              <div className="text-4xl mb-4">🎙️</div>
              <h3 className="text-2xl font-bold text-[#F0ECE4] mb-3">
                Este és tu?
              </h3>
              <p className="text-[#8892a4] text-base mb-8 max-w-md mx-auto leading-relaxed">
                Se sim, activa o teu DNA. A partir deste momento, todo o conteúdo que gerares vai soar exactamente a ti.
              </p>

              {erro && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
                  {erro}
                </div>
              )}

              {guardado ? (
                <div className="flex items-center justify-center gap-3 text-[#BFD64B] font-bold text-lg">
                  <span className="text-2xl">✓</span>
                  DNA activado. A ir para o Content Factory...
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      guardarDNA().catch((err) => {
                        setErro(err instanceof Error ? err.message : "Erro inesperado.");
                        setGuardando(false);
                      });
                    }}
                    disabled={guardando || !isLoaded}
                    className="inline-flex items-center gap-3 bg-[#BFD64B] text-[#0A0E1A] font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {!isLoaded ? (
                      <>
                        <span className="w-5 h-5 border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A] rounded-full animate-spin" />
                        A carregar sessão...
                      </>
                    ) : guardando ? (
                      <>
                        <span className="w-5 h-5 border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A] rounded-full animate-spin" />
                        A activar...
                      </>
                    ) : (
                      "Activar o meu DNA →"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setDna(null);
                      setFase("bloco1");
                    }}
                    className="inline-flex items-center gap-2 text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors"
                  >
                    Refazer entrevista
                  </button>
                </div>
              )}

              <p className="text-[#4a5568] text-xs mt-6">
                Próximo passo: Content Factory — gera posts para qualquer plataforma na tua voz
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── BLOCOS DE PERGUNTAS ──────────────────────────────────────────────────
  const blocoKey = fase as "bloco1" | "bloco2" | "bloco3";
  const perguntas = perguntasPorBloco[blocoKey];
  const valido = blocoValido(blocoKey);

  const offsetPorBloco: Record<string, number> = { bloco1: 0, bloco2: 3, bloco3: 6 };

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
          Responde com especificidade. Quanto mais concreto, mais preciso fica o teu DNA.
        </p>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400 text-sm">
          {erro}
        </div>
      )}

      {/* Perguntas */}
      <div className="flex flex-col gap-10">
        {perguntas.map((pergunta, idx) => (
          <div key={pergunta.id}>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-[#BFD64B] text-xs font-bold tracking-widest pt-0.5 flex-shrink-0">
                {String(offsetPorBloco[blocoKey] + idx + 1).padStart(2, "0")}
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
          {blocoKey === "bloco3" ? "Gerar o meu DNA →" : "Próximo bloco →"}
        </button>
      </div>
    </div>
  );
}
