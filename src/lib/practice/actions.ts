"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { blockedFor, recordAttempt } from "@/lib/auth/rate-limit";
import { open } from "@/lib/crypto/secret-box";
import { InvalidKeyError, RefusedError } from "@/lib/translate/claude";
import { DEFAULT_CLAUDE_MODEL, isClaudeModel, LANGUAGES } from "@/lib/translate/types";
import { reviewSentence as askClaude } from "./claude";
import { practiceItems } from "./queries";
import { PRACTICE_PERIODS, type PracticeItem, type SentenceReview } from "./types";

const CLAUDE_LIMIT = { max: 300, windowMs: 3_600_000 };

const loadSchema = z.object({
  deckId: z.string().uuid().nullable(),
  period: z.enum(PRACTICE_PERIODS),
});

const sentenceSchema = z.object({
  term: z.string().trim().min(1).max(120),
  meaning: z.string().trim().min(1).max(200),
  language: z.enum(LANGUAGES).nullable(),
  sentence: z.string().trim().min(1).max(400),
});

export async function loadPracticeItems(raw: unknown): Promise<PracticeItem[]> {
  const user = await requireUser();
  const parsed = loadSchema.safeParse(raw);
  if (!parsed.success) return [];
  return practiceItems(user.id, parsed.data.deckId, parsed.data.period);
}

export type SentenceResult = { status: "ok"; review: SentenceReview } | { status: "no-key" | "invalid-key" | "rate-limited" | "refused" | "unavailable" | "invalid" };

export async function reviewSentence(raw: unknown): Promise<SentenceResult> {
  const user = await requireUser();
  const parsed = sentenceSchema.safeParse(raw);
  if (!parsed.success) return { status: "invalid" };
  const settings = await prisma.user.findUnique({ where: { id: user.id }, select: { anthropicKey: true, anthropicModel: true } });
  const apiKey = settings?.anthropicKey ? open(settings.anthropicKey) : null;
  if (!apiKey) return { status: "no-key" };
  const key = `claude:${user.id}`;
  if ((await blockedFor([{ key, ...CLAUDE_LIMIT }])) > 0) return { status: "rate-limited" };
  await recordAttempt([key]);
  const model = isClaudeModel(settings?.anthropicModel) ? settings.anthropicModel : DEFAULT_CLAUDE_MODEL;
  try {
    return { status: "ok", review: await askClaude(apiKey, model, parsed.data, user.locale) };
  } catch (error) {
    if (error instanceof InvalidKeyError) return { status: "invalid-key" };
    if (error instanceof RefusedError) return { status: "refused" };
    console.error("[practice] sentence review failed", error);
    return { status: "unavailable" };
  }
}
