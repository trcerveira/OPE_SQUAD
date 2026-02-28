import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { DeleteContentSchema, validateInput } from "@/lib/validators";
import { logAudit } from "@/lib/supabase/audit";

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
      .select("id, platform, format, subtype, topic, content, created_at, updated_at")
      .eq("user_id", userId)
      .is("deleted_at", null)          // Só conteúdo activo (soft delete)
      .order("created_at", { ascending: false })
      .limit(50);                       // Aumentado de 20 para 50

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

// DELETE /api/content?id=xxx — soft delete de um item do histórico
export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const validation = validateInput(DeleteContentSchema, { id: searchParams.get("id") });
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { id } = validation.data;

  try {
    const supabase = createServerClient();

    // Soft delete — marca como apagado mas mantém o registo para auditoria
    const { error } = await supabase
      .from("generated_content")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)    // Garante que só apaga o seu próprio
      .is("deleted_at", null);  // Só se ainda estiver activo

    if (error) throw error;

    // Regista no audit log (não bloqueia a resposta)
    logAudit({ userId, action: "content.delete", metadata: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao apagar:", error);
    return NextResponse.json({ error: "Erro ao apagar" }, { status: 500 });
  }
}
