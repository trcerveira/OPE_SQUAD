import EditorialLines from "@/components/editorial/EditorialLines";
import StepProgress from "@/components/layout/StepProgress";

export default function EditorialPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] pt-8">
      <StepProgress currentStep={4} />
      <div className="px-8 pb-10">
        <EditorialLines />
      </div>
    </main>
  );
}
