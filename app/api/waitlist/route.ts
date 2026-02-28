import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { WaitlistSchema, validateInput } from "@/lib/validators";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  // Validação com Zod (email + normalização + nome mínimo)
  const validation = validateInput(WaitlistSchema, body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { email, name } = validation.data;

  try {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("waitlist")
      .insert({ email, nome: name ?? null });

    if (error) {
      // Código 23505 = email duplicado (UNIQUE constraint na migration 006)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Este email já está na lista. Vemo-nos em breve!" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Algo correu mal. Tenta novamente." },
      { status: 500 }
    );
  }
}
