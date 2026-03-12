"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

// DNA da Marca — 17 questions in 4 blocks (MAV + Manifesto fusion)
// Generates a structured Brand DNA Card via Claude

type Fase =
  | "intro"
  | "bloco1"
  | "bloco2"
  | "bloco3"
  | "bloco4"
  | "gerando"
  | "resultado";

interface Respostas {
  // Bloco 1 — Quem Serves
  clienteIdeal: string;
  tentativasFalhadas: string;
  linguagemCliente: string;
  vidaIdeal: string;
  // Bloco 2 — Quem És
  especialidade: string;
  personalidade: string;
  piorMomento: string;
  erroQueEnsina: string;
  // Bloco 3 — O Que Defendes
  irritacoes: string;
  crencas: string;
  bigIdea: string;
  proposito: string;
  visao: string;
  // Bloco 4 — A Tua Promessa
  transformacao: string;
  resultados: string;
  diferencaFundamental: string;
  commandersIntent: string;
}

interface DNAMarcaCard {
  clienteIdeal: {
    perfil: string;
    dores: string[];
    desejos: string[];
    linguagem: string[];
  };
  personagem: {
    historia: string;
    superpoder: string;
    defeito: string;
    voz: string;
  };
  bigIdea: {
    frase: string;
    explicacao: string;
  };
  inimigo: {
    quem: string;
    porque: string;
  };
  causaFutura: {
    movimento: string;
    visao10anos: string;
  };
  commandersIntent: string;
  novaOportunidade: {
    diferencial: string;
    reframe: string;
  };
}

