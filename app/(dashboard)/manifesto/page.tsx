"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Manifesto do OPE_SQUAD — declaração de princípios para solopreneurs
// Lido uma vez. Aceito para desbloquear o Voice DNA.

const blocos = [
  {
    numero: "01",
    titulo: "Tu és uma empresa de uma pessoa.",
    corpo:
      "Não és um freelancer à espera de emprego. Não és um hobbyist com um projecto de fim-de-semana. És o fundador, o produto, o marketing e o sistema — tudo ao mesmo tempo. Isso assusta a maioria. Para nós, é o ponto de partida.",
    destaque: "Uma empresa de uma pessoa é a estrutura de negócio mais poderosa da história moderna.",
  },
  {
    numero: "02",
    titulo: "O conteúdo genérico está a destruir o teu negócio.",
    corpo:
      "Todos os dias, milhares de solopreneurs publicam os mesmos conselhos embrulhados em carrosséis diferentes. Mesmas frases. Mesmos ganchos. Mesma paleta de cores. O mercado está saturado de conteúdo que podia ter sido escrito por qualquer pessoa — e por isso não converte para ninguém.",
    destaque: "Quando o teu conteúdo soa como toda a gente, o teu negócio comporta-se como toda a gente: invisível.",
  },
  {
    numero: "03",
    titulo: "Existe um genius dentro de ti. Ainda não o descobriste.",
    corpo:
      "Não é talento. Não é sorte. É a zona onde trabalhas sem esforço, onde o teu melhor sai sem te custar nada, onde os outros ficam impressionados com o que para ti parece óbvio. Gay Hendricks chamou-lhe Genius Zone. Roger Hamilton chamou-lhe Wealth Profile. A ciência chama-lhe vantagem comparativa. Nós chamamos-lhe o teu ponto de partida.",
    destaque: "Antes de criar qualquer conteúdo, tens de saber de onde ele vem.",
  },
  {
    numero: "04",
    titulo: "A tua voz autêntica não pode ser copiada — nem pela IA.",
    corpo:
      "Qualquer ferramenta de IA consegue escrever um post sobre produtividade. Nenhuma consegue replicar a tua perspectiva específica, construída por anos de experiência, falhanços, epifanias e conversas difíceis. O teu diferencial não é o que sabes — é como só tu vês o que sabes.",
    destaque: "A autenticidade é a única vantagem competitiva que não conseguem escalar contra ti.",
  },
  {
    numero: "05",
    titulo: "O sistema bate sempre a força de vontade.",
    corpo:
      "Publicar de forma consistente por motivação é uma mentira que a indústria te vendeu. A motivação varia. O humor varia. A vida acontece. Os criadores que dominam o conteúdo não têm mais disciplina do que tu — têm um sistema que funciona mesmo quando eles não estão com vontade.",
    destaque: "Um motor não precisa de estar motivado para funcionar. Só precisa de estar ligado.",
  },
  {
    numero: "06",
    titulo: "Um solopreneur com o sistema certo bate uma equipa inteira.",
    corpo:
      "Não precisas de uma agência. Não precisas de uma equipa de cinco pessoas. Precisas do sistema certo, das ferramentas certas e da clareza sobre o que só tu podes fazer. Com isso, um solopreneur em três horas por semana produz mais conteúdo relevante do que uma equipa inteira a trabalhar às cegas.",
    destaque: "O leverage não vem de ter mais gente — vem de ter o sistema certo.",
  },
  {
    numero: "07",
    titulo: "Conteúdo sem identidade é apenas ruído.",
    corpo:
      "Podes publicar todos os dias e crescer zero. Podes ter os melhores conselhos do nicho e ser completamente ignorado. Porque o problema não é a quantidade nem a qualidade — é a identidade. Sem uma voz clara, sem um posicionamento específico, sem um ponto de vista inconfundível, és apenas mais um post no feed.",
    destaque: "O teu conteúdo tem de soar a ti — ou não serve para nada.",
  },
  {
    numero: "08",
    titulo: "Não precisas de mais ideias. Precisas de um motor.",
    corpo:
      "O problema do solopreneur não é falta de ideias. É transformar ideias em conteúdo publicado de forma consistente, sem perder horas em frente a um ecrã em branco. O OPE_SQUAD é esse motor — usa o teu genius, a tua voz e os teus temas para gerar conteúdo que soa exactamente como tu.",
    destaque: "Um motor de conteúdo não substitui a tua voz. Amplifica-a.",
  },
  {
    numero: "09",
    titulo: "Já não estás sozinho.",
    corpo:
      "O OPE_SQUAD nasceu para os que escolheram o caminho mais difícil e mais libertador ao mesmo tempo. Para quem recusou o escritório, a reunião às 9h e o chefe de quem não aprendeu nada. Para quem aposta em si mesmo. Para quem sabe que tem algo valioso para dizer — e ainda não encontrou a forma de o dizer de forma consistente.",
    destaque: "Este sistema foi construído para pessoas como tu.",
  },
  {
    numero: "10",
    titulo: "O compromisso.",
    corpo:
      "Ao aceitar este manifesto, não estás a comprar uma ferramenta. Estás a comprometer-te com um processo. A descobrir quem és (Genius Zone). A definir como comunicar (Voice DNA). A criar conteúdo de forma sistemática (Content Factory). Não é um atalho. É o caminho.",
    destaque: "O melhor conteúdo da tua vida ainda não foi escrito. Vamos mudá-lo.",
  },
];

