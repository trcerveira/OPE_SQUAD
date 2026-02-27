import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, nome } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: email.toLowerCase().trim(), nome: nome?.trim() || null });

    if (error) {
      // Código 23505 = email duplicado (UNIQUE constraint)
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