const perguntasPorBloco = {
  bloco1: [
    {
      id: "clienteIdeal" as const,
      titulo: "Quem é o teu cliente ideal?",
      descricao:
        "Descreve-o como se estivesses a falar dele a um amigo. Qual é a dor mais profunda? O que ninguém vê neles? Como é o dia dele?",
      placeholder:
        "Ex: O meu cliente tem X anos, faz Y, e a dor que ninguém fala é... O que eles não vêem em si mesmos é...",
    },
    {
      id: "tentativasFalhadas" as const,
      titulo: "O que já tentou para resolver — e porque falhou?",
      descricao:
        "Lista tudo o que o teu público já tentou antes. Porque é que essas soluções falharam? Qual era o defeito estrutural?",
      placeholder:
        "Ex: Já tentaram ginásio, dietas, apps, coaches online... Falhou porque o sistema exigia 2 horas por dia e consistência sobre-humana...",
    },
    {
      id: "linguagemCliente" as const,
      titulo: "Se pudesses ouvir uma conversa dele sobre este problema, que palavras usaria?",
      descricao:
        "As palavras EXACTAS que o teu cliente usa para descrever a dor. Não as tuas palavras — as DELE. O que pesquisa no Google às 23h?",
      placeholder:
        'Ex: "Não tenho tempo para nada", "Já tentei tudo e nada funciona", "Sinto que estou a ficar para trás"...',
    },
    {
      id: "vidaIdeal" as const,
      titulo: "Como seria a vida dele daqui a 6 meses se funcionasse perfeitamente?",
      descricao:
        "Pinta o quadro completo. Não só o resultado prático — a emoção, a confiança, o dia-a-dia transformado.",
      placeholder:
        "Ex: Acordava sem ansiedade, publicava conteúdo em 20 minutos, recebia mensagens de seguidores a dizer que o conteúdo mudou a vida deles...",
    },
  ],
  bloco2: [
    {
      id: "especialidade" as const,
      titulo: "Quem és tu no mercado?",
      descricao:
        "Qual é a tua especialidade, o teu percurso e o que te diferencia de todos os outros? Quanto mais denso e honesto, melhor.",
      placeholder:
        "Ex: Sou especialista em X, venho de Y anos nesta área. O que me diferencia é... Vejo o mercado de uma forma diferente porque...",
    },
    {
      id: "personalidade" as const,
      titulo: "A personalidade e voz da tua marca",
      descricao:
        "Se a tua marca fosse uma pessoa, como seria? Rebelde, Cuidadora, Estrategista? Como fala? Formal ou informal? Que palavras usa sempre? Que palavras nunca usa?",
      placeholder:
        "Ex: A minha marca é Rebelde e Directa — fala de igual para igual. Usa 'tu', nunca 'você'. Diz 'sistema' em vez de 'motivação'. Nunca usa 'fácil' ou 'segredo'...",
    },
    {
      id: "piorMomento" as const,
      titulo: "Qual foi o teu pior momento nesta jornada?",
      descricao:
        "O fundo do poço. O momento que quase desististe. A queda que te tornou quem és. Uma história só de vitórias é aborrecida — as quedas são o que te torna humano.",
      placeholder:
        "Ex: Houve uma altura em que... Quase desisti quando... O momento mais difícil foi...",
    },
    {
      id: "erroQueEnsina" as const,
      titulo: "Que erro cometeste que agora ensinas outros a evitar?",
      descricao:
        "O erro que te custou tempo, dinheiro ou sanidade — e que agora é uma das lições mais valiosas que partilhas.",
      placeholder:
        "Ex: O meu maior erro foi... Custou-me X meses/euros. Agora ensino os meus clientes a evitar isto porque...",
    },
  ],
  bloco3: [
    {
      id: "irritacoes" as const,
      titulo: "O que te irrita no teu mercado?",
      descricao:
        "O que discordas profundamente? O que te recusas a fazer? O que te dá nojo no teu nicho? Sê brutal — o inimigo comum une a audiência.",
      placeholder:
        "Ex: Odeio quando... Recuso-me a... O que me irrita é ver... Nunca vou fazer...",
    },
    {
      id: "crencas" as const,
      titulo: "As tuas crenças mais fortes",
      descricao:
        "O que acreditas profundamente sobre conteúdo, negócios, consistência e empreendedorismo digital? As verdades que defendes mesmo quando são impopulares.",
      placeholder:
        "Ex: Acredito que... Para mim é inegociável... O que a maioria não percebe é... A minha verdade sobre X é...",
    },
    {
      id: "bigIdea" as const,
      titulo: 'Completa: "Toda a gente pensa que [X], mas a verdade é que [Y]"',
      descricao:
        "A UMA crença central que, se a audiência aceitar, tudo o resto faz sentido. O conceito que desafia o status quo do teu mercado.",
      placeholder:
        'Ex: "Toda a gente pensa que precisa de 4 horas por dia para criar conteúdo, mas a verdade é que 25 minutos com o sistema certo produz mais resultado"',
    },
    {
      id: "proposito" as const,
      titulo: "O teu grande PORQUÊ",
      descricao:
        "Porque fazes isto verdadeiramente? Não a resposta bonita — a resposta real. A ferida, a promessa ou a missão por trás de tudo.",
      placeholder:
        "Ex: Faço isto porque... O que me move é... Há uma ferida nisto? Uma promessa? Uma missão?",
    },
    {
      id: "visao" as const,
      titulo: "O teu impacto no mercado",
      descricao:
        "Se tiveres sucesso total, que mudança trazes para o mundo? O que se torna 'novo normal' por causa do teu trabalho?",
      placeholder:
        "Ex: Quero um mundo onde... Daqui a 10 anos, o que mudei foi... O meu legado é...",
    },
  ],
  bloco4: [
    {
      id: "transformacao" as const,
      titulo: "A tua promessa de transformação",
      descricao:
        'Completa: "Transformo ___ em ___ sem ___." Ou usa o formato que sentires mais autêntico.',
      placeholder:
        'Ex: "Transformo solopreneurs com conhecimento mas sem sistema em criadores consistentes, sem sacrificar 4 horas por dia."',
    },
    {
      id: "resultados" as const,
      titulo: "Resultados concretos",
      descricao:
        "O que consegue o teu cliente depois de trabalhar contigo? Sê específico: tempo, leads, vendas, clareza, paz mental.",
      placeholder:
        "Ex: Depois de trabalharem comigo, conseguem... Em X semanas, tipicamente... O que mais muda é...",
    },
    {
      id: "diferencaFundamental" as const,
      titulo: "O que a tua solução faz de FUNDAMENTALMENTE diferente?",
      descricao:
        'Não "melhor" — DIFERENTE. Se o teu cliente dissesse "ah, isso é tipo [concorrente]", o que responderias?',
      placeholder:
        'Ex: Isto não é um programa de fitness. Isto é um sistema de 25 minutos. A diferença fundamental é que...',
    },
    {
      id: "commandersIntent" as const,
      titulo: "Se TODA a tua comunicação tivesse de servir UM único objectivo, qual seria?",
      descricao:
        'O Commander\'s Intent — a frase que guia TUDO. Formato sugerido: "Quero que o meu público acredite que [X] e por isso faça [Y]."',
      placeholder:
        'Ex: "Quero que o meu público acredite que o problema nunca foi ele — foi o sistema — e por isso experimente uma abordagem diferente."',
    },
  ],
};

