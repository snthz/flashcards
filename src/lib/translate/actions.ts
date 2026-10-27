"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { blockedFor, recordAttempt } from "@/lib/auth/rate-limit";
import { getI18n } from "@/lib/i18n/server";
import { open, seal } from "@/lib/crypto/secret-box";
import { createNote, type NoteActionState } from "@/lib/notes/actions";
import { getDeckOptions } from "@/lib/notes/queries";
import { LruCache } from "./cache";
import { InvalidKeyError, RefusedError, translateWithClaude, verifyKey } from "./claude";
import { lookupWord, NotFoundError } from "./dictionary";
import { QuotaError, translateFree } from "./free";
import { ensureVocabularyNoteType } from "./notes";
import { vocabularyFields } from "./vocabulary";
import {
  CLAUDE_MODELS,
  DEFAULT_CLAUDE_MODEL,
  isClaudeModel,
  LANGUAGES,
  MAX_CONTEXT,
  MAX_TEXT,
  type ActionResult,
  type DictionaryResult,
  type TranslationResult,
} from "./types";

const HOUR = 3_600_000;
const FREE_LIMIT = { max: 100, windowMs: HOUR };
const CLAUDE_LIMIT = { max: 300, windowMs: HOUR };
const DICTIONARY_LIMIT = { max: 200, windowMs: HOUR };

const freeCache = new LruCache<TranslationResult>(500, 24 * HOUR);
const dictionaryCache = new LruCache<DictionaryResult>(500, 24 * HOUR);

const translateSchema = z.object({
  text: z.string().trim().min(1).max(MAX_TEXT),
  source: z.enum(["auto", ...LANGUAGES]),
  target: z.enum(LANGUAGES),
  context: z.string().trim().max(MAX_CONTEXT).optional(),
});

const lookupSchema = z.object({
  word: z.string().trim().min(1).max(80),
  language: z.enum(["auto", ...LANGUAGES]),
});

async function limited(key: string, limit: { max: number; windowMs: number }) {
  if ((await blockedFor([{ key, ...limit }])) > 0) return true;
  await recordAttempt([key]);
  return false;
}

async function freeTranslation(input: z.infer<typeof translateSchema>, userId: string): Promise<ActionResult<TranslationResult>> {
  const cacheKey = JSON.stringify([input.text, input.source, input.target]);
  const cached = freeCache.get(cacheKey);
  if (cached) return { ok: true, data: cached };
  if (await limited(`translate:${userId}`, FREE_LIMIT)) return { ok: false, error: "rate-limited" };
  try {
    const data = await translateFree(input);
    freeCache.set(cacheKey, data);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof QuotaError) return { ok: false, error: "quota" };
    return { ok: false, error: "unavailable" };
  }
}

export async function translateText(raw: unknown): Promise<ActionResult<TranslationResult>> {
  const user = await requireUser();
  const parsed = translateSchema.safeParse(raw);
  if (!parsed.success) {
    const tooLong = parsed.error.issues.some((issue) => issue.code === "too_big");
    return { ok: false, error: tooLong ? "too-long" : "empty" };
  }
  const input = parsed.data;
  const settings = await prisma.user.findUnique({ where: { id: user.id }, select: { anthropicKey: true, anthropicModel: true, locale: true } });
  const apiKey = settings?.anthropicKey ? open(settings.anthropicKey) : null;
  if (!apiKey) return freeTranslation(input, user.id);

  if (await limited(`claude:${user.id}`, CLAUDE_LIMIT)) return { ok: false, error: "rate-limited" };
  const model = isClaudeModel(settings?.anthropicModel) ? settings.anthropicModel : DEFAULT_CLAUDE_MODEL;
  try {
    return { ok: true, data: await translateWithClaude(apiKey, model, input, settings?.locale ?? "en") };
  } catch (error) {
    if (error instanceof InvalidKeyError) return { ok: false, error: "invalid-key" };
    if (error instanceof RefusedError) return { ok: false, error: "refused" };
    console.error("[translate] claude failed, using the free translator", error);
    const fallback = await freeTranslation(input, user.id);
    return fallback.ok ? { ok: true, data: { ...fallback.data, warning: "claude-unavailable" } } : fallback;
  }
}

export async function lookupDictionary(raw: unknown): Promise<ActionResult<DictionaryResult>> {
  const user = await requireUser();
  const parsed = lookupSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "empty" };
  const { word, language } = parsed.data;
  const cacheKey = JSON.stringify([word, language]);
  const cached = dictionaryCache.get(cacheKey);
  if (cached) return { ok: true, data: cached };
  if (await limited(`dictionary:${user.id}`, DICTIONARY_LIMIT)) return { ok: false, error: "rate-limited" };
  try {
    const data = await lookupWord(word, language);
    dictionaryCache.set(cacheKey, data);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: "not-found" };
    return { ok: false, error: "unavailable" };
  }
}

export type KeyState = { status: "idle" | "saved" | "removed" | "invalid" | "model" | "unreachable" | "format" };

export async function saveTranslatorKey(apiKey: string, model: string): Promise<KeyState> {
  const user = await requireUser();
  const key = String(apiKey ?? "").trim();
  const chosen = isClaudeModel(model) ? model : DEFAULT_CLAUDE_MODEL;
  if (!/^sk-ant-[\w-]{20,}$/.test(key)) return { status: "format" };
  const check = await verifyKey(key, chosen);
  if (check !== "ok") return { status: check };
  await prisma.user.update({ where: { id: user.id }, data: { anthropicKey: seal(key), anthropicModel: chosen } });
  revalidatePath("/settings");
  return { status: "saved" };
}

export async function saveTranslatorModel(model: string) {
  const user = await requireUser();
  if (!(CLAUDE_MODELS as readonly string[]).includes(model)) return;
  await prisma.user.update({ where: { id: user.id }, data: { anthropicModel: model } });
}

export async function removeTranslatorKey(): Promise<KeyState> {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { anthropicKey: null } });
  revalidatePath("/settings");
  return { status: "removed" };
}

const line = (max: number) => z.string().trim().max(max).default("");

const cardSchema = z.object({
  deckId: z.string().uuid(),
  term: z.string().trim().min(1).max(MAX_TEXT),
  meaning: z.string().trim().min(1).max(MAX_TEXT * 2),
  termLang: z.enum(LANGUAGES),
  kind: line(80),
  synonyms: line(400),
  example: line(MAX_TEXT),
  exampleTranslation: line(MAX_TEXT),
  notes: line(MAX_TEXT),
  direction: z.enum(["forward", "reverse", "both"]),
});

export async function saveTranslationCard(raw: unknown): Promise<NoteActionState> {
  const [user, { locale, t }] = await Promise.all([requireUser(), getI18n()]);
  const parsed = cardSchema.safeParse(raw);
  if (!parsed.success) return { error: t.translate.cardInvalid };
  const card = parsed.data;
  const noteTypeId = await ensureVocabularyNoteType(user.id, card.termLang, locale);
  const form = new FormData();
  form.set("deckId", card.deckId);
  form.set("noteTypeId", noteTypeId);
  vocabularyFields(card).forEach((value, index) => form.set(`field-${index}`, value));
  form.set("tags", "translator");
  return createNote({}, form);
}

export async function translatorDecks() {
  const user = await requireUser();
  return getDeckOptions(user);
}
