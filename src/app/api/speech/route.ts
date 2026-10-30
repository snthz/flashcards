import type { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/user";
import { blockedFor, recordAttempt } from "@/lib/auth/rate-limit";
import { cachedSpeech, normalizeSpeech, queueSpeech, speechEnabled } from "@/lib/tts/engine";
import { MAX_SPEECH_CHARS, naturalVoice } from "@/lib/tts/voices";

const LIMIT = { max: 1500, windowMs: 3_600_000 };
const NO_STORE = { "Cache-Control": "no-store" };

const prefetchSchema = z.object({
  items: z
    .array(z.object({ text: z.string().min(1).max(MAX_SPEECH_CHARS * 2), lang: z.string().min(2).max(12) }))
    .min(1)
    .max(60),
});

async function allowed(userId: string, count: number) {
  const key = `speech:${userId}`;
  if ((await blockedFor([{ key, ...LIMIT }])) > 0) return false;
  await Promise.all(Array.from({ length: Math.min(count, 5) }, () => recordAttempt([key])));
  return true;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  const lang = request.nextUrl.searchParams.get("lang") ?? "";
  const text = normalizeSpeech(request.nextUrl.searchParams.get("text") ?? "");
  if (!text) return new Response(null, { status: 400, headers: NO_STORE });
  if (!naturalVoice(lang) || !speechEnabled()) return new Response(null, { status: 501, headers: NO_STORE });
  const audio = await cachedSpeech(text, lang);
  if (audio) {
    return new Response(new Uint8Array(audio), {
      headers: { "Content-Type": "audio/wav", "Content-Length": String(audio.length), "Cache-Control": "private, max-age=31536000, immutable" },
    });
  }
  if (await allowed(user.id, 1)) queueSpeech(text, lang, true);
  return new Response(null, { status: 202, headers: { ...NO_STORE, "Retry-After": "2" } });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  if (!speechEnabled()) return Response.json({ queued: 0 }, { status: 501, headers: NO_STORE });
  const parsed = prefetchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ queued: 0 }, { status: 400, headers: NO_STORE });
  const wanted = [];
  for (const item of parsed.data.items) {
    if (!naturalVoice(item.lang)) continue;
    if (await cachedSpeech(item.text, item.lang)) continue;
    wanted.push(item);
  }
  if (wanted.length > 0 && !(await allowed(user.id, wanted.length))) return Response.json({ queued: 0 }, { status: 429, headers: NO_STORE });
  let queued = 0;
  for (const item of wanted) if (queueSpeech(item.text, item.lang, false)) queued += 1;
  return Response.json({ queued }, { status: 202, headers: NO_STORE });
}
