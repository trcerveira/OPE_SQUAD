import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/content — devolve o histórico de conteúdo do utilizador
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("generated_content")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ content: data ?? [] });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: "Erro ao carregar histórico" },
      { status: 500 }
    );
  }
}

// DELETE /api/content?id=xxx — apaga um item do histórico
export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
  }

  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from("generated_content")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // garante que só apaga os seus próprios

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao apagar:", error);
    return NextResponse.json({ error: "Erro ao apagar" }, { status: 500 });
  }
}