const tituloBlocos: Record<string, string> = {
  bloco1: "BLOCO 1 — QUEM SERVES",
  bloco2: "BLOCO 2 — QUEM ÉS",
  bloco3: "BLOCO 3 — O QUE DEFENDES",
  bloco4: "BLOCO 4 — A TUA PROMESSA",
};

const descricaoBlocos: Record<string, string> = {
  bloco1: "O teu cliente ideal — dores, linguagem, desejos. O conteúdo que geras vai falar directamente para esta pessoa.",
  bloco2: "A tua história, personalidade e voz. O que te torna humano, relatável e impossível de copiar.",
  bloco3: "As tuas crenças, a tua Big Idea e o inimigo do teu mercado. O que ancora TODA a comunicação.",
  bloco4: "A promessa, os resultados e o que te diferencia. O Commander's Intent que guia cada peça de conteúdo.",
};

const proximaFase: Record<Fase, Fase> = {
  intro: "bloco1",
  bloco1: "bloco2",
  bloco2: "bloco3",
  bloco3: "bloco4",
  bloco4: "gerando",
  gerando: "resultado",
  resultado: "resultado",
};

const progresso: Record<Fase, number> = {
  intro: 0,
  bloco1: 15,
  bloco2: 35,
  bloco3: 55,
  bloco4: 75,
  gerando: 90,
  resultado: 100,
};

// Count questions before each block for numbering
const questionOffset: Record<string, number> = {
  bloco1: 0,
  bloco2: 4,
  bloco3: 8,
  bloco4: 13,
};

