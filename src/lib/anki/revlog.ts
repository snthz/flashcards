import { createHash } from "node:crypto";
import type { ParsedReview } from "./types";

type CardState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";

const MAX_DURATION_MS = 60_000;
const DAY_MS = 86_400_000;

export interface ImportedReview {
  id: string;
  cardAnkiId: bigint;
  rating: number;
  prevState: CardState;
  newState: CardState;
  prevInterval: number;
  newInterval: number;
  elapsedDays: number;
  durationMs: number;
  reviewedAt: Date;
}

export function reviewLogId(userId: string, cardAnkiId: bigint, revlogId: bigint) {
  const hex = createHash("sha1").update(`${userId}:${cardAnkiId}:${revlogId}`).digest("hex");
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function previousState(entry: ParsedReview): CardState {
  if (entry.type === 1) return "REVIEW";
  if (entry.type === 2) return "RELEARNING";
  if (entry.type === 3) return entry.lastInterval > 0 ? "REVIEW" : "LEARNING";
  return entry.lastInterval === 0 ? "NEW" : "LEARNING";
}

export function convertRevlog(userId: string, entries: ParsedReview[]): ImportedReview[] {
  const byCard = new Map<string, ParsedReview[]>();
  for (const entry of entries) {
    if (entry.ease < 1 || entry.ease > 4 || entry.type > 3) continue;
    const key = entry.cardAnkiId.toString();
    const list = byCard.get(key) ?? [];
    list.push(entry);
    byCard.set(key, list);
  }
  const reviews: ImportedReview[] = [];
  for (const list of byCard.values()) {
    list.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    list.forEach((entry, index) => {
      const prevState = previousState(entry);
      const newState: CardState = entry.interval > 0 ? "REVIEW" : prevState === "REVIEW" || prevState === "RELEARNING" ? "RELEARNING" : "LEARNING";
      const previous = list[index - 1];
      reviews.push({
        id: reviewLogId(userId, entry.cardAnkiId, entry.id),
        cardAnkiId: entry.cardAnkiId,
        rating: entry.ease,
        prevState,
        newState,
        prevInterval: Math.max(0, entry.lastInterval),
        newInterval: Math.max(0, entry.interval),
        elapsedDays: previous ? Number(entry.id - previous.id) / DAY_MS : 0,
        durationMs: Math.max(0, Math.min(MAX_DURATION_MS, Math.round(entry.timeMs))),
        reviewedAt: new Date(Number(entry.id)),
      });
    });
  }
  return reviews;
}

export function lastReviewByCard(reviews: ImportedReview[]) {
  const latest = new Map<string, Date>();
  for (const review of reviews) {
    const key = review.cardAnkiId.toString();
    const current = latest.get(key);
    if (!current || review.reviewedAt > current) latest.set(key, review.reviewedAt);
  }
  return latest;
}
