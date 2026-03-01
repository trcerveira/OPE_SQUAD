// Landing page OPB Crew — V4
// Copy: Schwartz, Halbert, Ogilvy, Kennedy, Hormozi, Nicolas Cole
// Flow: register via Clerk, beta check in middleware

import Link from "next/link";

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
          <Link href="/sign-in" className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors hidden md:block">
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Criar Conta
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">

        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-10">
          BUILT FOR THE 2025 ALGORITHM
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#F0ECE4] leading-[1.1] mb-6 max-w-4xl">
          Toda a semana decides{" "}
          <span className="text-[#BFD64B]">o que publicar.</span>
          <br />
          Toda a semana{" "}
          <span className="italic text-[#8892a4]">nao publicas nada.</span>
        </h1>

        <p className="text-[#8892a4] text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
          O OPB Crew aprende a tua voz, o teu estilo e o teu angulo unico —
          e gera posts para Instagram, LinkedIn, X e Email{" "}
          <strong className="text-[#F0ECE4]">que soam a ti, nao a uma IA.</strong>
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/sign-up"
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold text-lg px-10 py-4 rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
          >
            Criar Conta Gratis
          </Link>
          <span className="text-[#8892a4] text-sm">
            Sem compromisso
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
            <span className="text-[#8892a4]">mais alcance para conteudo original*</span>
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
            Nao e preguica.<br />
            <span className="text-[#8892a4]">E falta de sistema.</span>
          </h2>
          <div className="space-y-6 text-[#8892a4] text-lg leading-relaxed">
            <p>
              Tens ideias. O problema e que quando te sentas para criar conteudo,{" "}
              <strong className="text-[#F0ECE4]">a folha fica em branco durante 40 minutos</strong>{" "}
              — e no fim ainda nao tens certeza se o que escreveste soa bem.
            </p>
            <p>
              E mesmo quando publicas, a sensacao e sempre a mesma:{" "}
              <strong className="text-[#F0ECE4]">&ldquo;isto nao soa a mim.&rdquo;</strong>
            </p>
            <p>
              Nao e um problema de criatividade. E um problema de processo.
              Os melhores criadores de conteudo do mundo nao sao mais criativos que tu —{" "}
              <strong className="text-[#F0ECE4]">tem um sistema que tu nao tens.</strong>
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {[
              "\"Vou publicar amanha.\" — ha 3 semanas",
              "\"Isto nao soa a mim.\" — apos 2h a escrever",
              "\"Ja tentei ferramentas de IA. Parece tudo igual.\"",
              "\"Nao sei como aparecer todos os dias sem tempo.\"",
            ].map((quote) => (
              <div key={quote} className="flex items-start gap-3 bg-[#111827] border border-white/[0.05] rounded-lg p-4">
                <span className="text-[#BFD64B] mt-0.5 flex-shrink-0">x</span>
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
            Outras ferramentas geram conteudo.<br />
            <span className="text-[#BFD64B]">Nos geramos o teu conteudo.</span>
          </h2>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-10">
            Antes de gerar uma unica palavra, o sistema aprende quem tu es:{" "}
            o teu arquetipo de comunicacao, o teu vocabulario, as tuas frases assinatura,
            o que nunca dizes. Cada post gerado passa pelo filtro do teu DNA —
            nao por um template generico de copywriter.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-[#111827] border border-red-500/20 rounded-xl p-6">
              <div className="text-red-400 text-xs font-bold tracking-widest mb-4">OUTRAS FERRAMENTAS</div>
              <ul className="space-y-3 text-[#8892a4] text-sm">
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">x</span> Prompt generico = output generico</li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">x</span> Soa igual para todos os utilizadores</li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">x</span> Tens de editar 80% do resultado</li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">x</span> Vocabulario proibido aparece sempre</li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">x</span> Conteudo generico penalizado pelo algoritmo</li>
              </ul>
            </div>
            <div className="bg-[#111827] border border-[#BFD64B]/30 rounded-xl p-6">
              <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">OPB CREW</div>
              <ul className="space-y-3 text-[#8892a4] text-sm">
                <li className="flex gap-2"><span className="text-[#BFD64B] flex-shrink-0">+</span> DNA da tua voz treinado antes do 1.o post</li>
                <li className="flex gap-2"><span className="text-[#BFD64B] flex-shrink-0">+</span> Vocabulario, frases e tom unicos teus</li>
                <li className="flex gap-2"><span className="text-[#BFD64B] flex-shrink-0">+</span> Pronto a publicar na 1.a geracao</li>
                <li className="flex gap-2"><span className="text-[#BFD64B] flex-shrink-0">+</span> Principios dos melhores copywriters do mundo</li>
                <li className="flex gap-2"><span className="text-[#BFD64B] flex-shrink-0">+</span> Optimizado para Watch Time, DM Shares e Alcance</li>
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
            Conteudo original tem{" "}
            <span className="text-[#BFD64B]">+60% de alcance.</span>
            <br />
            <span className="text-[#8892a4]">Conteudo copiado perde 80%.</span>
          </h2>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-8">
            Em Dezembro de 2025, Adam Mosseri (Head do Instagram) confirmou a maior mudanca
            algoritmica em anos. A nova regra e simples:{" "}
            <strong className="text-[#F0ECE4]">
              o algoritmo premia conteudo que so tu poderias criar.
            </strong>
          </p>
          <div className="bg-[#111827] border-l-4 border-[#BFD64B] rounded-r-xl px-6 py-5 mb-8">
            <p className="text-[#F0ECE4] text-lg italic leading-relaxed mb-3">
              &ldquo;A barra mudou de &lsquo;consegues criar?&rsquo; para &lsquo;consegues criar
              algo que so tu poderias criar?&rsquo; Esse e o novo criterio.&rdquo;
            </p>
            <p className="text-[#4a5568] text-sm">
              — Adam Mosseri, Head do Instagram, Dezembro 2025
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
                desc: "Quantas vezes o teu post e enviado a um amigo. 3-5x mais peso que likes.",
              },
              {
                number: "03",
                title: "Likes / Alcance",
                desc: "A proporcao de pessoas que gostam — nao o numero total.",
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
            O OPB Crew gera conteudo com hooks nos primeiros 3 segundos, CTAs que geram
            partilhas por DM, e angulos unicos impossiveis de copiar —
            porque sao baseados no teu Voice DNA e Genius Profile.{" "}
            <strong className="text-[#F0ECE4]">
              Nao e so conteudo. E conteudo construido para o algoritmo de 2025.
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
              Fazes o setup uma unica vez. O sistema aprende quem es, estrutura o teu plano editorial, e depois e so gerar.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex gap-5 items-start bg-[#111827] border border-white/[0.06] rounded-xl p-6">
              <div className="bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                01
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Genius Zone — descobre o teu angulo unico</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  24 perguntas que identificam a tua zona de genialidade, perfil de riqueza e vantagem unica.
                  O sistema usa isto para encontrar o angulo de conteudo que so tu consegues tomar.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start bg-[#111827] border border-white/[0.06] rounded-xl p-6">
              <div className="bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                02
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Manifesto — define os teus principios</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  10 principios que definem como crias e comunicas. A bussola de tudo o que o sistema vai gerar.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start bg-[#111827] border border-[#BFD64B]/20 rounded-xl p-6 relative">
              <div className="absolute top-4 right-4 bg-[#BFD64B] text-[#0A0E1A] text-[9px] font-bold px-2 py-1 rounded tracking-wider">
                O CORACAO DO SISTEMA
              </div>
              <div className="bg-[#BFD64B] text-[#0A0E1A] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                03
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Voz & DNA — codifica a tua voz em 8 perguntas</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  Vocabulario obrigatorio, palavras banidas, frases assinatura, regras de estilo.
                  Tudo extraido das tuas respostas — nao de um template.
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
                  e angulos unicos que o algoritmo premia.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start bg-[#111827] border border-white/[0.06] rounded-xl p-6">
              <div className="bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                05
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Linhas Editoriais — o teu plano de conteudo</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  Define os pilares editoriais da tua marca — os temas que vais dominar,
                  a frequencia por plataforma, e a estrutura que garante consistencia
                  sem teres de reinventar o que publicar cada semana.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start bg-[#111827] border border-white/[0.06] rounded-xl p-6">
              <div className="bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] font-bold text-sm w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                06
              </div>
              <div>
                <h3 className="font-bold text-[#F0ECE4] mb-1">Calendario de Conteudos — agenda e tracking</h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  Visualiza o que esta planeado, o que foi publicado, e o que esta pendente.
                  Nunca mais ficas sem saber o que publicar amanha —
                  o sistema gere o pipeline por ti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OBJECAO */}
      <section className="px-6 py-20 border-t border-white/[0.08]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#F0ECE4] mb-6">
            &ldquo;Mas vai soar a IA, nao vai?&rdquo;
          </h2>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-6">
            E a pergunta certa. E a resposta honesta e:{" "}
            <strong className="text-[#F0ECE4]">depende do que lhe das.</strong>
          </p>
          <p className="text-[#8892a4] text-lg leading-relaxed mb-6">
            A maioria das ferramentas usa prompts genericos. O output e previsivel porque o input e previsivel.
            O OPB Crew usa as tuas respostas literalmente — o teu vocabulario especifico,
            as tuas frases, as palavras que nunca dizes. A IA e treinada
            para imitar a tua voz, nao para substitui-la.
          </p>
          <p className="text-[#8892a4] text-lg leading-relaxed">
            O resultado nao e perfeito. Mas e o ponto de partida mais proximo da tua voz
            que alguma vez conseguiste sem escrever tu proprio.{" "}
            <strong className="text-[#F0ECE4]">Editas 20% em vez de escrever 100%.</strong>
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-24 border-t border-white/[0.08] bg-[#0d1117]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F0ECE4] mb-6 leading-tight">
            O teu concorrente esta a publicar agora.<br />
            <span className="text-[#8892a4]">Tu estas a ler landing pages.</span>
          </h2>
          <p className="text-[#8892a4] text-lg mb-10">
            15 minutos para configurar. Uma vida de conteudo na tua voz.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold text-lg px-12 py-5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Criar Conta Gratis
          </Link>
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
        <span className="text-[#8892a4] text-xs">v0.4 · 2026</span>
      </footer>

    </main>
  );
}
