import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-6xl font-black text-[#BFD64B] mb-4">404</h1>
        <p className="text-[#F0ECE4] text-lg mb-2">Página não encontrada</p>
        <p className="text-[#8892a4] text-sm mb-8">
          A página que procuras não existe ou foi movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#BFD64B] text-[#0A0E1A] font-bold px-6 py-3 rounded-xl hover:bg-[#d4ea5c] transition-colors"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </main>
  );
}
