import ManifestoAssessment from "@/components/manifesto/ManifestoAssessment";

// Página do Manifesto — entrevista de 9 perguntas que gera o manifesto personalizado
export default function ManifestoPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] px-8 py-10">
      <ManifestoAssessment />
    </main>
  );
}
