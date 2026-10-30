"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { blockedFor, recordAttempt } from "@/lib/auth/rate-limit";
import { open } from "@/lib/crypto/secret-box";
import { InvalidKeyError, RefusedError } from "@/lib/translate/claude";
import { DEFAULT_CLAUDE_MODEL, isClaudeModel, LANGUAGES, type ClaudeModel } from "@/lib/translate/types";
import { enrichWords, reviewSentences } from "./claude";
import { applyEnrichment, cachedEnrichments, saveEnrichments, toEnrichment } from "./enrich";
import { practiceItems } from "./queries";
import { PRACTICE_PERIODS, type PracticeData, type PracticeItem, type SentenceReview } from "./types";

const CLAUDE_LIMIT = { max: 300, windowMs: 3_600_000 };
const BATCH = 25;

const loadSchema = z.object({
  deckId: z.string().uuid().nullable(),
  period: z.enum(PRACTICE_PERIODS),
});

const prepareSchema = loadSchema.extend({
  ids: z.array(z.string().uuid()).min(1).max(BATCH),
});

const sentencesSchema = z
  .array(
    z.object({
      id: z.string().min(1).max(80),
      term: z.string().trim().min(1).max(120),
      meaning: z.string().trim().min(1).max(200),
      language: z.enum(LANGUAGES).nullable(),
      sentence: z.string().trim().min(1).max(400),
    }),
  )
  .min(1)
  .max(20);

async function claudeSettings(userId: string): Promise<{ apiKey: string; model: ClaudeModel } | null> {
  const settings = await prisma.user.findUnique({ where: { id: userId }, select: { anthropicKey: true, anthropicModel: true } });
  const apiKey = settings?.anthropicKey ? open(settings.anthropicKey) : null;
  if (!apiKey) return null;
  return { apiKey, model: isClaudeModel(settings?.anthropicModel) ? settings.anthropicModel : DEFAULT_CLAUDE_MODEL };
}

async function withCache(userId: string, items: PracticeItem[], hasKey: boolean): Promise<PracticeData> {
  const cached = await cachedEnrichments(userId, items);
  return {
    items: items.map((item) => {
      const data = cached.get(item.id);
      return data ? applyEnrichment(item, data) : item;
    }),
    hasKey,
    pending: hasKey ? items.filter((item) => !cached.has(item.id)).length : 0,
  };
}

export async function loadPracticeItems(raw: unknown): Promise<PracticeData> {
  const user = await requireUser();
  const parsed = loadSchema.safeParse(raw);
  if (!parsed.success) return { items: [], hasKey: false, pending: 0 };
  const [items, claude] = await Promise.all([practiceItems(user.id, parsed.data.deckId, parsed.data.period), claudeSettings(user.id)]);
  return withCache(user.id, items, Boolean(claude));
}

export type PrepareResult = { status: "ok"; data: PracticeData } | { status: "no-key" | "invalid-key" | "rate-limited" | "unavailable" | "invalid" };

export async function preparePractice(raw: unknown): Promise<PrepareResult> {
  const user = await requireUser();
  const parsed = prepareSchema.safeParse(raw);
  if (!parsed.success) return { status: "invalid" };
  const claude = await claudeSettings(user.id);
  if (!claude) return { status: "no-key" };
  const items = await practiceItems(user.id, parsed.data.deckId, parsed.data.period);
  const ids = new Set(parsed.data.ids);
  const targets = items.filter((item) => ids.has(item.id));
  const cached = await cachedEnrichments(user.id, targets);
  const missing = targets.filter((item) => !cached.has(item.id));
  if (missing.length > 0) {
    const key = `claude:${user.id}`;
    if ((await blockedFor([{ key, ...CLAUDE_LIMIT }])) > 0) return { status: "rate-limited" };
    await recordAttempt([key]);
    try {
      const words = await enrichWords(
        claude.apiKey,
        claude.model,
        missing.map((item, index) => ({ id: String(index + 1), term: item.term, meaning: item.meaning, example: item.example })),
      );
      const byId = new Map(words.map((word) => [word.id, word]));
      await saveEnrichments(
        user.id,
        missing.flatMap((item, index) => {
          const output = byId.get(String(index + 1));
          return output ? [{ item, data: toEnrichment(output, item) }] : [];
        }),
      );
    } catch (error) {
      if (error instanceof InvalidKeyError) return { status: "invalid-key" };
      console.error("[practice] enrichment failed", error);
      return { status: "unavailable" };
    }
  }
  return { status: "ok", data: await withCache(user.id, items, true) };
}

export type SentencesResult = { status: "ok"; reviews: Record<string, SentenceReview> } | { status: "no-key" | "invalid-key" | "rate-limited" | "refused" | "unavailable" | "invalid" };

export async function reviewSentenceBatch(raw: unknown): Promise<SentencesResult> {
  const user = await requireUser();
  const parsed = sentencesSchema.safeParse(raw);
  if (!parsed.success) return { status: "invalid" };
  const claude = await claudeSettings(user.id);
  if (!claude) return { status: "no-key" };
  const key = `claude:${user.id}`;
  if ((await blockedFor([{ key, ...CLAUDE_LIMIT }])) > 0) return { status: "rate-limited" };
  await recordAttempt([key]);
  try {
    const reviews = await reviewSentences(claude.apiKey, claude.model, parsed.data, user.locale);
    return { status: "ok", reviews: Object.fromEntries(reviews) };
  } catch (error) {
    if (error instanceof InvalidKeyError) return { status: "invalid-key" };
    if (error instanceof RefusedError) return { status: "refused" };
    console.error("[practice] sentence review failed", error);
    return { status: "unavailable" };
  }
}
