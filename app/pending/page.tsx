import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasBetaAccess } from "@/lib/config/admins";
import { SignOutButton } from "@clerk/nextjs";

// Pending page — shown to logged-in users who don't have beta access yet
export default async function PendingPage() {
  const { userId } = await auth();

  // Not logged in — go to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  // If they DO have beta access, send them to dashboard
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (hasBetaAccess(email)) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0A0E1A] text-[#F0ECE4]">

      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
          OPB
        </span>
        <span className="font-bold text-[#F0ECE4] text-sm">CREW</span>
      </div>

      <div className="w-full max-w-md text-center">

        {/* Status badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full">
            CONTA CRIADA
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#F0ECE4] mb-4 leading-tight">
          A tua conta foi criada.
        </h1>
        <p className="text-[#8892a4] text-lg leading-relaxed mb-8">
          Estamos a abrir o acesso gradualmente.
          Quando chegar a tua vez, recebes um email.
        </p>

        {/* Info card */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-6 mb-8 text-left">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-[#BFD64B] flex-shrink-0 mt-0.5">1</span>
            <div>
              <div className="font-bold text-[#F0ECE4] text-sm mb-1">Conta registada</div>
              <p className="text-[#8892a4] text-sm">{email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <span className="text-[#BFD64B] flex-shrink-0 mt-0.5">2</span>
            <div>
              <div className="font-bold text-[#F0ECE4] text-sm mb-1">Na lista de espera</div>
              <p className="text-[#8892a4] text-sm">Estamos a rever o teu registo.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 opacity-40">
            <span className="text-[#BFD64B] flex-shrink-0 mt-0.5">3</span>
            <div>
              <div className="font-bold text-[#F0ECE4] text-sm mb-1">Acesso activado</div>
              <p className="text-[#8892a4] text-sm">Em breve.</p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <SignOutButton>
          <button className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors">
            Sair da conta
          </button>
        </SignOutButton>

      </div>
    </main>
  );
}
