import { prisma } from "@/lib/db";
import { longTermReviews, reviewHistories, trainingItems, type ReviewEntry } from "./history";
import { trainInChildProcess } from "./runner";

export const MIN_REVIEWS = 64;
const MIN_IMPROVEMENT = 0.0005;
const CHUNK = 5000;

export interface Metrics {
  logLoss: number;
  rmse: number;
}

export type OptimizeResult =
  | { status: "not_enough"; reviews: number; required: number }
  | { status: "optimal" | "updated"; reviews: number; weights: number[]; before: Metrics; after: Metrics };

async function loadEntries(userId: string, configId: string) {
  const decks = await prisma.deck.findMany({ where: { userId, configId }, select: { id: true } });
  const entries: ReviewEntry[] = [];
  const deckIds = decks.map((deck) => deck.id);
  for (let i = 0; i < deckIds.length; i += 500) {
    let cursor: string | undefined;
    for (;;) {
      const rows = await prisma.reviewLog.findMany({
        where: { userId, card: { deckId: { in: deckIds.slice(i, i + 500) } } },
        select: { id: true, cardId: true, rating: true, prevState: true, reviewedAt: true },
        orderBy: { id: "asc" },
        take: CHUNK,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      });
      entries.push(...rows);
      if (rows.length < CHUNK) break;
      cursor = rows[rows.length - 1].id;
    }
  }
  return entries;
}

function round(weights: number[]) {
  return weights.map((weight) => Math.round(weight * 10_000) / 10_000);
}

export async function optimizeParameters(user: { id: string; timezone: string; dayStartHour: number }, configId: string): Promise<OptimizeResult | null> {
  const config = await prisma.deckConfig.findFirst({ where: { id: configId, userId: user.id }, select: { fsrsWeights: true, relearningSteps: true } });
  if (!config) return null;
  const histories = reviewHistories(await loadEntries(user.id, configId), user.timezone, user.dayStartHour);
  const reviews = longTermReviews(histories);
  if (reviews < MIN_REVIEWS) return { status: "not_enough", reviews, required: MIN_REVIEWS };

  const items = trainingItems(histories);
  const current = config.fsrsWeights.length >= 17 ? config.fsrsWeights : null;
  const output = await trainInChildProcess(items, current, config.relearningSteps.length);
  if ("error" in output) {
    if (/NotEnoughData/i.test(output.error)) return { status: "not_enough", reviews, required: MIN_REVIEWS };
    throw new Error(output.error);
  }
  const weights = round(output.weights);
  const { before, after } = output;
  if (after.rmse > before.rmse - MIN_IMPROVEMENT) return { status: "optimal", reviews, weights: config.fsrsWeights, before, after: before };
  await prisma.deckConfig.update({ where: { id: configId }, data: { fsrsWeights: weights } });
  return { status: "updated", reviews, weights, before, after };
}
