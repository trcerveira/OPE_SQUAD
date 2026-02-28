import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { DeleteContentSchema, validateInput } from "@/lib/validators";
import { logAudit } from "@/lib/supabase/audit";

// GET /api/content — returns the user's content history
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("generated_content")
      .select("id, platform, format, subtype, topic, content, created_at, updated_at")
      .eq("user_id", userId)
      .is("deleted_at", null)          // Only active content (soft delete)
      .order("created_at", { ascending: false })
      .limit(50);                       // Increased from 20 to 50

    if (error) throw error;

    return NextResponse.json({ content: data ?? [] });
  } catch (error) {
    console.error("Error fetching content history:", error);
    return NextResponse.json(
      { error: "Error loading content history" },
      { status: 500 }
    );
  }
}

// DELETE /api/content?id=xxx — soft delete a history item
export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const validation = validateInput(DeleteContentSchema, { id: searchParams.get("id") });
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { id } = validation.data;

  try {
    const supabase = createServerClient();

    // Soft delete — marks as deleted but keeps the record for audit purposes
    const { error } = await supabase
      .from("generated_content")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)    // Ensures the user can only delete their own content
      .is("deleted_at", null);  // Only if still active

    if (error) throw error;

    // Record in the audit log (non-blocking)
    logAudit({ userId, action: "content.delete", metadata: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json({ error: "Error deleting content" }, { status: 500 });
  }
}
