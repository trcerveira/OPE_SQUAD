import DNAMarcaAssessment from "@/components/dna-marca/DNAMarcaAssessment";
import StepProgress from "@/components/layout/StepProgress";

export default function DNAMarcaPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] pt-8">
      <StepProgress currentStep={1} />
      <div className="px-8 pb-10">
        <DNAMarcaAssessment />
      </div>
    </main>
  );
}
