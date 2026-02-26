// Landing page OPE_SQUAD — V1
// Problema: solopreneur não consegue aparecer todos os dias sem gastar 4h a criar conteúdo
// Solução: Content Engine alimentado por AIOS + Claude API

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
            OPE
          </span>
          <span className="font-bold text-[#F0ECE4] text-sm">SQUAD</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#problema" className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors">
            Problema
          </a>
          <a href="#solucao" className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors">
            Solução
          </a>
          <a href="#precos" className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors">
            Preços
          </a>
          <a
            href="#trial"
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Começar Grátis
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-8">
          ⚡ CONTENT ENGINE V1
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-[#F0ECE4] leading-tight mb-6 max-w-4xl">
          One Person.{" "}
          <span className="text-[#BFD64B]">Full Squad Power.</span>
        </h1>

        <p className="text-[#8892a4] text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
          Cria 30 dias de conteúdo em{" "}
          <strong className="text-[#F0ECE4]">15 minutos</strong>.
          Publicado automaticamente. Em todo o lado. Sem tocar no terminal.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4" id="trial">
          <a
            href="#"
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold text-lg px-10 py-4 rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            Começar Grátis — 7 dias
          </a>
          <span className="text-[#8892a4] text-sm">
            Cartão obrigatório · Cancela quando quiseres
          </span>
        </div>

        {/* Prova social minimal */}
        <div className="mt-12 flex items-center gap-8 text-[#8892a4] text-sm">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-[#BFD64B]">30</span>
            <span>posts/mês</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-[#BFD64B]">4</span>
            <span>plataformas</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-[#BFD64B]">15min</span>
            <span>de setup</span>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="problema" className="px-6 py-20 border-t border-white/[0.08]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">O PROBLEMA</div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#F0ECE4] mb-6">
            Sabes o que vendes. Mas não apareces.
          </h2>
          <p className="text-[#8892a4] text-lg leading-relaxed">
            90% dos solopreneurs criam conteúdo de forma inconsistente. Não é falta de ideias — é falta de sistema.
            Gastas 4 horas por semana a criar conteúdo que podia ser feito em 15 minutos.
          </p>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section id="solucao" className="px-6 py-20 border-t border-white/[0.08]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">A SOLUÇÃO</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#F0ECE4]">
              3 passos. Depois é automático.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-6">
              <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">PASSO 01</div>
              <h3 className="text-lg font-bold text-[#F0ECE4] mb-3">Onboarding (15 min)</h3>
              <p className="text-[#8892a4] text-sm leading-relaxed">
                Respondes a 5 perguntas sobre o teu nicho, oferta e voz. O sistema cria o teu Voice DNA.
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-[#111827] border border-[#BFD64B]/30 rounded-xl p-6 relative">
              <div className="absolute top-3 right-3 bg-[#BFD64B] text-[#0A0E1A] text-[9px] font-bold px-2 py-1 rounded">
                MÁGICA
              </div>
              <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">PASSO 02</div>
              <h3 className="text-lg font-bold text-[#F0ECE4] mb-3">Content Factory</h3>
              <p className="text-[#8892a4] text-sm leading-relaxed">
                O AIOS gera 30 posts adaptados para Instagram, LinkedIn, X e Email. Com a tua voz. Com CTA.
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-6">
              <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">PASSO 03</div>
              <h3 className="text-lg font-bold text-[#F0ECE4] mb-3">Publish & Track</h3>
              <p className="text-[#8892a4] text-sm leading-relaxed">
                Aprovas em 1 clique. O sistema agenda e publica nos melhores horários. Tu só vês os resultados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="px-6 py-20 border-t border-white/[0.08]">
        <div className="max-w-md mx-auto text-center">
          <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-4">PREÇOS</div>
          <div className="bg-[#111827] border border-[#BFD64B]/30 rounded-2xl p-8">
            <div className="text-4xl font-bold text-[#F0ECE4] mb-2">
              $<span className="text-[#BFD64B]">X</span>
              <span className="text-lg text-[#8892a4] font-normal">/mês</span>
            </div>
            <p className="text-[#8892a4] text-sm mb-6">7 dias grátis · Cancela quando quiseres</p>
            <a
              href="#"
              className="block bg-[#BFD64B] text-[#0A0E1A] font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Começar Trial Grátis
            </a>
            <p className="text-[#8892a4] text-xs mt-4">Cartão obrigatório. Cobrado no Day 8.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-8 border-t border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
            OPE
          </span>
          <span className="text-[#8892a4] text-sm">SQUAD — One Person Empire</span>
        </div>
        <span className="text-[#8892a4] text-xs">v0.1 · Fev 2026</span>
      </footer>

    </main>
  );
}
