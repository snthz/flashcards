"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, type CurrentUser } from "@/lib/auth/user";
import { getLocale } from "@/lib/i18n/server";
import { dayWindow } from "@/lib/decks/queries";
import { schedule, type Rating } from "@/lib/scheduler";
import { findCard, getStudyState as readStudyState, toSchedulable, toSchedulerConfig } from "./queue";
import type { StudyState } from "./types";

const MAX_DURATION_MS = 60_000;

async function getStudyState(user: CurrentUser, deckId: string) {
  return readStudyState(user, deckId, await getLocale());
}

function isRating(value: number): value is Rating {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

export async function loadStudyState(deckId: string): Promise<StudyState | null> {
  const user = await requireUser();
  return getStudyState(user, deckId);
}

export async function answerCard(deckId: string, cardId: string, rating: number, durationMs: number): Promise<StudyState | null> {
  const user = await requireUser();
  if (!isRating(rating)) return getStudyState(user, deckId);
  const card = await findCard(cardId, user.id);
  if (!card || card.suspended) return getStudyState(user, deckId);

  const window = dayWindow(user);
  const config = toSchedulerConfig(card.deck.config);
  const before = toSchedulable(card);
  const { card: after, leech } = schedule(before, rating, config, { now: window.now, dayStart: window.start });
  const elapsedDays = before.lastReview ? (window.now.getTime() - before.lastReview.getTime()) / 86_400_000 : 0;

  await prisma.$transaction(async (tx) => {
    await tx.card.update({
      where: { id: card.id },
      data: {
        state: after.state,
        due: after.due,
        interval: after.interval,
        ease: after.ease,
        reps: after.reps,
        lapses: after.lapses,
        step: after.step,
        stability: after.stability,
        difficulty: after.difficulty,
        lastReview: after.lastReview,
        suspended: leech && card.deck.config.leechAction === "SUSPEND" ? true : card.suspended,
      },
    });
    await tx.reviewLog.create({
      data: {
        userId: user.id,
        cardId: card.id,
        deckId: card.deckId,
        rating,
        prevState: before.state,
        newState: after.state,
        prevInterval: before.interval,
        newInterval: after.interval,
        elapsedDays,
        durationMs: Math.max(0, Math.min(MAX_DURATION_MS, Math.round(durationMs))),
        reviewedAt: window.now,
        snapshot: {
          state: before.state,
          due: before.due.toISOString(),
          interval: before.interval,
          ease: before.ease,
          reps: before.reps,
          lapses: before.lapses,
          step: before.step,
          stability: before.stability,
          difficulty: before.difficulty,
          lastReview: before.lastReview?.toISOString() ?? null,
          suspended: card.suspended,
          buriedSiblings: [],
        },
      },
    });
    if (leech && !card.note.tags.includes("leech")) {
      await tx.note.update({ where: { id: card.noteId }, data: { tags: [...card.note.tags, "leech"] } });
    }
    if (before.state === "NEW" || before.state === "REVIEW") {
      await tx.card.updateMany({
        where: {
          noteId: card.noteId,
          id: { not: card.id },
          state: { in: ["NEW", "REVIEW"] },
          suspended: false,
          OR: [{ buriedUntil: null }, { buriedUntil: { lt: window.now } }],
        },
        data: { buriedUntil: window.end },
      });
    }
  });

  return getStudyState(user, deckId);
}

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

export async function undoLastReview(deckId: string): Promise<StudyState | null> {
  const user = await requireUser();
  const log = await prisma.reviewLog.findFirst({
    where: { userId: user.id },
    orderBy: { reviewedAt: "desc" },
  });
  if (!log) return getStudyState(user, deckId);
  const snapshot = log.snapshot as unknown as Snapshot;
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
  return getStudyState(user, deckId);
}

export async function buryCard(deckId: string, cardId: string): Promise<StudyState | null> {
  const user = await requireUser();
  const window = dayWindow(user);
  await prisma.card.updateMany({ where: { id: cardId, userId: user.id }, data: { buriedUntil: window.end } });
  return getStudyState(user, deckId);
}

export async function suspendCard(deckId: string, cardId: string): Promise<StudyState | null> {
  const user = await requireUser();
  await prisma.card.updateMany({ where: { id: cardId, userId: user.id }, data: { suspended: true } });
  revalidatePath("/browse");
  return getStudyState(user, deckId);
}

export async function flagCard(deckId: string, cardId: string, flag: number): Promise<StudyState | null> {
  const user = await requireUser();
  await prisma.card.updateMany({ where: { id: cardId, userId: user.id }, data: { flag: Math.max(0, Math.min(7, Math.round(flag))) } });
  return getStudyState(user, deckId);
}
