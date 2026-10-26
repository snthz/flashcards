import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/user";
import { dayWindow, getDeckSubtreeIds } from "@/lib/decks/queries";
import { ankiGuid } from "@/lib/anki/guid";
import {
  DEFAULT_ANKI_ID,
  type ExportCard,
  type ExportDeck,
  type ExportDeckConfig,
  type ExportInput,
  type ExportNote,
  type ExportNoteType,
  type ExportReview,
  type TextExportNote,
} from "@/lib/anki/export";
import type { NoteTypeField, NoteTypeTemplate } from "@/lib/anki/types";

const CHUNK = 5000;
const SRC_RE = /<(?:img|audio|video|source)\b[^>]*?\s(?:src|data-src)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const SOUND_RE = /\[sound:([^\]]+)\]/g;

export interface ExportOptions {
  deckId: string | null;
  includeScheduling: boolean;
  includeMedia: boolean;
}

export interface ExportBundle {
  name: string;
  input: ExportInput;
  text: TextExportNote[];
  media: Array<{ index: number; name: string; path: string }>;
}

function chunk<T>(items: T[], size = CHUNK) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

class IdAllocator {
  private used = new Set<string>();

  reserve(id: bigint) {
    this.used.add(id.toString());
  }

  take(preferred: bigint | null, fallbackMs: number) {
    if (preferred != null && !this.used.has(preferred.toString())) {
      this.used.add(preferred.toString());
      return preferred;
    }
    let candidate = BigInt(Math.max(1, Math.floor(fallbackMs)));
    while (this.used.has(candidate.toString()) || candidate === DEFAULT_ANKI_ID) candidate += 1n;
    this.used.add(candidate.toString());
    return candidate;
  }
}

