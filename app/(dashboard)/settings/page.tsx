import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BrandColorPicker from "@/components/settings/BrandColorPicker";
import Link from "next/link";

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Busca as cores guardadas do utilizador
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("brand_bg, brand_surface, brand_accent, brand_text")
    .eq("user_id", user.id)
    .single();

  const initialColors = {
    brand_bg:      profile?.brand_bg      ?? "#0A0E1A",
    brand_surface: profile?.brand_surface ?? "#111827",
    brand_accent:  profile?.brand_accent  ?? "#BFD64B",
    brand_text:    profile?.brand_text    ?? "#F0ECE4",
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] px-6 py-10">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors mb-6 inline-block"
          >
            ← Voltar ao dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎨</span>
            <h1 className="text-2xl font-bold text-[var(--text)]">
              Paleta de marca
            </h1>
          </div>
          <p className="text-[#8892a4] text-sm leading-relaxed">
            Define as cores da tua marca. A interface adapta-se às tuas cores em tempo real.
          </p>
        </div>

        {/* Color Picker */}
        <BrandColorPicker initialColors={initialColors} />

      </div>
    </main>
  );
}
