import GeniusAssessment from "@/components/genius/GeniusAssessment";
import StepProgress from "@/components/layout/StepProgress";

export default function GeniusPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] pt-8">
      <StepProgress currentStep={1} />
      <GeniusAssessment />
    </main>
  );
}
