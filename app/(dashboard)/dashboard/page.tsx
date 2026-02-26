import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

// Dashboard principal — rota protegida
// Adapta-se conforme o utilizador completa as etapas
export default async function DashboardPage() {
  const user = await currentUser();
  const onboardingComplete = user?.unsafeMetadata?.onboardingComplete as boolean;

  return (
    <main className="min-h-screen px-8 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
            OPE
          </span>
          <span className="font-bold text-[#F0ECE4] text-sm">SQUAD</span>
        </div>
        <span className="text-[#8892a4] text-sm">
          Olá, {user?.firstName ?? "solopreneur"} 👋
        </span>
      </div>

      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
          ⚡ CONTENT ENGINE V1
        </div>
        <h1 className="text-4xl font-bold text-[#F0ECE4] mb-4">
          {onboardingComplete
            ? `Pronto para criar, ${user?.firstName ?? "solopreneur"}.`
            : "Bem-vindo ao OPE_SQUAD"}
        </h1>
        <p className="text-[#8892a4] text-lg leading-relaxed mb-8">
          {onboardingComplete
            ? "O teu Voice DNA está activo. Gera conteúdo para qualquer plataforma na tua voz."
            : "Vamos criar o teu Voice DNA para começar a gerar o teu conteúdo automaticamente."}
        </p>

        {/* Cards de acção — adapta-se ao estado */}
        <div className="flex flex-col gap-4">

          {/* Card 1: Onboarding */}
          <div className={`rounded-xl p-6 border ${
            onboardingComplete
              ? "bg-[#0d1420] border-[#1a2035]"
              : "bg-[#111827] border-[#BFD64B]/30"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xs font-bold tracking-widest ${
                onboardingComplete ? "text-[#4a5568]" : "text-[#BFD64B]"
              }`}>
                PASSO 1 DE 3
              </div>
              {onboardingComplete && (
                <span className="text-[#BFD64B] text-xs font-bold">✓ Completo</span>
              )}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              onboardingComplete ? "text-[#4a5568]" : "text-[#F0ECE4]"
            }`}>
              Voice DNA
            </h2>
            <p className="text-[#8892a4] text-sm mb-4">
              5 perguntas sobre o teu nicho, oferta e tom de voz. Uma vez só.
            </p>
            {!onboardingComplete && (
              <Link
                href="/onboarding"
                className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Começar Onboarding →
              </Link>
            )}
          </div>

          {/* Card 2: Content Factory */}
          <div className={`rounded-xl p-6 border ${
            onboardingComplete
              ? "bg-[#111827] border-[#BFD64B]/30"
              : "bg-[#0d1420] border-[#1a2035] opacity-60"
          }`}>
            <div className={`text-xs font-bold tracking-widest mb-3 ${
              onboardingComplete ? "text-[#BFD64B]" : "text-[#4a5568]"
            }`}>
              PASSO 2 DE 3
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              onboardingComplete ? "text-[#F0ECE4]" : "text-[#4a5568]"
            }`}>
              Content Factory
            </h2>
            <p className="text-[#8892a4] text-sm mb-4">
              Gera posts para Instagram, LinkedIn, X e Email na tua voz em segundos.
            </p>
            {onboardingComplete && (
              <Link
                href="/content"
                className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Gerar Conteúdo →
              </Link>
            )}
          </div>

          {/* Card 3: Publish (em breve) */}
          <div className="bg-[#0d1420] border border-[#1a2035] rounded-xl p-6 opacity-40">
            <div className="text-[#4a5568] text-xs font-bold tracking-widest mb-3">
              PASSO 3 DE 3 — EM BREVE
            </div>
            <h2 className="text-xl font-bold text-[#4a5568] mb-2">
              Auto-Publish
            </h2>
            <p className="text-[#4a5568] text-sm">
              Agenda e publica automaticamente nas tuas redes sociais.
            </p>
          </div>

        </div>
      </div>

    </main>
  );
}
