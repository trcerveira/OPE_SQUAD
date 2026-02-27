import ManifestoAssessment from "@/components/manifesto/ManifestoAssessment";
import StepProgress from "@/components/layout/StepProgress";

export default function ManifestoPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] pt-8">
      <StepProgress currentStep={2} />
      <div className="px-8 pb-10">
        <ManifestoAssessment />
      </div>
    </main>
  );
}
