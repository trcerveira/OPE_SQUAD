import VoiceDNAForm from "@/components/onboarding/VoiceDNAForm";

// Força rendering dinâmico — o layout pai precisa de currentUser()
export const dynamic = "force-dynamic";

// Página de onboarding — Voice DNA
// Rota protegida via middleware (só utilizadores autenticados)
export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      <VoiceDNAForm />
    </main>
  );
}
