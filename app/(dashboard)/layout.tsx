import Navbar from "@/components/layout/Navbar";

// Layout partilhado por todas as páginas do dashboard
// Adiciona a navbar no topo automaticamente
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <Navbar />
      {children}
    </div>
  );
}
