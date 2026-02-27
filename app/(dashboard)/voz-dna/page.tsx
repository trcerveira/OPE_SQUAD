import VozDNAAssessment from "@/components/voz-dna/VozDNAAssessment";
import StepProgress from "@/components/layout/StepProgress";

export default function VozDNAPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] pt-8">
      <StepProgress currentStep={3} />
      <div className="px-8 pb-10">
        <VozDNAAssessment />
      </div>
    </main>
  );
}
