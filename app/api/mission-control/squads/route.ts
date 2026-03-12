import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAllSquads } from "@/lib/squads/parser";

// Cache squads in memory (they only change on deploy)
let cachedSquads: ReturnType<typeof getAllSquads> | null = null;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    if (!cachedSquads) {
      cachedSquads = getAllSquads();
    }

    return NextResponse.json({ squads: cachedSquads });
  } catch (error) {
    console.error("Error loading squads:", error);
    return NextResponse.json(
      { error: "Error loading squads" },
      { status: 500 }
    );
  }
}
