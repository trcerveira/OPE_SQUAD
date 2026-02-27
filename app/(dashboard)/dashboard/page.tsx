import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/config/admins";
import { syncUserProfile } from "@/lib/supabase/user-profiles";

// Dashboard principal — rota protegida
// Nova sequência: Genius Zone → Manifesto → Voice DNA → Content Factory
export default async function DashboardPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const admin = isAdmin(email);
  const geniusComplete    = user?.unsafeMetadata?.geniusComplete    as boolean;
  const manifestoComplete = user?.unsafeMetadata?.manifestoComplete as boolean;
  const vozDNAComplete    = user?.unsafeMetadata?.vozDNAComplete    as boolean;

  // Sincroniza o perfil com Supabase sempre que o utilizador abre o dashboard
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

  // Título dinâmico consoante o progresso
  const tituloHero = vozDNAComplete
    ? `Pronto para criar, ${user?.firstName ?? "solopreneur"}.`
    : geniusComplete && manifestoComplete
    ? `Quase lá, ${user?.firstName ?? "solopreneur"}.`
    : `Bem-vindo ao OPB Crew, ${user?.firstName ?? "solopreneur"}.`;

  const subtituloHero = vozDNAComplete
    ? "O teu Voz & DNA está activo. Gera conteúdo para qualquer plataforma na tua voz."
    : geniusComplete && manifestoComplete
    ? "Falta só o Voz & DNA para activar o teu motor de conteúdo."
    : "Começa por descobrir a tua Genius Zone. Tudo o resto segue-se.";

  return (
    <main className="px-8 py-10">
      <div className="max-w-2xl">

        {/* Badge de Super Admin — visível só para admins */}
        {admin && (
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-4">
            🔑 SUPER ADMIN
          </div>
        )}

        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
          ⚡ CONTENT ENGINE V1
        </div>
        <h1 className="text-4xl font-bold text-[#F0ECE4] mb-4">
          {tituloHero}
        </h1>
        <p className="text-[#8892a4] text-lg leading-relaxed mb-8">
          {subtituloHero}
        </p>

        {/* Cards de acção — adapta-se ao estado */}
        <div className="flex flex-col gap-4">

          {/* Card 1: Genius Zone */}
          <div className={`rounded-xl p-6 border transition-all ${
            geniusComplete
              ? "bg-[#0d1420] border-[#1a2035]"
              : "bg-[#111827] border-purple-500/30"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xs font-bold tracking-widest ${
                geniusComplete ? "text-[#4a5568]" : "text-purple-400"
              }`}>
                PASSO 1 DE 4
              </div>
              {geniusComplete && (
                <span className="text-purple-400 text-xs font-bold">✓ Completo</span>
              )}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              geniusComplete ? "text-[#4a5568]" : "text-[#F0ECE4]"
            }`}>
              🧬 Genius Zone
            </h2>
            <p className="text-[#8892a4] text-sm mb-4">
              Descobre a tua zona de genialidade, perfil de riqueza e vantagem única. 24 perguntas.
            </p>
            {!geniusComplete ? (
              <Link
                href="/genius"
                className="inline-block bg-purple-600 text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Descobrir a minha Genius Zone →
              </Link>
            ) : (
              <Link
                href="/genius"
                className="text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors"
              >
                Ver perfil →
              </Link>
            )}
          </div>

          {/* Card 2: Manifesto */}
          <div className={`rounded-xl p-6 border transition-all ${
            !geniusComplete
              ? "bg-[#0d1420] border-[#1a2035] opacity-50"
              : manifestoComplete
              ? "bg-[#0d1420] border-[#1a2035]"
              : "bg-[#111827] border-[#BFD64B]/30"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xs font-bold tracking-widest ${
                manifestoComplete
                  ? "text-[#4a5568]"
                  : geniusComplete
                  ? "text-[#BFD64B]"
                  : "text-[#4a5568]"
              }`}>
                PASSO 2 DE 4
              </div>
              {manifestoComplete && (
                <span className="text-[#BFD64B] text-xs font-bold">✓ Completo</span>
              )}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              !geniusComplete || manifestoComplete ? "text-[#4a5568]" : "text-[#F0ECE4]"
            }`}>
              📜 Manifesto
            </h2>
            <p className="text-[#8892a4] text-sm mb-4">
              Os 10 princípios do solopreneur que cria com propósito. Lê, aceita, avança.
            </p>
            {geniusComplete && !manifestoComplete && (
              <Link
                href="/manifesto"
                className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Ler o Manifesto →
              </Link>
            )}
            {manifestoComplete && geniusComplete && (
              <Link
                href="/manifesto"
                className="text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors"
              >
                Reler →
              </Link>
            )}
          </div>

          {/* Card 3: Voz & DNA */}
          <div className={`rounded-xl p-6 border transition-all ${
            !manifestoComplete
              ? "bg-[#0d1420] border-[#1a2035] opacity-50"
              : vozDNAComplete
              ? "bg-[#0d1420] border-[#1a2035]"
              : "bg-[#111827] border-[#BFD64B]/30"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xs font-bold tracking-widest ${
                vozDNAComplete
                  ? "text-[#4a5568]"
                  : manifestoComplete
                  ? "text-[#BFD64B]"
                  : "text-[#4a5568]"
              }`}>
                PASSO 3 DE 4
              </div>
              {vozDNAComplete && (
                <span className="text-[#BFD64B] text-xs font-bold">✓ Completo</span>
              )}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              !manifestoComplete || vozDNAComplete ? "text-[#4a5568]" : "text-[#F0ECE4]"
            }`}>
              🎙️ Voz & DNA
            </h2>
            <p className="text-[#8892a4] text-sm mb-4">
              8 perguntas que codificam a tua voz única — tom, vocabulário, frases assinatura e estilo. O motor de IA vai usá-las em tudo.
            </p>
            {manifestoComplete && !vozDNAComplete && (
              <Link
                href="/voz-dna"
                className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Definir o meu Voz & DNA →
              </Link>
            )}
            {vozDNAComplete && manifestoComplete && (
              <Link
                href="/voz-dna"
                className="text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors"
              >
                Ver DNA →
              </Link>
            )}
          </div>

          {/* Card 4: Content Factory */}
          <div className={`rounded-xl p-6 border ${
            vozDNAComplete
              ? "bg-[#111827] border-[#BFD64B]/30"
              : "bg-[#0d1420] border-[#1a2035] opacity-50"
          }`}>
            <div className={`text-xs font-bold tracking-widest mb-3 ${
              vozDNAComplete ? "text-[#BFD64B]" : "text-[#4a5568]"
            }`}>
              PASSO 4 DE 4
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

          {/* Card 5: Auto-Publish (em breve) */}
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
      </div>
    </main>
  );
}
