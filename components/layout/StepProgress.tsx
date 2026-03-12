// Step progress bar — server component
// Reads progress from Clerk and shows where the user is in the pipeline

import { currentUser } from "@clerk/nextjs/server";

const steps = [
  { number: 1, label: "DNA da Marca", icon: "🧬" },
  { number: 2, label: "Voz & DNA",    icon: "🎙️" },
  { number: 3, label: "Editorial",    icon: "🏛️" },
  { number: 4, label: "Calendário",   icon: "📅" },
  { number: 5, label: "Conteúdo",     icon: "✍️" },
];

interface StepProgressProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

export default async function StepProgress({ currentStep }: StepProgressProps) {
  const user = await currentUser();
  const meta = user?.unsafeMetadata ?? {};

  const completedSteps: number[] = [];
  if (meta.dnaMarcaComplete)    completedSteps.push(1);
  if (meta.vozDNAComplete)      completedSteps.push(2);
  if (meta.editorialComplete)   completedSteps.push(3);
  if (meta.calendarioComplete)  completedSteps.push(4);

  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;


  return (
    <div className="w-full max-w-2xl mx-auto mb-10 px-6">

      {/* Steps */}
      <div className="flex items-start justify-between relative">

        {/* Background line */}
        <div className="absolute top-5 left-5 right-5 h-px bg-[#1a2035] z-0" />

        {/* Progress line */}
        <div
          className="absolute top-5 left-5 h-px bg-[#BFD64B] z-0 transition-all duration-700"
          style={{ width: `calc(${progressPercent}% - ${progressPercent > 0 ? 10 : 0}px)` }}
        />

        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent   = step.number === currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center gap-2 z-10">
              {/* Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                  isCompleted
                    ? "bg-[#BFD64B] border-[#BFD64B] text-[#0A0E1A]"
                    : isCurrent
                    ? "bg-[#0A0E1A] border-[#BFD64B] text-[#BFD64B] shadow-[0_0_12px_rgba(191,214,75,0.3)]"
                    : "bg-[#0d1420] border-[#2a3555] text-[#4a5568]"
                }`}
              >
                {isCompleted ? "✓" : step.icon}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold tracking-wide text-center leading-tight ${
                  isCurrent   ? "text-[#BFD64B]"  :
                  isCompleted ? "text-[#8892a4]"  :
                                "text-[#4a5568]"
                }`}
              >
                <span className="hidden sm:block">{step.label}</span>
                <span className="sm:hidden">{step.number}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtitle */}
      <p className="text-center mt-5 text-[#4a5568] text-xs">
        Passo {currentStep} de {steps.length}
        {" — "}
        <span className="text-[#BFD64B] font-bold">{steps[currentStep - 1]?.label}</span>
      </p>
    </div>
  );
}
