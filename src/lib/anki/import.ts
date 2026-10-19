import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { safeMediaName, sha1, writeMediaFile, mimeTypeFor } from "@/lib/media";
import { toDeckDescription } from "@/lib/decks/description";
import { defaultConfigName } from "@/lib/defaults";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/messages";
import { plainText } from "./render";
import type { ParsedCollection, ParsedDeckConfig } from "./types";

export interface ImportSummary {
  decks: number;
  noteTypes: number;
  notes: number;
  updatedNotes: number;
  cards: number;
  media: number;
  skippedCards: number;
}

const BATCH = 500;

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

async function ensureDeckConfig(userId: string, parsed: ParsedDeckConfig, defaultId: string) {
  const isDefaultLike = parsed.ankiId === 1n;
  if (isDefaultLike) return defaultId;
  const existing = await prisma.deckConfig.findFirst({ where: { userId, name: parsed.name }, select: { id: true } });
  if (existing) return existing.id;
  const created = await prisma.deckConfig.create({
    data: {
      userId,
      name: parsed.name,
      algorithm: parsed.algorithm,
      newPerDay: parsed.newPerDay,
      reviewsPerDay: parsed.reviewsPerDay,
      learningSteps: parsed.learningSteps,
      relearningSteps: parsed.relearningSteps,
      graduatingInterval: parsed.graduatingInterval,
      easyInterval: parsed.easyInterval,
      startingEase: parsed.startingEase,
      easyBonus: parsed.easyBonus,
      hardMultiplier: parsed.hardMultiplier,
      intervalModifier: parsed.intervalModifier,
      lapseMultiplier: parsed.lapseMultiplier,
      minLapseInterval: parsed.minLapseInterval,
      maxInterval: parsed.maxInterval,
      leechThreshold: parsed.leechThreshold,
      leechAction: parsed.leechAction,
      desiredRetention: parsed.desiredRetention,
      fsrsWeights: parsed.fsrsWeights,
    },
    select: { id: true },
  });
  return created.id;
}

async function ensureDeckPath(userId: string, fullName: string, configId: string, ankiId: bigint | null, description: string) {
  const text = toDeckDescription(description);
  const parts = fullName
    .split("::")
    .map((p) => p.trim())
    .filter(Boolean);
  let parentId: string | null = null;
  let deckId: string | null = null;
  for (let i = 0; i < parts.length; i += 1) {
    const name = parts[i];
    const isLeaf = i === parts.length - 1;
    const existing: { id: string } | null = await prisma.deck.findFirst({
      where: { userId, name, parentId },
      select: { id: true },
    });
    if (existing) {
      deckId = existing.id;
      if (isLeaf) {
        await prisma.deck.update({
          where: { id: existing.id },
          data: { ankiId: ankiId ?? undefined, description: text || undefined },
        });
      }
    } else {
      const created: { id: string } = await prisma.deck.create({
        data: {
          userId,
          name,
          parentId,
          configId,
          ankiId: isLeaf ? ankiId : null,
          description: isLeaf ? text : "",
        },
        select: { id: true },
      });
      deckId = created.id;
    }
    parentId = deckId;
  }
  return deckId;
}

