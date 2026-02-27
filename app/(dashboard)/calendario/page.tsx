import CalendarioPlanner from "@/components/calendario/CalendarioPlanner";
import StepProgress from "@/components/layout/StepProgress";

export default function CalendarioPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] pt-8">
      <StepProgress currentStep={5} />
      <div className="px-8 pb-10">
        <CalendarioPlanner />
      </div>
    </main>
  );
}
