import { SignIn } from "@clerk/nextjs";

// Página de login — Clerk trata de tudo
export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
            OPE
          </span>
          <span className="font-bold text-[#F0ECE4] text-sm">SQUAD</span>
        </div>
        <p className="text-[#8892a4] text-sm">Entra na tua conta</p>
      </div>

      {/* Clerk SignIn component */}
      <SignIn />

    </main>
  );
}
