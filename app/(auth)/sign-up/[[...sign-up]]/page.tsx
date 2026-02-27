"use client";

import { useState } from "react";
import Link from "next/link";

// Página de registo — substituída por lista de espera FOMO
export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [mensagem, setMensagem] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setEstado("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nome }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEstado("error");
        setMensagem(data.error || "Algo correu mal. Tenta novamente.");
        return;
      }
      setEstado("success");
    } catch {
      setEstado("error");
      setMensagem("Sem ligação. Verifica a internet e tenta novamente.");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0A0E1A] text-[#F0ECE4]">

      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
          OPB
        </span>
        <span className="font-bold text-[#F0ECE4] text-sm">CREW</span>
      </div>

      {estado === "success" ? (
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-[#F0ECE4] mb-3">Estás na lista.</h1>
          <p className="text-[#8892a4] mb-6">
            Quando lançarmos, és um dos primeiros a saber — antes de toda a gente.
          </p>
          <Link href="/" className="text-[#BFD64B] text-sm hover:underline">
            ← Voltar ao início
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-md">

          {/* FOMO badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest px-4 py-2 rounded-full">
              🔒 ACESSO FECHADO
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#F0ECE4] mb-3 leading-tight">
              O acesso directo<br />está fechado.
            </h1>
            <p className="text-[#8892a4] leading-relaxed">
              O lançamento é na segunda-feira. Já há 10 pessoas confirmadas.<br />
              Se quiseres entrar, junta-te à lista de espera agora.
            </p>
          </div>

          {/* Urgência */}
          <div className="bg-[#111827] border border-[#BFD64B]/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-[#BFD64B] text-sm font-bold mb-1">⏳ Lançamento: Segunda-feira</p>
            <p className="text-[#8892a4] text-xs">Quem estiver na lista tem prioridade. Quem não estiver, fica de fora.</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="O teu nome (opcional)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-[#111827] border border-white/[0.10] rounded-xl px-4 py-3 text-[#F0ECE4] placeholder-[#8892a4] text-sm focus:outline-none focus:border-[#BFD64B]/60 transition-colors"
            />
            <input
              type="email"
              placeholder="O teu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#111827] border border-white/[0.10] rounded-xl px-4 py-3 text-[#F0ECE4] placeholder-[#8892a4] text-sm focus:outline-none focus:border-[#BFD64B]/60 transition-colors"
            />
            {estado === "error" && (
              <p className="text-red-400 text-sm text-center">{mensagem}</p>
            )}
            <button
              type="submit"
              disabled={estado === "loading" || !email}
              className="bg-[#BFD64B] text-[#0A0E1A] font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-base"
            >
              {estado === "loading" ? "A guardar..." : "Quero entrar na lista →"}
            </button>
            <p className="text-[#8892a4] text-xs text-center">
              Sem spam. Avisamos-te quando lançarmos.
            </p>
          </form>

          <div className="text-center mt-8">
            <Link href="/" className="text-[#4a5568] text-xs hover:text-[#8892a4] transition-colors">
              ← Voltar ao início
            </Link>
          </div>

        </div>
      )}
    </main>
  );
}
