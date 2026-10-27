"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { fsrsRetrievability } from "@/lib/scheduler/fsrs";
import { plainText } from "@/lib/anki/render";
import type { NoteTypeTemplate } from "@/lib/anki/types";
import type { CardState } from "@/lib/scheduler";
import { toSchedulable, toSchedulerConfig } from "@/lib/study/queue";

const HISTORY_LIMIT = 200;

export interface CardInfo {
  preview: string;
  deckName: string;
  noteTypeName: string;
  templateName: string;
  state: CardState;
  suspended: boolean;
  createdAt: string;
  due: string;
  interval: number;
  ease: number;
  stability: number | null;
  difficulty: number | null;
  retrievability: number | null;
  reps: number;
  lapses: number;
  totalMs: number;
  firstReview: string | null;
  lastReview: string | null;
  history: Array<{ at: string; rating: number; prevState: CardState; newInterval: number; durationMs: number }>;
}

export async function getCardInfo(cardId: string): Promise<CardInfo | null> {
  const user = await requireUser();
  const card = await prisma.card.findFirst({
    where: { id: cardId, userId: user.id },
    include: { note: { include: { noteType: true } }, deck: { include: { config: true } } },
  });
  if (!card) return null;
  const [logs, totals] = await Promise.all([
    prisma.reviewLog.findMany({
      where: { cardId: card.id, userId: user.id },
      orderBy: { reviewedAt: "desc" },
      take: HISTORY_LIMIT,
      select: { reviewedAt: true, rating: true, prevState: true, newInterval: true, durationMs: true },
    }),
    prisma.reviewLog.aggregate({ where: { cardId: card.id, userId: user.id }, _sum: { durationMs: true }, _min: { reviewedAt: true } }),
  ]);
  const templates = card.note.noteType.templates as NoteTypeTemplate[];
  const retrievability =
    card.stability != null && card.state !== "NEW" ? fsrsRetrievability(toSchedulable(card), toSchedulerConfig(card.deck.config), new Date()) : null;
  return {
    preview: plainText(card.note.sortField || card.note.fields[0] || "", 160),
    deckName: card.deck.name,
    noteTypeName: card.note.noteType.name,
    templateName: card.note.noteType.kind === "CLOZE" ? `Cloze ${card.ord + 1}` : (templates[card.ord]?.name ?? ""),
    state: card.state,
    suspended: card.suspended,
    createdAt: card.createdAt.toISOString(),
    due: card.due.toISOString(),
    interval: card.interval,
    ease: card.ease,
    stability: card.stability,
    difficulty: card.difficulty,
    retrievability: typeof retrievability === "number" ? retrievability : null,
    reps: card.reps,
    lapses: card.lapses,
    totalMs: totals._sum.durationMs ?? 0,
    firstReview: totals._min.reviewedAt?.toISOString() ?? null,
    lastReview: card.lastReview?.toISOString() ?? null,
    history: logs.map((log) => ({
      at: log.reviewedAt.toISOString(),
      rating: log.rating,
      prevState: log.prevState,
      newInterval: log.newInterval,
      durationMs: log.durationMs,
    })),
  };
}