export async function importCollection(userId: string, parsed: ParsedCollection, locale: Locale = defaultLocale): Promise<ImportSummary> {
  const fallbackDeckName = dictionaries[locale].importer.defaults.deck;
  const summary: ImportSummary = { decks: 0, noteTypes: 0, notes: 0, updatedNotes: 0, cards: 0, media: 0, skippedCards: 0 };
  const defaultConfig =
    (await prisma.deckConfig.findFirst({ where: { userId, isDefault: true }, select: { id: true } })) ??
    (await prisma.deckConfig.create({ data: { userId, name: defaultConfigName(locale), isDefault: true }, select: { id: true } }));

  const noteTypeIds = new Map<string, { id: string; fieldNames: string[]; sortFieldIdx: number }>();
  for (const noteType of parsed.noteTypes) {
    const existing = await prisma.noteType.findFirst({
      where: { userId, ankiId: noteType.ankiId },
      select: { id: true, fields: true, sortFieldIdx: true },
    });
    if (existing) {
      await prisma.noteType.update({
        where: { id: existing.id },
        data: { css: noteType.css, templates: noteType.templates, fields: noteType.fields, name: noteType.name },
      });
      noteTypeIds.set(noteType.ankiId.toString(), {
        id: existing.id,
        fieldNames: noteType.fields.map((f) => f.name),
        sortFieldIdx: noteType.sortFieldIdx,
      });
      continue;
    }
    const created = await prisma.noteType.create({
      data: {
        userId,
        ankiId: noteType.ankiId,
        name: noteType.name,
        kind: noteType.kind,
        css: noteType.css,
        fields: noteType.fields,
        templates: noteType.templates,
        sortFieldIdx: noteType.sortFieldIdx,
        latexPre: noteType.latexPre,
        latexPost: noteType.latexPost,
      },
      select: { id: true },
    });
    summary.noteTypes += 1;
    noteTypeIds.set(noteType.ankiId.toString(), {
      id: created.id,
      fieldNames: noteType.fields.map((f) => f.name),
      sortFieldIdx: noteType.sortFieldIdx,
    });
  }

  const configIds = new Map<string, string>();
  for (const config of parsed.deckConfigs) {
    configIds.set(config.ankiId.toString(), await ensureDeckConfig(userId, config, defaultConfig.id));
  }

  const usedDeckIds = new Set(parsed.cards.map((c) => c.deckAnkiId.toString()));
  const deckIds = new Map<string, string>();
  const sortedDecks = [...parsed.decks].sort((a, b) => a.name.localeCompare(b.name));
  for (const deck of sortedDecks) {
    const key = deck.ankiId.toString();
    const isDefaultDeck = deck.ankiId === 1n;
    if (isDefaultDeck && !usedDeckIds.has(key)) continue;
    const configId = deck.configAnkiId ? (configIds.get(deck.configAnkiId.toString()) ?? defaultConfig.id) : defaultConfig.id;
    const before = await prisma.deck.count({ where: { userId } });
    const deckId = await ensureDeckPath(userId, deck.name || fallbackDeckName, configId, deck.ankiId, deck.description);
    const after = await prisma.deck.count({ where: { userId } });
    summary.decks += after - before;
    if (deckId) deckIds.set(key, deckId);
  }
  const fallbackDeckId = async () => {
    const existing = deckIds.values().next();
    if (!existing.done) return existing.value;
    const created = await ensureDeckPath(userId, fallbackDeckName, defaultConfig.id, null, "");
    return created ?? "";
  };
  for (const key of usedDeckIds) {
    if (!deckIds.has(key)) {
      const parsedDeck = parsed.decks.find((d) => d.ankiId.toString() === key);
      if (parsedDeck) {
        const id = await ensureDeckPath(userId, parsedDeck.name, defaultConfig.id, parsedDeck.ankiId, parsedDeck.description);
        if (id) deckIds.set(key, id);
      } else {
        deckIds.set(key, await fallbackDeckId());
      }
    }
  }

  const guids = parsed.notes.map((n) => n.guid).filter(Boolean);
  const existingNotes = new Map<string, string>();
  for (const batch of chunk(guids, 2000)) {
    const rows = await prisma.note.findMany({
      where: { userId, ankiGuid: { in: batch } },
      select: { id: true, ankiGuid: true },
    });
    for (const row of rows) if (row.ankiGuid) existingNotes.set(row.ankiGuid, row.id);
  }

  const noteIds = new Map<string, string>();
  const noteCreates: Prisma.NoteCreateManyInput[] = [];
  const noteUpdates: Array<{ id: string; fields: string[]; tags: string[]; sortField: string }> = [];
  for (const note of parsed.notes) {
    const noteType = noteTypeIds.get(note.noteTypeAnkiId.toString());
    if (!noteType) continue;
    const sortField = plainText(note.fields[noteType.sortFieldIdx] ?? note.fields[0] ?? "", 200);
    const existingId = note.guid ? existingNotes.get(note.guid) : undefined;
    if (existingId) {
      noteIds.set(note.ankiId.toString(), existingId);
      noteUpdates.push({ id: existingId, fields: note.fields, tags: note.tags, sortField });
      continue;
    }
    const id = randomUUID();
    noteIds.set(note.ankiId.toString(), id);
    noteCreates.push({
      id,
      userId,
      noteTypeId: noteType.id,
      fields: note.fields,
      tags: note.tags,
      sortField,
      ankiGuid: note.guid || null,
    });
  }
  for (const batch of chunk(noteCreates, BATCH)) {
    await prisma.note.createMany({ data: batch });
  }
  summary.notes = noteCreates.length;
  for (const batch of chunk(noteUpdates, 100)) {
    await prisma.$transaction(
      batch.map((update) =>
        prisma.note.update({
          where: { id: update.id },
          data: { fields: update.fields, tags: update.tags, sortField: update.sortField },
        }),
      ),
    );
  }
  summary.updatedNotes = noteUpdates.length;

  const cardAnkiIds = parsed.cards.map((c) => c.ankiId);
  const existingCards = new Set<string>();
  for (const batch of chunk(cardAnkiIds, 2000)) {
    const rows = await prisma.card.findMany({ where: { userId, ankiId: { in: batch } }, select: { ankiId: true } });
    for (const row of rows) if (row.ankiId != null) existingCards.add(row.ankiId.toString());
  }
  const existingNoteIds = new Set(existingNotes.values());
  const existingNoteCards = new Map<string, Set<number>>();
  if (existingNoteIds.size > 0) {
    for (const batch of chunk([...existingNoteIds], 2000)) {
      const rows = await prisma.card.findMany({ where: { noteId: { in: batch } }, select: { noteId: true, ord: true } });
      for (const row of rows) {
        const set = existingNoteCards.get(row.noteId) ?? new Set<number>();
        set.add(row.ord);
        existingNoteCards.set(row.noteId, set);
      }
    }
  }

  const now = new Date();
  const cardCreates: Prisma.CardCreateManyInput[] = [];
  for (const card of parsed.cards) {
    const noteId = noteIds.get(card.noteAnkiId.toString());
    const deckId = deckIds.get(card.deckAnkiId.toString());
    if (!noteId || !deckId) {
      summary.skippedCards += 1;
      continue;
    }
    if (existingCards.has(card.ankiId.toString()) || existingNoteCards.get(noteId)?.has(card.ord)) {
      summary.skippedCards += 1;
      continue;
    }
    cardCreates.push({
      userId,
      noteId,
      deckId,
      ord: card.ord,
      state: card.state,
      due: card.state === "NEW" ? now : card.due,
      newPosition: card.newPosition,
      interval: card.interval,
      ease: card.ease,
      reps: card.reps,
      lapses: card.lapses,
      step: card.step,
      stability: card.stability,
      difficulty: card.difficulty,
      lastReview: card.reps > 0 && card.state !== "NEW" ? new Date(Math.min(now.getTime(), card.due.getTime() - card.interval * 86_400_000)) : null,
      suspended: card.suspended,
      buriedUntil: null,
      flag: card.flag,
      ankiId: card.ankiId,
    });
  }
  for (const batch of chunk(cardCreates, BATCH)) {
    await prisma.card.createMany({ data: batch });
  }
  summary.cards = cardCreates.length;

  for (const file of parsed.media) {
    const name = safeMediaName(file.name);
    if (!name || file.data.length === 0) continue;
    const digest = sha1(file.data);
    const existing = await prisma.media.findUnique({ where: { userId_name: { userId, name } }, select: { id: true, sha1: true } });
    if (existing?.sha1 === digest) continue;
    const relative = await writeMediaFile(userId, name, file.data);
    await prisma.media.upsert({
      where: { userId_name: { userId, name } },
      create: { userId, name, path: relative, size: file.data.length, sha1: digest, mimeType: mimeTypeFor(name) },
      update: { path: relative, size: file.data.length, sha1: digest, mimeType: mimeTypeFor(name) },
    });
    summary.media += 1;
  }

  return summary;
}
