import { SignUp } from "@clerk/nextjs";

// Sign-up page — Clerk handles registration
export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0A0E1A]">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
            OPB
          </span>
          <span className="font-bold text-[#F0ECE4] text-sm">CREW</span>
        </div>
        <p className="text-[#8892a4] text-sm">Cria a tua conta</p>
      </div>

      {/* Clerk SignUp component */}
      <SignUp />

    </main>
  );
}
