import { cache } from "react";
import { prisma } from "@/lib/db";
import { dayStart, nextDayStart } from "@/lib/scheduler";
import type { CurrentUser } from "@/lib/auth/user";
import { getLocale } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n/config";
import { toDeckDescription } from "./description";

export interface DeckCounts {
  fresh: number;
  learning: number;
  review: number;
  total: number;
}

export interface DeckNode {
  id: string;
  name: string;
  fullName: string;
  description: string;
  parentId: string | null;
  configId: string;
  depth: number;
  counts: DeckCounts;
  children: DeckNode[];
}

interface DeckRow {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  configId: string;
  config: { newPerDay: number; reviewsPerDay: number };
}

export interface DayWindow {
  now: Date;
  start: Date;
  end: Date;
}

export function dayWindow(user: Pick<CurrentUser, "timezone" | "dayStartHour">, now = new Date()): DayWindow {
  return {
    now,
    start: dayStart(now, user.timezone, user.dayStartHour),
    end: nextDayStart(now, user.timezone, user.dayStartHour),
  };
}

async function countsByDeck(userId: string, window: DayWindow) {
  const [fresh, learning, review, totals, studiedNew, studiedReview] = await Promise.all([
    prisma.card.groupBy({
      by: ["deckId"],
      where: { userId, state: "NEW", suspended: false, OR: [{ buriedUntil: null }, { buriedUntil: { lt: window.now } }] },
      _count: { _all: true },
    }),
    prisma.card.groupBy({
      by: ["deckId"],
      where: {
        userId,
        state: { in: ["LEARNING", "RELEARNING"] },
        suspended: false,
        due: { lt: window.end },
        OR: [{ buriedUntil: null }, { buriedUntil: { lt: window.now } }],
      },
      _count: { _all: true },
    }),
    prisma.card.groupBy({
      by: ["deckId"],
      where: {
        userId,
        state: "REVIEW",
        suspended: false,
        due: { lt: window.end },
        OR: [{ buriedUntil: null }, { buriedUntil: { lt: window.now } }],
      },
      _count: { _all: true },
    }),
    prisma.card.groupBy({ by: ["deckId"], where: { userId }, _count: { _all: true } }),
    prisma.reviewLog.groupBy({
      by: ["deckId"],
      where: { userId, reviewedAt: { gte: window.start }, prevState: "NEW" },
      _count: { _all: true },
    }),
    prisma.reviewLog.groupBy({
      by: ["deckId"],
      where: { userId, reviewedAt: { gte: window.start }, prevState: "REVIEW" },
      _count: { _all: true },
    }),
  ]);
  const toMap = (rows: Array<{ deckId: string; _count: { _all: number } }>) =>
    new Map(rows.map((r) => [r.deckId, r._count._all]));
  return {
    fresh: toMap(fresh),
    learning: toMap(learning),
    review: toMap(review),
    totals: toMap(totals),
    studiedNew: toMap(studiedNew),
    studiedReview: toMap(studiedReview),
  };
}

function buildTree(rows: DeckRow[], counts: Awaited<ReturnType<typeof countsByDeck>>, collator: Intl.Collator): DeckNode[] {
  const byParent = new Map<string | null, DeckRow[]>();
  for (const row of rows) {
    const list = byParent.get(row.parentId) ?? [];
    list.push(row);
    byParent.set(row.parentId, list);
  }
  const sortRows = (list: DeckRow[]) => list.sort((a, b) => collator.compare(a.name, b.name));

  const build = (row: DeckRow, depth: number, prefix: string): { node: DeckNode; studiedNew: number; studiedReview: number } => {
    const fullName = prefix ? `${prefix}::${row.name}` : row.name;
    const children = sortRows(byParent.get(row.id) ?? []).map((child) => build(child, depth + 1, fullName));
    const ownNew = counts.fresh.get(row.id) ?? 0;
    const ownLearning = counts.learning.get(row.id) ?? 0;
    const ownReview = counts.review.get(row.id) ?? 0;
    const ownTotal = counts.totals.get(row.id) ?? 0;
    const studiedNew = (counts.studiedNew.get(row.id) ?? 0) + children.reduce((sum, c) => sum + c.studiedNew, 0);
    const studiedReview = (counts.studiedReview.get(row.id) ?? 0) + children.reduce((sum, c) => sum + c.studiedReview, 0);
    const subtreeNew = ownNew + children.reduce((sum, c) => sum + c.node.counts.fresh, 0);
    const subtreeReview = ownReview + children.reduce((sum, c) => sum + c.node.counts.review, 0);
    const newLimit = Math.max(0, row.config.newPerDay - studiedNew);
    const reviewLimit = Math.max(0, row.config.reviewsPerDay - studiedReview);
    const node: DeckNode = {
      id: row.id,
      name: row.name,
      fullName,
      description: toDeckDescription(row.description),
      parentId: row.parentId,
      configId: row.configId,
      depth,
      counts: {
        fresh: Math.min(subtreeNew, newLimit),
        learning: ownLearning + children.reduce((sum, c) => sum + c.node.counts.learning, 0),
        review: Math.min(subtreeReview, reviewLimit),
        total: ownTotal + children.reduce((sum, c) => sum + c.node.counts.total, 0),
      },
      children: children.map((c) => c.node),
    };
    return { node, studiedNew, studiedReview };
  };

  return sortRows(byParent.get(null) ?? []).map((row) => build(row, 0, "").node);
}

export const getDeckTree = cache(async (user: CurrentUser): Promise<DeckNode[]> => {
  const window = dayWindow(user);
  const [rows, counts, locale] = await Promise.all([
    prisma.deck.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        description: true,
        parentId: true,
        configId: true,
        config: { select: { newPerDay: true, reviewsPerDay: true } },
      },
    }),
    countsByDeck(user.id, window),
    getLocale(),
  ]);
  return buildTree(rows, counts, new Intl.Collator(intlLocale(locale)));
});

export function findNode(nodes: DeckNode[], id: string): DeckNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

export function flattenTree(nodes: DeckNode[]): DeckNode[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}

export function subtreeIds(node: DeckNode): string[] {
  return [node.id, ...node.children.flatMap(subtreeIds)];
}

export async function getDeckSubtreeIds(userId: string, deckId: string): Promise<string[]> {
  const rows = await prisma.deck.findMany({ where: { userId }, select: { id: true, parentId: true } });
  const byParent = new Map<string | null, string[]>();
  for (const row of rows) {
    const list = byParent.get(row.parentId) ?? [];
    list.push(row.id);
    byParent.set(row.parentId, list);
  }
  const ids: string[] = [];
  const stack = [deckId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    ids.push(current);
    for (const child of byParent.get(current) ?? []) stack.push(child);
  }
  return ids;
}
