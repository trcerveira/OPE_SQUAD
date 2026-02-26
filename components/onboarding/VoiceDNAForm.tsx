"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// As 5 perguntas do Voice DNA
const questions = [
  {
    id: "niche",
    step: "1 de 5",
    label: "O teu nicho",
    question: "Quem ajudas exactamente?",
    type: "text",
    placeholder:
      "Ex: Homens com mais de 30 anos que querem perder peso sem ir ao ginásio",
    hint: "Sê específico. Quanto mais preciso, melhor o conteúdo gerado.",
  },
  {
    id: "offer",
    step: "2 de 5",
    label: "A tua oferta",
    question: "O que vendes? Qual é o teu produto principal?",
    type: "text",
    placeholder: "Ex: Programa online de 8 semanas de treino em casa, €197",
    hint: "Descreve o produto, formato e preço se souberes.",
  },
  {
    id: "pain",
    step: "3 de 5",
    label: "A dor do cliente",
    question: "Qual é a maior frustração do teu cliente antes de te encontrar?",
    type: "textarea",
    placeholder:
      "Ex: Já tentaram vários programas mas desistem ao fim de 2 semanas por falta de tempo",
    hint: "Pensa no momento antes de te comprarem. O que os mantém acordados à noite?",
  },
  {
    id: "tone",
    step: "4 de 5",
    label: "O teu tom de voz",
    question: "Como é o teu estilo de comunicação?",
    type: "options",
    options: [
      {
        value: "directo",
        label: "Directo e sem filtros",
        desc: "Vou ao ponto, sem rodeios. A verdade primeiro.",
      },
      {
        value: "inspirador",
        label: "Inspirador e motivacional",
        desc: "Energizo e motivo as pessoas a agir.",
      },
      {
        value: "educativo",
        label: "Educativo e detalhado",
        desc: "Explico o porquê de cada coisa com dados.",
      },
      {
        value: "casual",
        label: "Casual como um amigo",
        desc: "Converso como se fosse tomar café.",
      },
    ],
    hint: "",
  },
  {
    id: "differentiator",
    step: "5 de 5",
    label: "O teu diferencial",
    question: "O que te torna diferente dos outros no teu nicho?",
    type: "textarea",
    placeholder:
      "Ex: O meu método usa apenas 25 minutos por dia e não precisa de equipamento nem ginásio",
    hint: "Pode ser o teu método, a tua história pessoal, o teu resultado ou a tua abordagem.",
  },
];

export default function VoiceDNAForm() {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const question = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const progressPercent = ((currentStep) / questions.length) * 100;

  function handleNext() {
    if (!currentAnswer.trim()) return;

    const newAnswers = { ...answers, [question.id]: currentAnswer };
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (isLastStep) {
      handleSave(newAnswers);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleOptionSelect(value: string) {
    setCurrentAnswer(value);
  }

  async function handleSave(finalAnswers: Record<string, string>) {
    if (!user) return;
    setSaving(true);

    try {
      await user.update({
        unsafeMetadata: {
          voiceDNA: finalAnswers,
          onboardingComplete: true,
          onboardingDate: new Date().toISOString(),
        },
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao guardar Voice DNA:", error);
      setSaving(false);
    }
  }

  if (saving) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#BFD64B] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#F0ECE4] mb-2">
            A construir o teu Voice DNA...
          </h2>
          <p className="text-[#8892a4]">
            Só um momento. Isto é feito uma vez só.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
          OPE
        </span>
        <span className="font-bold text-[#F0ECE4] text-sm">SQUAD</span>
      </div>

      {/* Barra de progresso */}
      <div className="max-w-2xl mx-auto w-full mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#BFD64B] text-xs font-bold tracking-widest">
            VOICE DNA — {question.step}
          </span>
          <span className="text-[#8892a4] text-xs">
            {Math.round(progressPercent + 20)}% completo
          </span>
        </div>
        <div className="w-full bg-[#1a2035] rounded-full h-1.5">
          <div
            className="bg-[#BFD64B] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent + 20}%` }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <div className="max-w-2xl mx-auto w-full flex-1">
        <div className="mb-2">
          <span className="text-[#8892a4] text-xs font-bold tracking-widest uppercase">
            {question.label}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#F0ECE4] mb-8">
          {question.question}
        </h1>

        {/* Input — texto */}
        {question.type === "text" && (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
            placeholder={question.placeholder}
            autoFocus
            className="w-full bg-[#111827] border border-[#2a3555] rounded-xl px-5 py-4 text-[#F0ECE4] placeholder-[#4a5568] text-lg focus:outline-none focus:border-[#BFD64B] transition-colors"
          />
        )}

        {/* Input — textarea */}
        {question.type === "textarea" && (
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={question.placeholder}
            autoFocus
            rows={4}
            className="w-full bg-[#111827] border border-[#2a3555] rounded-xl px-5 py-4 text-[#F0ECE4] placeholder-[#4a5568] text-lg focus:outline-none focus:border-[#BFD64B] transition-colors resize-none"
          />
        )}

        {/* Input — opções */}
        {question.type === "options" && (
          <div className="grid gap-3">
            {question.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleOptionSelect(opt.value)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  currentAnswer === opt.value
                    ? "border-[#BFD64B] bg-[#BFD64B]/10"
                    : "border-[#2a3555] bg-[#111827] hover:border-[#BFD64B]/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      currentAnswer === opt.value
                        ? "border-[#BFD64B] bg-[#BFD64B]"
                        : "border-[#4a5568]"
                    }`}
                  />
                  <div>
                    <div className="font-bold text-[#F0ECE4] text-sm">
                      {opt.label}
                    </div>
                    <div className="text-[#8892a4] text-xs mt-0.5">
                      {opt.desc}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Dica */}
        {question.hint && (
          <p className="text-[#8892a4] text-sm mt-3">{question.hint}</p>
        )}

        {/* Botão avançar */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLastStep ? "Concluir Voice DNA →" : "Continuar →"}
          </button>

          {currentStep > 0 && (
            <button
              onClick={() => {
                setCurrentStep((s) => s - 1);
                setCurrentAnswer(answers[questions[currentStep - 1].id] ?? "");
              }}
              className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors"
            >
              ← Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