export default function DNAMarcaAssessment() {
  const { user } = useUser();
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("intro");
  const [respostas, setRespostas] = useState<Respostas>({
    clienteIdeal: "",
    tentativasFalhadas: "",
    linguagemCliente: "",
    vidaIdeal: "",
    especialidade: "",
    personalidade: "",
    piorMomento: "",
    erroQueEnsina: "",
    irritacoes: "",
    crencas: "",
    bigIdea: "",
    proposito: "",
    visao: "",
    transformacao: "",
    resultados: "",
    diferencaFundamental: "",
    commandersIntent: "",
  });
  const [dnaMarca, setDnaMarca] = useState<DNAMarcaCard | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [activando, setActivando] = useState(false);
  const [activado, setActivado] = useState(false);

  function handleChange(key: keyof Respostas, value: string) {
    setRespostas((prev) => ({ ...prev, [key]: value }));
  }

  function blocoValido(b: "bloco1" | "bloco2" | "bloco3" | "bloco4"): boolean {
    return perguntasPorBloco[b].every(
      (p) => respostas[p.id].trim().length >= 10
    );
  }

  async function gerarDNA() {
    setFase("gerando");
    setErro(null);
    try {
      const res = await fetch("/api/dna-marca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: respostas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setDnaMarca(data.dnaMarca);
      setFase("resultado");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Error generating DNA da Marca");
      setFase("bloco4");
    }
  }

  async function activarDNA() {
    if (!user) return;
    setActivando(true);
    setErro(null);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          dnaMarcaComplete: true,
          dnaMarca,
        },
      });
      setActivado(true);
      setTimeout(() => router.push("/voz-dna"), 1400);
    } catch (err) {
      setActivando(false);
      setErro(
        err instanceof Error
          ? `Error saving: ${err.message}`
          : "Error saving. Try again."
      );
    }
  }

  function avancar(blocoActual?: "bloco1" | "bloco2" | "bloco3" | "bloco4") {
    if (blocoActual === "bloco4") {
      gerarDNA().catch((err) => {
        setErro(err instanceof Error ? err.message : "Unexpected error. Try again.");
        setFase("bloco4");
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
            PASSO 1 DE 3 — DNA DA MARCA
          </div>
          <h1 className="text-5xl font-black text-[#F0ECE4] mb-4 leading-tight">
            O DNA da tua Marca<br />
            <span className="text-[#BFD64B]">começa aqui.</span>
          </h1>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-4">
            Antes de gerar conteúdo, precisamos de entender <strong className="text-[#F0ECE4]">quem serves</strong>,{" "}
            <strong className="text-[#F0ECE4]">quem és</strong>,{" "}
            <strong className="text-[#F0ECE4]">o que defendes</strong> e{" "}
            <strong className="text-[#F0ECE4]">o que prometes</strong>.
          </p>
          <p className="text-[#8892a4] text-base leading-relaxed mb-10">
            Vais responder a <strong className="text-[#F0ECE4]">17 perguntas</strong> em 4 blocos.
            O motor de IA gera o teu DNA da Marca personalizado — a fundação estratégica de todo o teu conteúdo.
            Faz uma vez só. Leva <strong className="text-[#F0ECE4]">15 a 20 minutos</strong>.
          </p>

          <div className="flex flex-col gap-3 mb-10">
            {[
              { bloco: "Bloco 1", titulo: "Quem serves", desc: "Cliente ideal, dores, linguagem, desejos", perguntas: 4 },
              { bloco: "Bloco 2", titulo: "Quem és", desc: "Especialidade, personalidade, história, defeito", perguntas: 4 },
              { bloco: "Bloco 3", titulo: "O que defendes", desc: "Crenças, Big Idea, inimigo, propósito, visão", perguntas: 5 },
              { bloco: "Bloco 4", titulo: "A tua promessa", desc: "Transformação, resultados, diferencial, Commander's Intent", perguntas: 4 },
            ].map((item) => (
              <div key={item.bloco} className="flex items-center gap-4 bg-[#111827] border border-[#1a2035] rounded-xl px-5 py-4">
                <div className="text-[#BFD64B] text-xs font-bold tracking-widest w-16 flex-shrink-0">{item.bloco}</div>
                <div className="flex-1">
                  <div className="text-[#F0ECE4] font-bold text-sm">{item.titulo}</div>
                  <div className="text-[#8892a4] text-xs">{item.desc}</div>
                </div>
                <div className="text-[#4a5568] text-xs">{item.perguntas} perguntas</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setFase("bloco1")}
            className="inline-flex items-center gap-3 bg-[#BFD64B] text-[#0A0E1A] font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-all"
          >
            Começar entrevista
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
            A construir o teu DNA da Marca...
          </h2>
          <p className="text-[#8892a4] text-base leading-relaxed">
            O motor de IA está a analisar as tuas 17 respostas e a extrair
            o DNA da tua marca — cliente ideal, personagem, Big Idea, inimigo,
            causa futura e Commander&apos;s Intent. Pode demorar um momento.
          </p>
        </div>
      </div>
    );
  }

  // ── RESULTADO — DNA da Marca Card ──────────────────────────────────────
  if (fase === "resultado" && dnaMarca) {
    return (
      <div className="min-h-screen">
        {/* Progress bar */}
        <div className="h-1 bg-[#1a2035] mb-0">
          <div className="h-1 bg-[#BFD64B] w-full transition-all" />
        </div>

        {/* Header */}
        <div className="border-b border-[#1a2035] px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
            O TEU DNA DA MARCA
          </div>
          <h1 className="text-4xl font-black text-[#F0ECE4] mb-4 leading-tight">
            DNA da Marca de{" "}
            <span className="text-[#BFD64B]">{user?.firstName ?? "Solopreneur"}</span>
          </h1>
          <p className="text-[#8892a4] text-base max-w-xl mx-auto leading-relaxed">
            A fundação estratégica da tua comunicação. Tudo o que geras a partir de agora
            é ancorado neste DNA.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-8 py-12 space-y-12">
          {/* 1. Cliente Ideal */}
          <section className="bg-[#111827] border border-[#1a2035] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-bold text-[#F0ECE4]">Cliente Ideal</h2>
            </div>
            <p className="text-[#8892a4] text-sm leading-relaxed mb-6">{dnaMarca.clienteIdeal.perfil}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">DORES</h3>
                <ul className="space-y-2">
                  {dnaMarca.clienteIdeal.dores.map((dor, i) => (
                    <li key={i} className="text-[#F0ECE4] text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{dor}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">DESEJOS</h3>
                <ul className="space-y-2">
                  {dnaMarca.clienteIdeal.desejos.map((desejo, i) => (
                    <li key={i} className="text-[#F0ECE4] text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>{desejo}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">LINGUAGEM DO CLIENTE</h3>
              <div className="flex flex-wrap gap-2">
                {dnaMarca.clienteIdeal.linguagem.map((frase, i) => (
                  <span key={i} className="bg-[#0A0E1A] border border-[#1a2035] text-[#8892a4] text-xs px-3 py-1.5 rounded-full italic">
                    &ldquo;{frase}&rdquo;
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 2. Personagem Atraente */}
          <section className="bg-[#111827] border border-[#1a2035] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🎭</span>
              <h2 className="text-xl font-bold text-[#F0ECE4]">Personagem Atraente</h2>
            </div>
            <p className="text-[#8892a4] text-sm leading-relaxed mb-6">{dnaMarca.personagem.historia}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0A0E1A] border border-[#BFD64B]/20 rounded-xl p-4">
                <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-2">SUPERPODER</div>
                <p className="text-[#F0ECE4] text-sm">{dnaMarca.personagem.superpoder}</p>
              </div>
              <div className="bg-[#0A0E1A] border border-red-500/20 rounded-xl p-4">
                <div className="text-red-400 text-xs font-bold tracking-widest mb-2">DEFEITO HUMANO</div>
                <p className="text-[#F0ECE4] text-sm">{dnaMarca.personagem.defeito}</p>
              </div>
              <div className="bg-[#0A0E1A] border border-[#1a2035] rounded-xl p-4">
                <div className="text-[#8892a4] text-xs font-bold tracking-widest mb-2">VOZ</div>
                <p className="text-[#F0ECE4] text-sm">{dnaMarca.personagem.voz}</p>
              </div>
            </div>
          </section>

          {/* 3. Big Idea */}
          <section className="bg-[#111827] border border-[#BFD64B]/30 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-2xl">💡</span>
              <h2 className="text-xl font-bold text-[#F0ECE4]">Big Idea</h2>
            </div>
            <p className="text-[#BFD64B] text-2xl font-black leading-snug mb-4">
              &ldquo;{dnaMarca.bigIdea.frase}&rdquo;
            </p>
            <p className="text-[#8892a4] text-sm leading-relaxed max-w-lg mx-auto">
              {dnaMarca.bigIdea.explicacao}
            </p>
          </section>

          {/* 4. Inimigo + 5. Causa Futura — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-[#111827] border border-red-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚔️</span>
                <h2 className="text-lg font-bold text-[#F0ECE4]">O Inimigo</h2>
              </div>
              <p className="text-red-400 font-bold text-sm mb-2">{dnaMarca.inimigo.quem}</p>
              <p className="text-[#8892a4] text-sm leading-relaxed">{dnaMarca.inimigo.porque}</p>
            </section>

            <section className="bg-[#111827] border border-[#BFD64B]/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🚀</span>
                <h2 className="text-lg font-bold text-[#F0ECE4]">Causa Futura</h2>
              </div>
              <p className="text-[#BFD64B] font-bold text-sm mb-2">{dnaMarca.causaFutura.movimento}</p>
              <p className="text-[#8892a4] text-sm leading-relaxed">{dnaMarca.causaFutura.visao10anos}</p>
            </section>
          </div>

          {/* 6. Commander's Intent */}
          <section className="bg-[#0A0E1A] border-2 border-[#BFD64B] rounded-2xl p-8 text-center">
            <div className="text-[#BFD64B] text-xs font-bold tracking-[0.2em] mb-4">
              COMMANDER&apos;S INTENT
            </div>
            <p className="text-[#F0ECE4] text-lg font-bold leading-relaxed max-w-xl mx-auto">
              &ldquo;{dnaMarca.commandersIntent}&rdquo;
            </p>
            <p className="text-[#4a5568] text-xs mt-4">
              Se uma peça de conteúdo não serve este intento, não deve existir.
            </p>
          </section>

          {/* 7. Nova Oportunidade */}
          <section className="bg-[#111827] border border-[#1a2035] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-bold text-[#F0ECE4]">Nova Oportunidade</h2>
            </div>
            <p className="text-[#8892a4] text-sm leading-relaxed mb-4">{dnaMarca.novaOportunidade.diferencial}</p>
            <div className="border-l-2 border-[#BFD64B] pl-5">
              <p className="text-[#F0ECE4] font-medium text-base italic leading-relaxed">
                &ldquo;{dnaMarca.novaOportunidade.reframe}&rdquo;
              </p>
            </div>
          </section>

          {/* CTA — Activate */}
          <div className="pt-8 pb-8 text-center">
            <div className="bg-[#111827] border border-[#1a2035] rounded-2xl p-10">
              <div className="text-4xl mb-4">🧬</div>
              <h3 className="text-2xl font-bold text-[#F0ECE4] mb-3">
                Este és tu?
              </h3>
              <p className="text-[#8892a4] text-base mb-8 max-w-md mx-auto leading-relaxed">
                Se sim, activa o teu DNA da Marca e avança para o próximo passo: definir a tua Voz & DNA.
              </p>

              {activado ? (
                <div className="flex items-center justify-center gap-3 text-[#BFD64B] font-bold text-lg">
                  <span className="text-2xl">✓</span>
                  DNA da Marca activado. A redirecionar...
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => { activarDNA().catch(() => setActivando(false)); }}
                    disabled={activando}
                    className="inline-flex items-center gap-3 bg-[#BFD64B] text-[#0A0E1A] font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {activando ? (
                      <>
                        <span className="w-5 h-5 border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A] rounded-full animate-spin" />
                        A guardar...
                      </>
                    ) : (
                      "Activar o meu DNA da Marca"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setDnaMarca(null);
                      setFase("bloco1");
                    }}
                    className="inline-flex items-center gap-2 text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors"
                  >
                    Refazer entrevista
                  </button>
                </div>
              )}

              <p className="text-[#4a5568] text-xs mt-6">
                Próximo passo: Voz & DNA — 8 perguntas que codificam exactamente como a tua marca fala
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── BLOCOS DE PERGUNTAS ──────────────────────────────────────────────
  const blocoKey = fase as "bloco1" | "bloco2" | "bloco3" | "bloco4";
  const perguntas = perguntasPorBloco[blocoKey];
  const valido = blocoValido(blocoKey);
  const offset = questionOffset[blocoKey];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="h-1 bg-[#1a2035] rounded-full mb-12">
        <div
          className="h-1 bg-[#BFD64B] rounded-full transition-all duration-500"
          style={{ width: `${progresso[fase]}%` }}
        />
      </div>

      {/* Block header */}
      <div className="mb-10">
        <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">
          {tituloBlocos[fase]}
        </div>
        <p className="text-[#8892a4] text-sm">
          {descricaoBlocos[fase]}
        </p>
      </div>

      {/* Error message */}
      {erro && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400 text-sm">
          {erro}
        </div>
      )}

      {/* Questions */}
      <div className="flex flex-col gap-10">
        {perguntas.map((pergunta, idx) => (
          <div key={pergunta.id}>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-[#BFD64B] text-xs font-bold tracking-widest pt-0.5 flex-shrink-0">
                {String(offset + idx + 1).padStart(2, "0")}
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

      {/* Navigation */}
      <div className="flex items-center justify-between mt-12 pb-10">
        <button
          onClick={() => {
            const fases: Fase[] = ["intro", "bloco1", "bloco2", "bloco3", "bloco4"];
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
          {blocoKey === "bloco4" ? "Gerar o meu DNA da Marca" : "Próximo bloco →"}
        </button>
      </div>
    </div>
  );
}
