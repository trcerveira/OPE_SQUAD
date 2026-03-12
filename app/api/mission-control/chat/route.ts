import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { logAudit } from "@/lib/supabase/audit";
import { MissionControlChatSchema, validateInput } from "@/lib/validators";
import { getAgentSystemPrompt } from "@/lib/squads/parser";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Rate limiting
  const rateLimit = await checkAndConsumeRateLimit(userId, "mission-control");
  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate with Zod
  const validation = validateInput(MissionControlChatSchema, rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { messages, agentId, squadId } = validation.data;

  // Load agent system prompt from .md file
  const agentPrompt = getAgentSystemPrompt(squadId, agentId);
  if (!agentPrompt) {
    return NextResponse.json(
      { error: `Agent ${agentId} not found in squad ${squadId}` },
      { status: 404 }
    );
  }

  const systemPrompt = `${agentPrompt}

---
REGRAS DE INTERACÇÃO NO MISSION CONTROL:
- Responde sempre em Português (Portugal)
- Sê directo e útil
- Mantém a tua persona e framework em todas as respostas
- Usa markdown para formatar as respostas`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(chunk));
            }
          }

          // Send final message with token count
          const finalMessage = await stream.finalMessage();
          const tokens =
            finalMessage.usage.input_tokens +
            finalMessage.usage.output_tokens;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, tokens })}\n\n`
            )
          );
          controller.close();

          // Audit log (fire-and-forget)
          logAudit({
            userId,
            action: "mission_control.chat",
            metadata: {
              agentId,
              squadId,
              messageCount: messages.length,
              tokens,
            },
          });
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Stream error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errorMsg })}\n\n`
            )
          );
          controller.close();

          logAudit({
            userId,
            action: "mission_control.chat",
            success: false,
            errorMsg,
          });
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error calling Claude API:", error);
    logAudit({
      userId,
      action: "mission_control.chat",
      success: false,
      errorMsg: String(error),
    });
    return NextResponse.json(
      { error: "Error connecting to AI. Please try again." },
      { status: 500 }
    );
  }
}
