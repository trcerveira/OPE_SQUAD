import StepProgress from "@/components/layout/StepProgress";

// Calendário — em construção (CalendarioPlanner ainda não implementado)
export default function CalendarioPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] pt-8">
      <StepProgress currentStep={5} />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="bg-[#111827] border border-[#BFD64B]/30 rounded-xl p-8 max-w-md text-center">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-xl font-bold text-[#F0ECE4] mb-3">Calendário Editorial</h2>
          <p className="text-[#8892a4] text-sm">
            Em breve — agenda e tracking de conteúdo publicado.
          </p>
        </div>
      </div>
    </main>
  );
}
