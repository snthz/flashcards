import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { CurrentUser } from "@/lib/auth/user";
import { flattenTree, getDeckSubtreeIds, getDeckTree } from "@/lib/decks/queries";
import type { BrowseQuery } from "@/lib/validation/note";
import { getMessages } from "@/lib/i18n/server";

export const BROWSE_PAGE_SIZE = 50;

export async function getDeckOptions(user: CurrentUser) {
  const tree = await getDeckTree(user);
  return flattenTree(tree).map((node) => ({ id: node.id, name: node.fullName }));
}

export async function getNoteTypeOptions(userId: string) {
  return prisma.noteType.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, kind: true, fields: true },
  });
}

export interface BrowseRow {
  id: string;
  noteId: string;
  preview: string;
  deckName: string;
  state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  due: string;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  suspended: boolean;
  buried: boolean;
  flag: number;
  tags: string[];
}

export async function searchCards(user: CurrentUser, query: BrowseQuery) {
  const where: Prisma.CardWhereInput = { userId: user.id };
  const now = new Date();
  if (query.deck) where.deckId = { in: await getDeckSubtreeIds(user.id, query.deck) };
  if (query.state === "SUSPENDED") where.suspended = true;
  else if (query.state === "BURIED") where.buriedUntil = { gt: now };
  else if (query.state === "FLAGGED") where.flag = { gt: 0 };
  else if (query.state) where.state = query.state;
  if (query.q) {
    const term = query.q;
    where.OR = [
      { note: { sortField: { contains: term, mode: "insensitive" } } },
      { note: { tags: { has: term } } },
      { note: { fields: { has: term } } },
    ];
  }
  const [total, cards, decks, t] = await Promise.all([
    prisma.card.count({ where }),
    prisma.card.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { ord: "asc" }],
      skip: (query.page - 1) * BROWSE_PAGE_SIZE,
      take: BROWSE_PAGE_SIZE,
      select: {
        id: true,
        noteId: true,
        deckId: true,
        state: true,
        due: true,
        interval: true,
        ease: true,
        reps: true,
        lapses: true,
        suspended: true,
        buriedUntil: true,
        flag: true,
        note: { select: { sortField: true, tags: true } },
      },
    }),
    getDeckOptions(user),
    getMessages(),
  ]);
  const deckNames = new Map(decks.map((d) => [d.id, d.name]));
  const rows: BrowseRow[] = cards.map((card) => ({
    id: card.id,
    noteId: card.noteId,
    preview: card.note.sortField || t.notes.emptyPreview,
    deckName: deckNames.get(card.deckId) ?? "",
    state: card.state,
    due: card.due.toISOString(),
    interval: card.interval,
    ease: card.ease,
    reps: card.reps,
    lapses: card.lapses,
    suspended: card.suspended,
    buried: Boolean(card.buriedUntil && card.buriedUntil > now),
    flag: card.flag,
    tags: card.note.tags,
  }));
  return { rows, total, pages: Math.max(1, Math.ceil(total / BROWSE_PAGE_SIZE)), decks };
}
