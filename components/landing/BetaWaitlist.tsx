"use client";

import { useState } from "react";

export default function BetaWaitlist() {
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
      setEmail("");
      setNome("");
    } catch {
      setEstado("error");
      setMensagem("Sem ligação. Verifica a internet e tenta novamente.");
    }
  }

  if (estado === "success") {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-[#F0ECE4] mb-2">Estás na lista.</h3>
        <p className="text-[#8892a4]">
          Assim que o beta abrir, és um dos primeiros a saber.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="O teu nome (opcional)"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="bg-[#111827] border border-white/[0.10] rounded-xl px-4 py-3 text-[#F0ECE4] placeholder-[#8892a4] text-sm focus:outline-none focus:border-[#BFD64B]/60 transition-colors"
      />
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="O teu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 bg-[#111827] border border-white/[0.10] rounded-xl px-4 py-3 text-[#F0ECE4] placeholder-[#8892a4] text-sm focus:outline-none focus:border-[#BFD64B]/60 transition-colors"
        />
        <button
          type="submit"
          disabled={estado === "loading" || !email}
          className="bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm whitespace-nowrap"
        >
          {estado === "loading" ? "..." : "Quero acesso →"}
        </button>
      </div>
      {estado === "error" && (
        <p className="text-red-400 text-sm text-center">{mensagem}</p>
      )}
      <p className="text-[#8892a4] text-xs text-center">
        Sem spam. Só quando o beta abrir.
      </p>
    </form>
  );
}
