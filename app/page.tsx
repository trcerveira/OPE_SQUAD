// Landing page OPB Crew — V3
// Copy de elite: Schwartz, Halbert, Ogilvy, Kennedy, Hormozi, Nicolas Cole
// Posicionamento: algoritmo 2025, conteúdo original, multiplataforma

import BetaWaitlist from "@/components/landing/BetaWaitlist";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0A0E1A] text-[#F0ECE4]">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
            OPB
          </span>
          <span className="font-bold text-[#F0ECE4] text-sm">CREW</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#problema" className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors hidden md:block">
            O Problema
          </a>
          <a href="#como-funciona" className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors hidden md:block">
            Como Funciona
          </a>
          <a href="#waitlist" className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors hidden md:block">
            Lista de Espera
          </a>
          <a
            href="#waitlist"
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Entrar na Lista →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">

        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-10">
          🚀 CONSTRUÍDO PARA O ALGORITMO DE 2025
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#F0ECE4] leading-[1.1] mb-6 max-w-4xl">
          Toda a semana decides{" "}
          <span className="text-[#BFD64B]">o que publicar.</span>
          <br />
          Toda a semana{" "}
          <span className="italic text-[#8892a4]">não publicas nada.</span>
        </h1>

        <p className="text-[#8892a4] text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
          O OPB Crew aprende a tua voz, o teu estilo e o teu ângulo único —
          e gera posts para Instagram, LinkedIn, X e Email{" "}
          <strong className="text-[#F0ECE4]">que soam a ti, não a uma IA.</strong>
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4" id="trial">
          <a
            href="#waitlist"
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold text-lg px-10 py-4 rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
          >
            Quero estar na lista de espera →
          </a>
          <span className="text-[#8892a4] text-sm">
            Grátis · Sem compromisso
          </span>
        </div>

        <div className="mt-14 flex flex-wrap justify-center items-center gap-10 text-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#BFD64B]">4</span>
            <span className="text-[#8892a4]">plataformas cobertas</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#BFD64B]">15 min</span>
            <span className="text-[#8892a4]">para o primeiro post</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#BFD64B]">+60%</span>
            <span className="text-[#8892a4]">mais alcance para conteúdo original*</span>
          </div>
        </div>
        <p className="text-[#4a5568] text-xs mt-4">
          *Dados confirmados por Adam Mosseri (Head do Instagram), Dezembro 2025
        </p>
      </section>

      {/* PROBLEMA */}
      <section id="problema" className="px-6 py-20 border-t border-white/[0.08]">
        <div className="max-w-3xl mx-auto">
          <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-6">O PROBLEMA REAL</div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#F0ECE4] mb-8 leading-tight">
            Não é preguiça.<br />
            <span className="text-[#8892a4]">É falta de sistema.</span>
          </h2>
          <div className="space-y-6 text-[#8892a4] text-lg leading-relaxed">
            <p>
              Tens ideias. O problema é que quando te sentas para criar conteúdo,{" "}
              <strong className="text-[#F0ECE4]">a folha fica em branco durante 40 minutos</strong>{" "}
              — e no fim ainda não tens certeza se o que escreveste soa bem.
            </p>
            <p>
              E mesmo quando publicas, a sensação é sempre a mesma:{" "}
              <strong className="text-[#F0ECE4]">&ldquo;isto não soa a mim.&rdquo;</strong>
            </p>
            <p>
              Não é um problema de criatividade. É um problema de processo.
              Os melhores criadores de conteúdo do mundo não são mais criativos que tu —{" "}
              <strong className="text-[#F0ECE4]">têm um sistema que tu não tens.</strong>
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {[
              "\"Vou publicar amanhã.\" — há 3 semanas",
              "\"Isto não soa a mim.\" — após 2h a escrever",
              "\"Já tentei ferramentas de IA. Parece tudo igual.\"",
              "\"Não sei como aparecer todos os dias sem tempo.\"",
            ].map((quote) => (
              <div key={quote} className="flex items-start gap-3 bg-[#111827] border border-white/[0.05] rounded-lg p-4">
                <span className="text-[#BFD64B] mt-0.5 flex-shrink-0">✗</span>
                <span className="text-[#8892a4] text-sm italic">{quote}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MECANISMO */}
      <section className="px-6 py-20 border-t border-white/[0.08] bg-[#0d1117]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-6">O QUE NOS TORNA DIFERENTES</div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#F0ECE4] mb-6 leading-tight">
            Outras ferramentas geram conteúdo.<br />
            <span className="text-[#BFD64B]">Nós geramos o teu conteúdo.</span>
          </h2>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-10">
            Antes de gerar uma única palavra, o sistema aprende quem tu és:{" "}
            o teu arquétipo de comunicação, o teu vocabulário, as tuas frases assinatura,
            o que nunca dizes. Cada post gerado passa pelo filtro do teu DNA —
            não por um template genérico de copywriter.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-[#111827] border border-red-500/20 rounded-xl p-6">
              <div className="text-red-400 text-xs font-bold tracking-widest mb-4">OUTRAS FERRAMENTAS</div>
              <ul className="space-y-3 text-[#8892a4] text-sm">
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> Prompt genérico = output genérico</li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> Soa igual para todos os utilizadores</li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> Tens de editar 80% do resultado</li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> Vocabulário proibido aparece sempre</li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> Conteúdo genérico penalizado pelo algoritmo</li>
              </ul>
            </div>
            <div className="bg-[#111827] border border-[#BFD64B]/30 rounded-xl p-6">
              <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">OPB CREW</div>
              <ul className="space-y-3 text-[#8892a4] text-sm">
                <li className="flex gap-2"><span className="text-[#BFD64B] flex-shrink-0">✓</span> DNA da tua voz treinado antes do 1.º post</li>
                <li className="flex gap-2"><span className="text-[#BFD64B] flex-shrink-0">✓</span> Vocabulário, frases e tom únicos teus</li>
                <li className="flex gap-2"><span className="text-[#BFD64B] flex-shrink-0">✓</span> Pronto a publicar na 1.ª geração</li>
                <li className="flex gap-2"><span className="text-[#BFD64B] flex-shrink-0">✓</span> Princípios dos melhores copywriters do mundo</li>
                <li className="flex gap-2"><span className="text-[#BFD64B] flex-shrink-0">✓</span> Optimizado para Watch Time, DM Shares e Alcance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* O INSTAGRAM MUDOU AS REGRAS */}
      <section className="px-6 py-20 border-t border-white/[0.08]">
        <div className="max-w-3xl mx-auto">
          <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-6">O INSTAGRAM MUDOU AS REGRAS</div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#F0ECE4] mb-6 leading-tight">
            Conteúdo original tem{" "}
            <span className="text-[#BFD64B]">+60% de alcance.</span>
            <br />
            <span className="text-[#8892a4]">Conteúdo copiado perde 80%.</span>
          </h2>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-8">
            Em Dezembro de 2025, Adam Mosseri (Head do Instagram) confirmou a maior mudança
            algorítmica em anos. A nova regra é simples:{" "}
            <strong className="text-[#F0ECE4]">
              o algoritmo premia conteúdo que só tu poderias criar.
            </strong>
          </p>
          <div className="bg-[#111827] border-l-4 border-[#BFD64B] rounded-r-xl px-6 py-5 mb-8">
            <p className="text-[#F0ECE4] text-lg italic leading-relaxed mb-3">
              &ldquo;A barra mudou de &lsquo;consegues criar?&rsquo; para &lsquo;consegues criar
              algo que só tu poderias criar?&rsquo; Esse é o novo critério.&rdquo;
            </p>
            <p className="text-[#4a5568] text-sm">
              — Adam Mosseri, Head do Instagram · Dezembro 2025
            </p>
          </div>
          <div className="text-[#8892a4] text-sm font-bold tracking-widest mb-4">
            OS 3 FACTORES QUE O ALGORITMO MEDE
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              {
                number: "01",
                title: "Watch Time",
                desc: "Quanto tempo as pessoas ficam. Cada linha tem de ganhar a seguinte.",
              },
              {
                number: "02",
                title: "DM Shares",
                desc: "Quantas vezes o teu post é enviado a um amigo. 3–5× mais peso que likes.",
              },
              {
                number: "03",
                title: "Likes / Alcance",
                desc: "A proporção de pessoas que gostam — não o número total.",
              },
            ].map((f) => (
              <div key={f.number} className="bg-[#111827] border border-white/[0.06] rounded-xl p-5">
                <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-2">{f.number}</div>
                <div className="font-bold text-[#F0ECE4] mb-1">{f.title}</div>
                <p className="text-[#8892a4] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[#8892a4] text-lg leading-relaxed">
            O OPB Crew gera conteúdo com hooks nos primeiros 3 segundos, CTAs que geram
            partilhas por DM, e ângulos únicos impossíveis de copiar —
            porque são baseados no teu Voice DNA e Genius Profile.{" "}
            <strong className="text-[#F0ECE4]">
              Não é só conteúdo. É conteúdo construído para o algoritmo de 2025.
            </strong>
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="px-6 py-20 border-t border-white/[0.08] bg-[#0d1117]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">COMO FUNCIONA</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#F0ECE4]">
              6 passos. Uma vez. Para sempre.
            </h2>
            <p className="text-[#8892a4] mt-4 max-w-xl mx-auto">
              Fazes o setup uma única vez. O sistema aprende quem és, estrutura o teu plano editorial, e depois é só gerar.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex gap-5 items-start bg-[#111827] border border-white/[0.06] rounded-xl p-6">
              <div className="bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                01
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Genius Zone — descobre o teu ângulo único</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  24 perguntas que identificam a tua zona de genialidade, perfil de riqueza e vantagem única.
                  O sistema usa isto para encontrar o ângulo de conteúdo que só tu consegues tomar.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start bg-[#111827] border border-white/[0.06] rounded-xl p-6">
              <div className="bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                02
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Manifesto — define os teus princípios</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  10 princípios que definem como crias e comunicas. A bússola de tudo o que o sistema vai gerar.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start bg-[#111827] border border-[#BFD64B]/20 rounded-xl p-6 relative">
              <div className="absolute top-4 right-4 bg-[#BFD64B] text-[#0A0E1A] text-[9px] font-bold px-2 py-1 rounded tracking-wider">
                O CORAÇÃO DO SISTEMA
              </div>
              <div className="bg-[#BFD64B] text-[#0A0E1A] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                03
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Voz & DNA — codifica a tua voz em 8 perguntas</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  Vocabulário obrigatório, palavras banidas, frases assinatura, regras de estilo.
                  Tudo extraído das tuas respostas — não de um template.
                  A partir daqui, <strong className="text-[#F0ECE4]">cada post passa pelo filtro da tua voz.</strong>
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start bg-[#111827] border border-white/[0.06] rounded-xl p-6">
              <div className="bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                04
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Content Factory — gera, copia, publica</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  Escolhes a plataforma, escreves o tema em 1 frase, clicas Gerar.
                  Em 15 segundos tens um post pronto a copiar —
                  com hook nos 3 primeiros segundos, CTA que gera DM shares,
                  e ângulos únicos que o algoritmo premia.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start bg-[#111827] border border-white/[0.06] rounded-xl p-6">
              <div className="bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                05
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Linhas Editoriais — o teu plano de conteúdo</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  Define os pilares editoriais da tua marca — os temas que vais dominar,
                  a frequência por plataforma, e a estrutura que garante consistência
                  sem teres de reinventar o que publicar cada semana.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start bg-[#111827] border border-white/[0.06] rounded-xl p-6">
              <div className="bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                06
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Calendário de Conteúdos — agenda e tracking</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  Visualiza o que está planeado, o que foi publicado, e o que está pendente.
                  Nunca mais ficas sem saber o que publicar amanhã —
                  o sistema gere o pipeline por ti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OBJECÇÃO */}
      <section className="px-6 py-20 border-t border-white/[0.08]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-3xl mb-6">🤔</div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#F0ECE4] mb-6">
            &ldquo;Mas vai soar a IA, não vai?&rdquo;
          </h2>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-6">
            É a pergunta certa. E a resposta honesta é:{" "}
            <strong className="text-[#F0ECE4]">depende do que lhe dás.</strong>
          </p>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-6">
            A maioria das ferramentas usa prompts genéricos. O output é previsível porque o input é previsível.
            O OPB Crew usa as tuas respostas literalmente — o teu vocabulário específico,
            as tuas frases, as palavras que nunca dizes. A IA é treinada
            para imitar a tua voz, não para substituí-la.
          </p>
          <p className="text-[#8892a4] text-lg leading-relaxed">
            O resultado não é perfeito. Mas é o ponto de partida mais próximo da tua voz
            que alguma vez conseguiste sem escrever tu próprio.{" "}
            <strong className="text-[#F0ECE4]">Editas 20% em vez de escrever 100%.</strong>
          </p>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="px-6 py-20 border-t border-white/[0.08] bg-[#0d1117]">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">O QUE ESTÁ A SER CONSTRUÍDO</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#F0ECE4]">
              Tudo o que vais ter<br />quando lançarmos.
            </h2>
          </div>
          <div className="bg-[#111827] border border-[#BFD64B]/30 rounded-2xl p-8">
            <div className="space-y-3 mb-8">
              {[
                "Genius Zone — descobrir o teu ângulo único",
                "Manifesto — os teus princípios de criação",
                "Voz & DNA — o teu sistema de voz codificado",
                "Content Factory — posts para 4 plataformas",
                "Ângulos Únicos — 5 ângulos que só tu podes tomar",
                "Linhas Editoriais — estrutura editorial por tema e pilar",
                "Calendário de Conteúdos — agenda e tracking do que publicas",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-[#8892a4]">
                  <span className="text-[#BFD64B] flex-shrink-0">✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.08] pt-6 mb-6">
              <div className="text-center">
                <div className="text-[#8892a4] text-sm mb-1">Preço a anunciar em breve</div>
                <div className="text-4xl font-bold text-[#F0ECE4]">
                  Em breve
                  <span className="text-lg text-[#8892a4] font-normal ml-2">— lista de espera aberta</span>
                </div>
              </div>
            </div>
            <a
              href="#waitlist"
              className="block bg-[#BFD64B] text-[#0A0E1A] font-bold py-4 text-center rounded-xl hover:opacity-90 transition-opacity text-lg"
            >
              Entrar na lista de espera →
            </a>
            <p className="text-[#8892a4] text-xs text-center mt-4">
              Sem spam. Avisamos-te quando lançarmos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-24 border-t border-white/[0.08] bg-[#0d1117]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F0ECE4] mb-6 leading-tight">
            O teu concorrente está a publicar agora.<br />
            <span className="text-[#8892a4]">Tu estás a ler landing pages.</span>
          </h2>
          <p className="text-[#8892a4] text-lg mb-10">
            15 minutos para configurar. Uma vida de conteúdo na tua voz.
          </p>
          <a
            href="#waitlist"
            className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold text-lg px-12 py-5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Entrar na lista de espera →
          </a>
        </div>
      </section>

      {/* LISTA DE ESPERA */}
      <section id="waitlist" className="px-6 py-20 border-t border-white/[0.08] bg-[#0d1117]">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-8">
            🚀 LISTA DE ESPERA DE LANÇAMENTO
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#F0ECE4] mb-4 leading-tight">
            Sê o primeiro a saber.
          </h2>
          <p className="text-[#8892a4] text-lg mb-10 leading-relaxed">
            O OPB Crew está a ser construído. Quando lançarmos,
            avisamos-te — antes de toda a gente.
          </p>
          <BetaWaitlist />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-8 border-t border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
            OPB
          </span>
          <span className="text-[#8892a4] text-sm">CREW — One Person Business</span>
        </div>
        <span className="text-[#8892a4] text-xs">v0.3 · 2026</span>
      </footer>

    </main>
  );
}
