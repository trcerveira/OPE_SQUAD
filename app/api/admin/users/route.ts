import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/config/admins";

// GET /api/admin/users — returns all users (super admins only)
export async function GET() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  // Block access for non-admins
  if (!user || !isAdmin(email)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_id, email, name, genius_complete, manifesto_complete, voz_dna_complete, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users: data ?? [] });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error loading users" }, { status: 500 });
  }
}
