"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { getLocale } from "@/lib/i18n/server";
import { buildStudyPack } from "./queue";
import type { StudyPack } from "./types";

interface Snapshot {
  state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  due: string;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  step: number;
  stability: number | null;
  difficulty: number | null;
  lastReview: string | null;
  suspended: boolean;
}

export interface UndoResult {
  undoneId: string | null;
  cardId: string | null;
  pack: StudyPack | null;
}

export async function undoLatestReview(deckId: string): Promise<UndoResult> {
  const user = await requireUser();
  const log = await prisma.reviewLog.findFirst({
    where: { userId: user.id },
    orderBy: { reviewedAt: "desc" },
  });
  const snapshot = log?.snapshot as unknown as Snapshot | null;
  if (!log || !snapshot?.state) {
    const pack = await buildStudyPack(user, deckId, await getLocale());
    return { undoneId: null, cardId: null, pack };
  }
  await prisma.$transaction([
    prisma.card.update({
      where: { id: log.cardId },
      data: {
        state: snapshot.state,
        due: new Date(snapshot.due),
        interval: snapshot.interval,
        ease: snapshot.ease,
        reps: snapshot.reps,
        lapses: snapshot.lapses,
        step: snapshot.step,
        stability: snapshot.stability,
        difficulty: snapshot.difficulty,
        lastReview: snapshot.lastReview ? new Date(snapshot.lastReview) : null,
        suspended: snapshot.suspended,
        buriedUntil: null,
      },
    }),
    prisma.reviewLog.delete({ where: { id: log.id } }),
  ]);
  const pack = await buildStudyPack(user, deckId, await getLocale());
  return { undoneId: log.id, cardId: log.cardId, pack };
}