function isExternal(url: string) {
  return /^(?:https?:|data:|blob:|\/|#)/i.test(url);
}

function mediaReferences(html: string, names: Set<string>) {
  const add = (raw: string | undefined) => {
    const value = raw?.trim();
    if (!value || isExternal(value) || value.startsWith("tts:")) return;
    names.add(value);
    try {
      names.add(decodeURIComponent(value));
    } catch {
      return;
    }
  };
  for (const match of html.matchAll(SRC_RE)) add(match[1] ?? match[2] ?? match[3]);
  for (const match of html.matchAll(SOUND_RE)) add(match[1]);
}

async function deckRows(userId: string, deckId: string | null) {
  const decks = await prisma.deck.findMany({
    where: { userId },
    select: { id: true, name: true, parentId: true, description: true, configId: true, ankiId: true, createdAt: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const byId = new Map(decks.map((deck) => [deck.id, deck]));
  const fullName = (id: string): string => {
    const deck = byId.get(id);
    if (!deck) return "";
    return deck.parentId && byId.has(deck.parentId) ? `${fullName(deck.parentId)}::${deck.name}` : deck.name;
  };
  if (!deckId) return { decks, fullName, rootName: null };
  if (!byId.has(deckId)) return null;
  const ids = new Set(await getDeckSubtreeIds(userId, deckId));
  return { decks: decks.filter((deck) => ids.has(deck.id)), fullName, rootName: fullName(deckId) };
}

async function ensureGuids(userId: string, notes: Array<{ id: string; ankiGuid: string | null }>) {
  const missing = notes.filter((note) => !note.ankiGuid);
  for (const batch of chunk(missing, 200)) {
    await prisma.$transaction(
      batch.map((note) => {
        note.ankiGuid = ankiGuid();
        return prisma.note.updateMany({ where: { id: note.id, userId, ankiGuid: null }, data: { ankiGuid: note.ankiGuid } });
      }),
    );
  }
}

async function ensureNoteTypeIds(userId: string, noteTypes: Array<{ id: string; ankiId: bigint | null; createdAt: Date }>) {
  const taken = await prisma.noteType.findMany({ where: { userId, ankiId: { not: null } }, select: { ankiId: true } });
  const allocator = new IdAllocator();
  for (const row of taken) if (row.ankiId != null) allocator.reserve(row.ankiId);
  for (const noteType of noteTypes) {
    if (noteType.ankiId != null) continue;
    noteType.ankiId = allocator.take(null, noteType.createdAt.getTime());
    await prisma.noteType.updateMany({ where: { id: noteType.id, userId, ankiId: null }, data: { ankiId: noteType.ankiId } });
  }
}

export async function collectExport(user: CurrentUser, options: ExportOptions): Promise<ExportBundle | null> {
  const scope = await deckRows(user.id, options.deckId);
  if (!scope) return null;
  const deckIds = scope.decks.map((deck) => deck.id);

  const cards = (
    await Promise.all(
      chunk(deckIds, 500).map((ids) =>
        prisma.card.findMany({
          where: { userId: user.id, deckId: { in: ids } },
          select: {
            id: true,
            noteId: true,
            deckId: true,
            ord: true,
            state: true,
            due: true,
            newPosition: true,
            interval: true,
            ease: true,
            reps: true,
            lapses: true,
            step: true,
            stability: true,
            difficulty: true,
            suspended: true,
            flag: true,
            ankiId: true,
            createdAt: true,
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        }),
      ),
    )
  ).flat();

  const noteIds = [...new Set(cards.map((card) => card.noteId))];
  const notes = (
    await Promise.all(
      chunk(noteIds).map((ids) =>
        prisma.note.findMany({
          where: { userId: user.id, id: { in: ids } },
          select: { id: true, noteTypeId: true, fields: true, tags: true, ankiGuid: true, createdAt: true, updatedAt: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        }),
      ),
    )
  ).flat();
  await ensureGuids(user.id, notes);

  const noteTypeIds = [...new Set(notes.map((note) => note.noteTypeId))];
  const noteTypes = await prisma.noteType.findMany({ where: { userId: user.id, id: { in: noteTypeIds } }, orderBy: { createdAt: "asc" } });
  await ensureNoteTypeIds(user.id, noteTypes);

  const configIds = [...new Set(scope.decks.map((deck) => deck.configId))];
  const configs = await prisma.deckConfig.findMany({ where: { userId: user.id, id: { in: configIds } }, orderBy: { createdAt: "asc" } });

  const deckAllocator = new IdAllocator();
  deckAllocator.reserve(DEFAULT_ANKI_ID);
  const configAnkiIds = new Map<string, bigint>();
  const configAllocator = new IdAllocator();
  configAllocator.reserve(DEFAULT_ANKI_ID);
  for (const config of configs) {
    configAnkiIds.set(config.id, config.isDefault ? DEFAULT_ANKI_ID : configAllocator.take(null, config.createdAt.getTime()));
  }
  const exportConfigs: ExportDeckConfig[] = configs.map((config) => ({
    ankiId: configAnkiIds.get(config.id)!,
    name: config.name,
    algorithm: config.algorithm,
    newPerDay: config.newPerDay,
    reviewsPerDay: config.reviewsPerDay,
    learningSteps: config.learningSteps,
    relearningSteps: config.relearningSteps,
    graduatingInterval: config.graduatingInterval,
    easyInterval: config.easyInterval,
    startingEase: config.startingEase,
    easyBonus: config.easyBonus,
    hardMultiplier: config.hardMultiplier,
    intervalModifier: config.intervalModifier,
    lapseMultiplier: config.lapseMultiplier,
    minLapseInterval: config.minLapseInterval,
    maxInterval: config.maxInterval,
    leechThreshold: config.leechThreshold,
    leechAction: config.leechAction,
    newCardOrder: config.newCardOrder,
    desiredRetention: config.desiredRetention,
    fsrsWeights: config.fsrsWeights,
  }));
  const configById = new Map(configs.map((config) => [config.id, config]));

  const deckAnkiIds = new Map<string, bigint>();
  const exportDecks: ExportDeck[] = scope.decks.map((deck) => {
    const ankiId = deck.ankiId === DEFAULT_ANKI_ID ? DEFAULT_ANKI_ID : deckAllocator.take(deck.ankiId, deck.createdAt.getTime());
    deckAnkiIds.set(deck.id, ankiId);
    return { ankiId, name: scope.fullName(deck.id), description: deck.description, configAnkiId: configAnkiIds.get(deck.configId) ?? DEFAULT_ANKI_ID };
  });

  const noteTypeById = new Map(noteTypes.map((noteType) => [noteType.id, noteType]));
  const exportNoteTypes: ExportNoteType[] = noteTypes.map((noteType) => ({
    ankiId: noteType.ankiId!,
    name: noteType.name,
    kind: noteType.kind,
    css: noteType.css,
    fields: noteType.fields as NoteTypeField[],
    templates: noteType.templates as NoteTypeTemplate[],
    sortFieldIdx: noteType.sortFieldIdx,
    latexPre: noteType.latexPre,
    latexPost: noteType.latexPost,
  }));

  const noteAllocator = new IdAllocator();
  const noteAnkiIds = new Map<string, bigint>();
  const exportNotes: ExportNote[] = notes.map((note) => {
    const ankiId = noteAllocator.take(null, note.createdAt.getTime());
    noteAnkiIds.set(note.id, ankiId);
    const noteType = noteTypeById.get(note.noteTypeId);
    const width = (noteType?.fields as NoteTypeField[] | undefined)?.length ?? note.fields.length;
    return {
      ankiId,
      guid: note.ankiGuid!,
      noteTypeAnkiId: noteType?.ankiId ?? DEFAULT_ANKI_ID,
      fields: Array.from({ length: width }, (_, index) => note.fields[index] ?? ""),
      tags: note.tags,
      modified: note.updatedAt,
    };
  });

  const cardAllocator = new IdAllocator();
  for (const card of cards) if (card.ankiId != null) cardAllocator.reserve(card.ankiId);
  const deckConfigByDeck = new Map(scope.decks.map((deck) => [deck.id, configById.get(deck.configId)]));
  const cardAnkiIds = new Map<string, bigint>();
  const exportCards: ExportCard[] = cards.map((card) => {
    const ankiId = card.ankiId ?? cardAllocator.take(null, card.createdAt.getTime());
    cardAnkiIds.set(card.id, ankiId);
    const config = deckConfigByDeck.get(card.deckId);
    const steps = card.state === "RELEARNING" ? config?.relearningSteps : config?.learningSteps;
    return {
      ankiId,
      noteAnkiId: noteAnkiIds.get(card.noteId)!,
      deckAnkiId: deckAnkiIds.get(card.deckId)!,
      ord: card.ord,
      state: card.state,
      due: card.due,
      newPosition: card.newPosition,
      interval: card.interval,
      ease: card.ease,
      reps: card.reps,
      lapses: card.lapses,
      step: card.step,
      stepCount: steps?.length ?? 0,
      stability: card.stability,
      difficulty: card.difficulty,
      suspended: card.suspended,
      flag: card.flag,
    };
  });

  const exportReviews: ExportReview[] = [];
  if (options.includeScheduling) {
    const reviewAllocator = new IdAllocator();
    const cardEase = new Map(cards.map((card) => [card.id, card.ease]));
    for (const ids of chunk(cards.map((card) => card.id))) {
      const logs = await prisma.reviewLog.findMany({
        where: { userId: user.id, cardId: { in: ids } },
        select: { cardId: true, rating: true, prevState: true, newState: true, prevInterval: true, newInterval: true, durationMs: true, reviewedAt: true, snapshot: true },
        orderBy: { reviewedAt: "asc" },
      });
      for (const log of logs) {
        const snapshot = log.snapshot as { ease?: number } | null;
        exportReviews.push({
          ankiId: reviewAllocator.take(null, log.reviewedAt.getTime()),
          cardAnkiId: cardAnkiIds.get(log.cardId)!,
          rating: log.rating,
          prevState: log.prevState,
          newState: log.newState,
          prevInterval: log.prevInterval,
          newInterval: log.newInterval,
          ease: typeof snapshot?.ease === "number" ? snapshot.ease : (cardEase.get(log.cardId) ?? 2500),
          durationMs: log.durationMs,
        });
      }
    }
  }

  const firstDeckByNote = new Map<string, string>();
  for (const card of cards) if (!firstDeckByNote.has(card.noteId)) firstDeckByNote.set(card.noteId, card.deckId);
  const text: TextExportNote[] = notes.map((note, index) => ({
    guid: note.ankiGuid!,
    noteTypeName: noteTypeById.get(note.noteTypeId)?.name ?? "",
    deckName: scope.fullName(firstDeckByNote.get(note.id) ?? ""),
    fields: exportNotes[index].fields,
    tags: note.tags,
  }));

  const media: ExportBundle["media"] = [];
  if (options.includeMedia) {
    const names = new Set<string>();
    for (const note of notes) for (const field of note.fields) mediaReferences(field, names);
    const templateText = noteTypes.map((noteType) => `${noteType.css}\n${JSON.stringify(noteType.templates)}`).join("\n");
    const underscored = await prisma.media.findMany({ where: { userId: user.id, name: { startsWith: "_" } }, select: { name: true } });
    for (const file of underscored) if (templateText.includes(file.name)) names.add(file.name);
    const rows = (
      await Promise.all(
        chunk([...names]).map((batch) =>
          prisma.media.findMany({ where: { userId: user.id, name: { in: batch } }, select: { name: true, path: true }, orderBy: { name: "asc" } }),
        ),
      )
    ).flat();
    rows.forEach((row, index) => media.push({ index, name: row.name, path: row.path }));
  }

  const window = dayWindow(user);
  return {
    name: scope.rootName ?? "Flashcards",
    input: {
      now: window.now,
      dayStart: window.start,
      dayEnd: window.end,
      includeScheduling: options.includeScheduling,
      noteTypes: exportNoteTypes,
      decks: exportDecks,
      deckConfigs: exportConfigs,
      notes: exportNotes,
      cards: exportCards,
      reviews: exportReviews,
    },
    text,
    media,
  };
}
