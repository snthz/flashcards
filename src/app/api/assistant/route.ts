import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/user";
import { blockedFor, recordAttempt } from "@/lib/auth/rate-limit";
import { open } from "@/lib/crypto/secret-box";
import { streamAnswer } from "@/lib/assistant/claude";
import { MAX_ANSWER, MAX_CARD_CONTEXT, MAX_QUESTION, MAX_TURNS, type AssistantError, type AssistantEvent } from "@/lib/assistant/types";
import { DEFAULT_CLAUDE_MODEL, isClaudeModel } from "@/lib/translate/types";

const LIMIT = { max: 200, windowMs: 3_600_000 };

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(MAX_ANSWER) }))
    .min(1)
    .max(MAX_TURNS * 2),
  card: z.string().trim().max(MAX_CARD_CONTEXT).nullish(),
});

function failure(error: AssistantError, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin || origin === `${request.headers.get("x-forwarded-proto") ?? "https"}://${request.headers.get("host")}`;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure("unavailable", 400);
  const messages = parsed.data.messages.slice(-MAX_TURNS * 2);
  while (messages.length > 0 && messages[0].role !== "user") messages.shift();
  const last = messages.at(-1);
  if (!last || last.role !== "user") return failure("unavailable", 400);
  if (last.content.length > MAX_QUESTION) return failure("too-long", 400);

  const settings = await prisma.user.findUnique({ where: { id: user.id }, select: { anthropicKey: true, anthropicModel: true } });
  const apiKey = settings?.anthropicKey ? open(settings.anthropicKey) : null;
  if (!apiKey) return failure("no-key", 409);

  const key = `assistant:${user.id}`;
  if ((await blockedFor([{ key, ...LIMIT }])) > 0) return failure("rate-limited", 429);
  await recordAttempt([key]);

  const model = isClaudeModel(settings?.anthropicModel) ? settings.anthropicModel : DEFAULT_CLAUDE_MODEL;
  const stream = streamAnswer(apiKey, model, messages, user.locale, parsed.data.card ?? null, request.signal);
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AssistantEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") send({ type: "text", text: event.delta.text });
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") send({ type: "error", error: "refused" });
        else send({ type: "done", truncated: final.stop_reason === "max_tokens" });
      } catch (error) {
        if (request.signal.aborted) {
          controller.close();
          return;
        }
        if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
          send({ type: "error", error: "invalid-key" });
        } else {
          console.error("[assistant] claude failed", error);
          send({ type: "error", error: "unavailable" });
        }
      }
      controller.close();
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
