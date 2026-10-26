import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/user";
import { dayWindow } from "@/lib/decks/queries";
import { reviewOutcome } from "./engine";
import { findCard, toSchedulable, toSchedulerConfig } from "./queue";
import type { OpResult, StudyOp } from "./types";

const MAX_DURATION_MS = 60_000;
const MAX_AGE_MS = 30 * 86_400_000;
const MAX_SKEW_MS = 5 * 60_000;

function opTime(op: StudyOp, now: Date) {
  const at = new Date(op.at);
  if (Number.isNaN(at.getTime()) || at.getTime() < now.getTime() - MAX_AGE_MS) return null;
  return at.getTime() > now.getTime() + MAX_SKEW_MS ? now : at;
}

async function applyReview(user: CurrentUser, op: Extract<StudyOp, { kind: "review" }>, at: Date): Promise<OpResult> {
  const existing = await prisma.reviewLog.findUnique({ where: { id: op.id }, select: { userId: true } });
  if (existing) return existing.userId === user.id ? "duplicate" : "invalid";
  const card = await findCard(op.cardId, user.id);
  if (!card) return "missing";
  if (card.suspended) return "stale";
  if (card.lastReview && card.lastReview.getTime() > at.getTime()) return "stale";

  const window = dayWindow(user, at);
  const config = toSchedulerConfig(card.deck.config);
  const before = toSchedulable(card);
  const { card: after, leech } = reviewOutcome(before, op.rating, { ...config, leechAction: card.deck.config.leechAction }, at, window.start, op.id);
  const elapsedDays = before.lastReview ? (at.getTime() - before.lastReview.getTime()) / 86_400_000 : 0;

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
        id: op.id,
        userId: user.id,
        cardId: card.id,
        deckId: card.deckId,
        rating: op.rating,
        prevState: before.state,
        newState: after.state,
        prevInterval: before.interval,
        newInterval: after.interval,
        elapsedDays,
        durationMs: Math.max(0, Math.min(MAX_DURATION_MS, Math.round(op.durationMs))),
        reviewedAt: at,
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
          OR: [{ buriedUntil: null }, { buriedUntil: { lt: at } }],
        },
        data: { buriedUntil: window.end },
      });
    }
  });
  return "applied";
}

async function applyOne(user: CurrentUser, op: StudyOp, now: Date): Promise<OpResult> {
  if (op.userId !== user.id) return "invalid";
  const at = opTime(op, now);
  if (!at) return "invalid";
  if (op.kind === "review") return applyReview(user, op, at);
  const data =
    op.kind === "bury"
      ? { buriedUntil: dayWindow(user, at).end }
      : op.kind === "suspend"
        ? { suspended: true }
        : { flag: Math.max(0, Math.min(7, Math.round(op.flag))) };
  const updated = await prisma.card.updateMany({ where: { id: op.cardId, userId: user.id }, data });
  return updated.count > 0 ? "applied" : "missing";
}

export async function applyStudyOps(user: CurrentUser, ops: StudyOp[]) {
  const now = new Date();
  const ordered = [...ops].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const results: Array<{ id: string; status: OpResult }> = [];
  for (const op of ordered) {
    try {
      results.push({ id: op.id, status: await applyOne(user, op, now) });
    } catch (error) {
      console.error("[study] failed to apply op", op.id, error);
      results.push({ id: op.id, status: "error" });
    }
  }
  return results;
}
