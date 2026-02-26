import { currentUser } from "@clerk/nextjs/server";

// Dashboard principal — rota protegida
// Só utilizadores autenticados chegam aqui
export default async function DashboardPage() {
  const user = await currentUser();

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

      {/* Boas-vindas */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
          ⚡ CONTENT ENGINE V1
        </div>
        <h1 className="text-4xl font-bold text-[#F0ECE4] mb-4">
          Bem-vindo ao OPE_SQUAD
        </h1>
        <p className="text-[#8892a4] text-lg leading-relaxed mb-8">
          Vamos criar o teu <strong className="text-[#F0ECE4]">Voice DNA</strong> para
          começar a gerar o teu conteúdo automaticamente.
        </p>

        {/* Próximo passo */}
        <div className="bg-[#111827] border border-[#BFD64B]/30 rounded-xl p-6">
          <div className="text-[#BFD64B] text-xs font-bold tracking-widest mb-3">PASSO 1 DE 3</div>
          <h2 className="text-xl font-bold text-[#F0ECE4] mb-2">Onboarding — Voice DNA</h2>
          <p className="text-[#8892a4] text-sm mb-6">
            5 perguntas rápidas sobre o teu nicho, oferta e tom de voz.
            Leva 15 minutos. Fazemos uma vez só.
          </p>
          <button
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Começar Onboarding →
          </button>
        </div>
      </div>

    </main>
  );
}
