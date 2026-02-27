import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";

// Layout partilhado por todas as páginas do dashboard.
// Carrega as cores de marca do utilizador e aplica como CSS variables.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let brandColors = {
    "--bg":      "#0A0E1A",
    "--surface": "#111827",
    "--accent":  "#BFD64B",
    "--text":    "#F0ECE4",
  };

  // Tenta carregar as cores personalizadas do utilizador
  try {
    const user = await currentUser();
    if (user) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("brand_bg, brand_surface, brand_accent, brand_text")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        brandColors = {
          "--bg":      profile.brand_bg      || "#0A0E1A",
          "--surface": profile.brand_surface || "#111827",
          "--accent":  profile.brand_accent  || "#BFD64B",
          "--text":    profile.brand_text    || "#F0ECE4",
        };
      }
    }
  } catch {
    // Usa as cores por defeito se houver erro
  }

  const cssVars = Object.entries(brandColors)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");

  return (
    <div
      className="min-h-screen"
      style={
        {
          "--bg":      brandColors["--bg"],
          "--surface": brandColors["--surface"],
          "--accent":  brandColors["--accent"],
          "--text":    brandColors["--text"],
          backgroundColor: "var(--bg)",
          color: "var(--text)",
        } as React.CSSProperties
      }
    >
      <Navbar />
      {children}
    </div>
  );
}
