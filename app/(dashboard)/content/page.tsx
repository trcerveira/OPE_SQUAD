import ContentFactory from "@/components/content/ContentFactory";
import StepProgress from "@/components/layout/StepProgress";

export default function ContentPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] pt-8">
      <StepProgress currentStep={4} />
      <ContentFactory />
    </main>
  );
}