export default function ManifestoPage() {
  const { user } = useUser();
  const router = useRouter();
  const [aceitando, setAceitando] = useState(false);
  const [aceito, setAceito] = useState(false);

  async function handleAceitar() {
    if (!user) return;
    setAceitando(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          manifestoComplete: true,
        },
      });
      setAceito(true);
      // Aguarda breve momento antes de redirecionar
      setTimeout(() => router.push("/onboarding"), 1200);
    } catch (err) {
      console.error("Erro ao guardar manifesto:", err);
      setAceitando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0E1A]">

      {/* Cabeçalho */}
      <div className="border-b border-[#1a2035] px-8 py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
          PASSO 2 DE 4 — MANIFESTO
        </div>
        <h1 className="text-5xl font-black text-[#F0ECE4] mb-4 leading-tight">
          O Manifesto<br />
          <span className="text-[#BFD64B]">do Solopreneur</span>
        </h1>
        <p className="text-[#8892a4] text-lg max-w-xl mx-auto leading-relaxed">
          Antes de criares qualquer conteúdo, tens de saber o que acreditas.
          Lê. Reflecte. Aceita — ou não continues.
        </p>
      </div>

      {/* Blocos do manifesto */}
      <div className="max-w-3xl mx-auto px-8 py-16 space-y-20">
        {blocos.map((bloco) => (
          <div key={bloco.numero} className="group">

            {/* Número do bloco */}
            <div className="text-[#BFD64B]/30 text-8xl font-black leading-none mb-4 select-none">
              {bloco.numero}
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-[#F0ECE4] mb-4 leading-snug">
              {bloco.titulo}
            </h2>

            {/* Corpo */}
            <p className="text-[#8892a4] text-base leading-relaxed mb-6">
              {bloco.corpo}
            </p>

            {/* Destaque */}
            <div className="border-l-2 border-[#BFD64B] pl-5">
              <p className="text-[#F0ECE4] font-medium text-base italic leading-relaxed">
                &ldquo;{bloco.destaque}&rdquo;
              </p>
            </div>

            {/* Separador (excepto no último) */}
            {bloco.numero !== "10" && (
              <div className="mt-20 h-px bg-gradient-to-r from-transparent via-[#1a2035] to-transparent" />
            )}
          </div>
        ))}

        {/* CTA final */}
        <div className="pt-12 pb-8 text-center">
          <div className="bg-[#111827] border border-[#1a2035] rounded-2xl p-10">
            <div className="text-4xl mb-4">✊</div>
            <h3 className="text-2xl font-bold text-[#F0ECE4] mb-3">
              Acreditas nisto?
            </h3>
            <p className="text-[#8892a4] text-base mb-8 max-w-md mx-auto leading-relaxed">
              Se sim, aceita o manifesto e avança para a próxima etapa: definir o teu Voice DNA.
            </p>

            {aceito ? (
              <div className="flex items-center justify-center gap-3 text-[#BFD64B] font-bold text-lg">
                <span className="text-2xl">✓</span>
                Manifesto aceite. A redirecionar...
              </div>
            ) : (
              <button
                onClick={handleAceitar}
                disabled={aceitando}
                className="inline-flex items-center gap-3 bg-[#BFD64B] text-[#0A0E1A] font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {aceitando ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A] rounded-full animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    Aceito o Manifesto →
                  </>
                )}
              </button>
            )}

            <p className="text-[#4a5568] text-xs mt-6">
              Próximo passo: Voice DNA — as 5 perguntas que definem a tua voz única
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
