import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/config/admins";
import { syncUserProfile } from "@/lib/supabase/user-profiles";

// Dashboard — mandatory pipeline: Voice DNA → Content Factory
// Optional modules: Genius Zone + Manifesto (always accessible)
export default async function DashboardPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const admin = isAdmin(email);
  const geniusComplete    = user?.unsafeMetadata?.geniusComplete    as boolean;
  const manifestoComplete = user?.unsafeMetadata?.manifestoComplete as boolean;
  const vozDNAComplete    = user?.unsafeMetadata?.vozDNAComplete    as boolean;

  // Sync profile with Supabase on every dashboard visit
  if (user?.id) {
    await syncUserProfile({
      userId:            user.id,
      email:             email ?? "",
      name:              user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : null,
      geniusComplete:    geniusComplete    ?? false,
      manifestoComplete: manifestoComplete ?? false,
      vozDNAComplete:    vozDNAComplete    ?? false,
    });
  }

  // Dynamic hero text based on pipeline progress
  const tituloHero = vozDNAComplete
    ? `Pronto para criar, ${user?.firstName ?? "solopreneur"}.`
    : `Começa pelo teu Voz & DNA, ${user?.firstName ?? "solopreneur"}.`;

  const subtituloHero = vozDNAComplete
    ? "O teu Voz & DNA está activo. Gera conteúdo para qualquer plataforma na tua voz."
    : "Define a tua voz única em 8 perguntas. Tudo o resto segue-se.";

  return (
    <main className="px-4 sm:px-8 py-10">
      <div className="max-w-2xl">

        {/* Super Admin badge — visible only to admins */}
        {admin && (
          <Link href="/admin" className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-4 hover:bg-red-500/20 transition-colors">
            🔑 SUPER ADMIN — Ver Painel →
          </Link>
        )}

        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
          ⚡ CONTENT ENGINE V1
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#F0ECE4] mb-4">
          {tituloHero}
        </h1>
        <p className="text-[#8892a4] text-lg leading-relaxed mb-8">
          {subtituloHero}
        </p>

        {/* ── MANDATORY PIPELINE ── */}
        <div className="flex flex-col gap-4">

          {/* Step 1: Voz & DNA (mandatory) */}
          <div className={`rounded-xl p-6 border transition-all ${
            vozDNAComplete
              ? "bg-[#0d1420] border-[#1a2035]"
              : "bg-[#111827] border-[#BFD64B]/30"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xs font-bold tracking-widest ${
                vozDNAComplete ? "text-[#4a5568]" : "text-[#BFD64B]"
              }`}>
                PASSO 1 DE 2
              </div>
              {vozDNAComplete && (
                <span className="text-[#BFD64B] text-xs font-bold">✓ Completo</span>
              )}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              vozDNAComplete ? "text-[#4a5568]" : "text-[#F0ECE4]"
            }`}>
              🎙️ Voz & DNA
            </h2>
            <p className="text-[#8892a4] text-sm mb-4">
              8 perguntas que codificam a tua voz única — tom, vocabulário, frases assinatura e estilo. O motor de IA vai usá-las em tudo.
            </p>
            {!vozDNAComplete ? (
              <Link
                href="/voz-dna"
                className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Definir o meu Voz & DNA →
              </Link>
            ) : (
              <Link
                href="/voz-dna"
                className="text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors"
              >
                Ver DNA →
              </Link>
            )}
          </div>

          {/* Step 2: Content Factory (mandatory — unlocked by vozDNAComplete) */}
          <div className={`rounded-xl p-6 border ${
            vozDNAComplete
              ? "bg-[#111827] border-[#BFD64B]/30"
              : "bg-[#0d1420] border-[#1a2035] opacity-50"
          }`}>
            <div className={`text-xs font-bold tracking-widest mb-3 ${
              vozDNAComplete ? "text-[#BFD64B]" : "text-[#4a5568]"
            }`}>
              PASSO 2 DE 2
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              vozDNAComplete ? "text-[#F0ECE4]" : "text-[#4a5568]"
            }`}>
              ✍️ Content Factory
            </h2>
            <p className="text-[#8892a4] text-sm mb-4">
              Gera posts para Instagram, LinkedIn, X e Email na tua voz em segundos.
            </p>
            {vozDNAComplete && (
              <Link
                href="/content"
                className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Gerar Conteúdo →
              </Link>
            )}
          </div>

          {/* Auto-Publish (coming soon) */}
          <div className="bg-[#0d1420] border border-[#1a2035] rounded-xl p-6 opacity-40">
            <div className="text-[#4a5568] text-xs font-bold tracking-widest mb-3">
              EM BREVE
            </div>
            <h2 className="text-xl font-bold text-[#4a5568] mb-2">
              🚀 Auto-Publish
            </h2>
            <p className="text-[#4a5568] text-sm">
              Agenda e publica automaticamente nas tuas redes sociais.
            </p>
          </div>

        </div>

        {/* ── OPTIONAL MODULES ── */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#1a2035]" />
            <span className="text-[#4a5568] text-xs font-bold tracking-widest">
              OPCIONAL — EXPLORA
            </span>
            <div className="h-px flex-1 bg-[#1a2035]" />
          </div>

          <div className="flex flex-col gap-4">

            {/* Optional: Genius Zone */}
            <div className="bg-[#0d1420] border border-[#1a2035] rounded-xl p-5 transition-all hover:border-[#2a3045]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[#4a5568] text-xs font-bold tracking-widest">
                  OPCIONAL
                </div>
                {geniusComplete && (
                  <span className="text-purple-400 text-xs font-bold">✓ Completo</span>
                )}
              </div>
              <h2 className="text-lg font-bold text-[#8892a4] mb-2">
                🧬 Genius Zone
              </h2>
              <p className="text-[#4a5568] text-sm mb-3">
                Descobre a tua zona de genialidade, perfil de riqueza e vantagem única. 24 perguntas.
              </p>
              <Link
                href="/genius"
                className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors"
              >
                {geniusComplete ? "Ver perfil →" : "Explorar →"}
              </Link>
            </div>

            {/* Optional: Manifesto */}
            <div className="bg-[#0d1420] border border-[#1a2035] rounded-xl p-5 transition-all hover:border-[#2a3045]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[#4a5568] text-xs font-bold tracking-widest">
                  OPCIONAL
                </div>
                {manifestoComplete && (
                  <span className="text-[#BFD64B] text-xs font-bold">✓ Completo</span>
                )}
              </div>
              <h2 className="text-lg font-bold text-[#8892a4] mb-2">
                📜 Manifesto
              </h2>
              <p className="text-[#4a5568] text-sm mb-3">
                Os 10 princípios do solopreneur que cria com propósito. Lê, aceita, avança.
              </p>
              <Link
                href="/manifesto"
                className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors"
              >
                {manifestoComplete ? "Reler →" : "Explorar →"}
              </Link>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
