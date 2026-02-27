import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/config/admins";

// Painel de Admin — só acessível a super admins
export default async function AdminPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  // Redireciona para o dashboard se não for admin
  if (!user || !isAdmin(email)) {
    redirect("/dashboard");
  }

  // Busca todos os utilizadores do Supabase
  const supabase = createServerClient();
  const { data: users } = await supabase
    .from("user_profiles")
    .select("user_id, email, name, genius_complete, manifesto_complete, voz_dna_complete, created_at")
    .order("created_at", { ascending: false });

  const totalUsers      = users?.length ?? 0;
  const geniusCount     = users?.filter(u => u.genius_complete).length    ?? 0;
  const manifestoCount  = users?.filter(u => u.manifesto_complete).length ?? 0;
  const vozDNACount     = users?.filter(u => u.voz_dna_complete).length   ?? 0;
  const completedAll    = users?.filter(u => u.genius_complete && u.manifesto_complete && u.voz_dna_complete).length ?? 0;

  return (
    <main className="px-8 py-10">
      <div className="max-w-5xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest px-4 py-2 rounded-full">
            🔑 SUPER ADMIN
          </div>
          <h1 className="text-2xl font-bold text-[#F0ECE4]">Painel de Admin</h1>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
          <div className="bg-[#111827] border border-[#1a2035] rounded-xl p-5">
            <div className="text-3xl font-bold text-[#F0ECE4] mb-1">{totalUsers}</div>
            <div className="text-[#8892a4] text-xs font-bold tracking-widest">UTILIZADORES</div>
          </div>
          <div className="bg-[#111827] border border-purple-500/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-purple-400 mb-1">{geniusCount}</div>
            <div className="text-[#8892a4] text-xs font-bold tracking-widest">GENIUS ZONE</div>
          </div>
          <div className="bg-[#111827] border border-[#BFD64B]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#BFD64B] mb-1">{vozDNACount}</div>
            <div className="text-[#8892a4] text-xs font-bold tracking-widest">VOZ & DNA</div>
          </div>
          <div className="bg-[#111827] border border-green-500/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-green-400 mb-1">{completedAll}</div>
            <div className="text-[#8892a4] text-xs font-bold tracking-widest">COMPLETOS</div>
          </div>
        </div>

        {/* Tabela de utilizadores */}
        <div className="bg-[#111827] border border-[#1a2035] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a2035]">
            <h2 className="text-[#F0ECE4] font-bold">Utilizadores ({totalUsers})</h2>
          </div>

          {totalUsers === 0 ? (
            <div className="px-6 py-12 text-center text-[#8892a4]">
              Nenhum utilizador registado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a2035]">
                    <th className="text-left px-6 py-3 text-[#4a5568] text-xs font-bold tracking-widest">UTILIZADOR</th>
                    <th className="text-center px-4 py-3 text-[#4a5568] text-xs font-bold tracking-widest">GENIUS</th>
                    <th className="text-center px-4 py-3 text-[#4a5568] text-xs font-bold tracking-widest">MANIFESTO</th>
                    <th className="text-center px-4 py-3 text-[#4a5568] text-xs font-bold tracking-widest">VOZ & DNA</th>
                    <th className="text-right px-6 py-3 text-[#4a5568] text-xs font-bold tracking-widest">REGISTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u, i) => (
                    <tr
                      key={u.user_id}
                      className={`border-b border-[#1a2035] ${i % 2 === 0 ? "bg-[#0d1420]/50" : ""}`}
                    >
                      {/* Nome e email */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F0ECE4]">
                          {u.name || "—"}
                        </div>
                        <div className="text-[#8892a4] text-xs mt-0.5">
                          {u.email || "—"}
                        </div>
                      </td>

                      {/* Genius Zone */}
                      <td className="px-4 py-4 text-center">
                        {u.genius_complete
                          ? <span className="text-purple-400 font-bold">✓</span>
                          : <span className="text-[#4a5568]">—</span>
                        }
                      </td>

                      {/* Manifesto */}
                      <td className="px-4 py-4 text-center">
                        {u.manifesto_complete
                          ? <span className="text-[#BFD64B] font-bold">✓</span>
                          : <span className="text-[#4a5568]">—</span>
                        }
                      </td>

                      {/* Voz & DNA */}
                      <td className="px-4 py-4 text-center">
                        {u.voz_dna_complete
                          ? <span className="text-[#BFD64B] font-bold">✓</span>
                          : <span className="text-[#4a5568]">—</span>
                        }
                      </td>

                      {/* Data de registo */}
                      <td className="px-6 py-4 text-right text-[#8892a4] text-xs">
                        {new Date(u.created_at).toLocaleDateString("pt-PT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé com progresso */}
        <div className="mt-6 text-[#4a5568] text-xs text-center">
          {manifestoCount} completaram o Manifesto · {completedAll} prontos para criar conteúdo
        </div>

      </div>
    </main>
  );
}
