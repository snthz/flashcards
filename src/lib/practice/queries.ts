import { prisma } from "@/lib/db";
import { getDeckSubtreeIds } from "@/lib/decks/queries";
import { extractItem, type NoteTypeShape } from "./extract";
import type { PracticeItem, PracticePeriod } from "./types";

const DAY = 86_400_000;
const MAX_ITEMS = 120;

function shape(noteType: { name: string; fields: unknown; templates: unknown }): NoteTypeShape {
  const fields = Array.isArray(noteType.fields) ? noteType.fields.map((field) => String((field as { name?: unknown })?.name ?? "")) : [];
  const templates = Array.isArray(noteType.templates) ? (noteType.templates as NoteTypeShape["templates"]) : [];
  return { name: noteType.name, fields, templates };
}

export async function practiceItems(userId: string, deckId: string | null, period: PracticePeriod): Promise<PracticeItem[]> {
  const deckIds = deckId ? await getDeckSubtreeIds(userId, deckId) : null;
  const since = period === "all" ? null : new Date(Date.now() - (period === "week" ? 7 : 30) * DAY);
  const cards = await prisma.card.findMany({
    where: {
      userId,
      reps: { gt: 0 },
      suspended: false,
      ...(deckIds ? { deckId: { in: deckIds } } : {}),
      ...(since ? { lastReview: { gte: since } } : {}),
    },
    orderBy: { lastReview: { sort: "desc", nulls: "last" } },
    take: 3000,
    select: { noteId: true, deck: { select: { name: true } } },
  });

  const decks = new Map<string, string>();
  for (const card of cards) {
    if (!decks.has(card.noteId)) decks.set(card.noteId, card.deck.name);
    if (decks.size >= MAX_ITEMS * 2) break;
  }
  if (decks.size === 0) return [];

  const notes = await prisma.note.findMany({
    where: { userId, id: { in: [...decks.keys()] }, noteType: { kind: "STANDARD" } },
    select: { id: true, fields: true, noteType: { select: { id: true, name: true, fields: true, templates: true } } },
  });
  const shapes = new Map<string, NoteTypeShape>();
  const byId = new Map(notes.map((note) => [note.id, note]));
  const items: PracticeItem[] = [];
  for (const [noteId, deckName] of decks) {
    const note = byId.get(noteId);
    if (!note) continue;
    let noteShape = shapes.get(note.noteType.id);
    if (!noteShape) {
      noteShape = shape(note.noteType);
      shapes.set(note.noteType.id, noteShape);
    }
    const item = extractItem(note.id, noteShape, note.fields, deckName);
    if (item) items.push(item);
    if (items.length >= MAX_ITEMS) break;
  }
  return items;
}
