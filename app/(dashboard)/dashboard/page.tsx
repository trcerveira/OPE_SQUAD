import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/config/admins";
import { syncUserProfile } from "@/lib/supabase/user-profiles";

// Dashboard — mandatory pipeline: DNA da Marca → Voz & DNA → Content Factory
export default async function DashboardPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const admin = isAdmin(email);
  const dnaMarcaComplete = user?.unsafeMetadata?.dnaMarcaComplete === true;
  const vozDNAComplete   = user?.unsafeMetadata?.vozDNAComplete   === true;

  // Sync profile with Supabase on every dashboard visit
  if (user?.id) {
    await syncUserProfile({
      userId:            user.id,
      email:             email ?? "",
      name:              user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : null,
      geniusComplete:    false,
      manifestoComplete: dnaMarcaComplete ?? false,
      vozDNAComplete:    vozDNAComplete   ?? false,
    });
  }

  // Dynamic hero text based on pipeline progress
  let tituloHero: string;
  let subtituloHero: string;

  if (vozDNAComplete) {
    tituloHero = `Pronto para criar, ${user?.firstName ?? "solopreneur"}.`;
    subtituloHero = "O teu DNA da Marca e Voz estão activos. Gera conteúdo para qualquer plataforma na tua voz.";
  } else if (dnaMarcaComplete) {
    tituloHero = `Agora define a tua voz, ${user?.firstName ?? "solopreneur"}.`;
    subtituloHero = "O DNA da tua Marca está pronto. Falta codificar a tua voz em 8 perguntas.";
  } else {
    tituloHero = `Começa pelo DNA da Marca, ${user?.firstName ?? "solopreneur"}.`;
    subtituloHero = "17 perguntas que definem quem serves, quem és, o que defendes e o que prometes. Tudo o resto segue-se.";
  }

  return (
    <main className="px-4 sm:px-8 py-10">
      <div className="max-w-2xl">

        {/* Super Admin badge */}
        {admin && (
          <Link href="/admin" className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-4 hover:bg-red-500/20 transition-colors">
            SUPER ADMIN — Ver Painel
          </Link>
        )}

        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
          CONTENT ENGINE V1
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#F0ECE4] mb-4">
          {tituloHero}
        </h1>
        <p className="text-[#8892a4] text-lg leading-relaxed mb-8">
          {subtituloHero}
        </p>

        {/* ── MANDATORY PIPELINE ── */}
        <div className="flex flex-col gap-4">

          {/* Step 1: DNA da Marca (mandatory) */}
          <div className={`rounded-xl p-6 border transition-all ${
            dnaMarcaComplete
              ? "bg-[#0d1420] border-[#1a2035]"
              : "bg-[#111827] border-[#BFD64B]/30"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xs font-bold tracking-widest ${
                dnaMarcaComplete ? "text-[#4a5568]" : "text-[#BFD64B]"
              }`}>
                PASSO 1 DE 3
              </div>
              {dnaMarcaComplete && (
                <span className="text-[#BFD64B] text-xs font-bold">✓ Completo</span>
              )}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              dnaMarcaComplete ? "text-[#4a5568]" : "text-[#F0ECE4]"
            }`}>
              🧬 DNA da Marca
            </h2>
            <p className="text-[#8892a4] text-sm mb-4">
              17 perguntas em 4 blocos que definem a fundação estratégica da tua marca — cliente ideal, personagem, Big Idea, inimigo e Commander&apos;s Intent.
            </p>
            {!dnaMarcaComplete ? (
              <Link
                href="/dna-marca"
                className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Definir o meu DNA da Marca
              </Link>
            ) : (
              <Link
                href="/dna-marca"
                className="text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors"
              >
                Ver DNA da Marca
              </Link>
            )}
          </div>

          {/* Step 2: Voz & DNA (unlocked by dnaMarcaComplete) */}
          <div className={`rounded-xl p-6 border transition-all ${
            !dnaMarcaComplete
              ? "bg-[#0d1420] border-[#1a2035] opacity-50"
              : vozDNAComplete
              ? "bg-[#0d1420] border-[#1a2035]"
              : "bg-[#111827] border-[#BFD64B]/30"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xs font-bold tracking-widest ${
                !dnaMarcaComplete ? "text-[#4a5568]"
                : vozDNAComplete ? "text-[#4a5568]"
                : "text-[#BFD64B]"
              }`}>
                PASSO 2 DE 3
              </div>
              {vozDNAComplete && (
                <span className="text-[#BFD64B] text-xs font-bold">✓ Completo</span>
              )}
              {!dnaMarcaComplete && (
                <span className="text-[#4a5568] text-xs">Completa o DNA da Marca primeiro</span>
              )}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              !dnaMarcaComplete ? "text-[#4a5568]"
              : vozDNAComplete ? "text-[#4a5568]"
              : "text-[#F0ECE4]"
            }`}>
              🎙️ Voz & DNA
            </h2>
            <p className="text-[#8892a4] text-sm mb-4">
              8 perguntas que codificam a tua voz única — tom, vocabulário, frases assinatura e estilo. O motor de IA vai usá-las em tudo.
            </p>
            {dnaMarcaComplete && !vozDNAComplete && (
              <Link
                href="/voz-dna"
                className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Definir a minha Voz & DNA
              </Link>
            )}
            {vozDNAComplete && (
              <Link
                href="/voz-dna"
                className="text-[#4a5568] text-sm hover:text-[#8892a4] transition-colors"
              >
                Ver Voz & DNA
              </Link>
            )}
          </div>

          {/* Step 3: Content Factory (unlocked by vozDNAComplete) */}
          <div className={`rounded-xl p-6 border ${
            vozDNAComplete
              ? "bg-[#111827] border-[#BFD64B]/30"
              : "bg-[#0d1420] border-[#1a2035] opacity-50"
          }`}>
            <div className={`text-xs font-bold tracking-widest mb-3 ${
              vozDNAComplete ? "text-[#BFD64B]" : "text-[#4a5568]"
            }`}>
              PASSO 3 DE 3
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              vozDNAComplete ? "text-[#F0ECE4]" : "text-[#4a5568]"
            }`}>
              ✍️ Content Factory
            </h2>
            <p className="text-[#8892a4] text-sm mb-4">
              Gera posts para Instagram, LinkedIn, X e Email na tua voz — com a estratégia do DNA da Marca por trás de cada peça.
            </p>
            {vozDNAComplete && (
              <Link
                href="/content"
                className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Gerar Conteúdo
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

      </div>
    </main>
  );
}
