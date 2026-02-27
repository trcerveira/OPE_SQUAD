import { SignUp } from "@clerk/nextjs";

// Rota secreta de acesso — só para membros convidados
// URL: /beta-access (não indexado, não linkado publicamente)
export default function BetaAccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0A0E1A]">

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
            OPB
          </span>
          <span className="font-bold text-[#F0ECE4] text-sm">CREW</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full">
          ⚡ ACESSO BETA — MEMBROS CONVIDADOS
        </div>
      </div>

      <SignUp />

    </main>
  );
}
