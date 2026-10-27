import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { isLanguage } from "@/lib/translate/types";
import type { EnrichmentOutput } from "./claude";
import type { Enrichment, PracticeItem } from "./types";

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function distinct(values: string[], exclude: string) {
  const seen = new Set([exclude.trim().toLowerCase()]);
  return values
    .map(clean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

export function enrichmentHash(item: Pick<PracticeItem, "term" | "meaning" | "example">) {
  return createHash("sha256").update(`${item.term}\u0000${item.meaning}\u0000${item.example}`).digest("hex").slice(0, 16);
}

export function toEnrichment(output: EnrichmentOutput, item: PracticeItem): Enrichment {
  const example = clean(output.example);
  const answer = clean(output.cloze_answer);
  return {
    language: output.language.trim().slice(0, 2).toLowerCase(),
    example,
    exampleTranslation: clean(output.example_translation),
    answer: answer && example.includes(answer) ? answer : "",
    past: clean(output.past),
    participle: clean(output.participle),
    wrongMeanings: distinct(output.wrong_meanings, item.meaning),
    wrongTerms: distinct(output.wrong_terms, item.term),
  };
}

export function applyEnrichment(item: PracticeItem, data: Enrichment): PracticeItem {
  const ownExample = Boolean(item.example);
  const example = item.example || data.example;
  const sameExample = data.example === example;
  return {
    ...item,
    language: item.language ?? (isLanguage(data.language) ? data.language : null),
    example,
    exampleTranslation: item.exampleTranslation || (sameExample ? data.exampleTranslation : ""),
    answer: item.answer || (sameExample || ownExample ? (data.answer && example.includes(data.answer) ? data.answer : "") : ""),
    past: item.past || (item.participle ? "" : data.past),
    participle: item.participle || (item.past ? "" : data.participle),
    distractors: { meanings: data.wrongMeanings, terms: data.wrongTerms },
  };
}

function isEnrichment(value: unknown): value is Enrichment {
  const data = value as Enrichment | null;
  return Boolean(data && typeof data.example === "string" && Array.isArray(data.wrongMeanings) && Array.isArray(data.wrongTerms));
}

export async function cachedEnrichments(userId: string, items: PracticeItem[]) {
  if (items.length === 0) return new Map<string, Enrichment>();
  const rows = await prisma.practiceEnrichment.findMany({ where: { userId, noteId: { in: items.map((item) => item.id) } }, select: { noteId: true, hash: true, data: true } });
  const hashes = new Map(items.map((item) => [item.id, enrichmentHash(item)]));
  const cached = new Map<string, Enrichment>();
  for (const row of rows) {
    if (row.hash === hashes.get(row.noteId) && isEnrichment(row.data)) cached.set(row.noteId, row.data);
  }
  return cached;
}

export async function saveEnrichments(userId: string, entries: Array<{ item: PracticeItem; data: Enrichment }>) {
  await prisma.$transaction(
    entries.map(({ item, data }) =>
      prisma.practiceEnrichment.upsert({
        where: { noteId: item.id },
        create: { noteId: item.id, userId, hash: enrichmentHash(item), data: { ...data } },
        update: { hash: enrichmentHash(item), data: { ...data }, createdAt: new Date() },
      }),
    ),
  );
}
