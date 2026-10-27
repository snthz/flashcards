import { describe, expect, it } from "vitest";
import { convertRevlog, lastReviewByCard, reviewLogId } from "./revlog";
import type { ParsedReview } from "./types";

const USER = "11111111-1111-4111-8111-111111111111";
const DAY = 86_400_000;
const start = 1_700_000_000_000;

function entry(id: number, overrides: Partial<ParsedReview>): ParsedReview {
  return { id: BigInt(id), cardAnkiId: 42n, ease: 3, interval: 0, lastInterval: 0, factor: 2500, timeMs: 4000, type: 0, ...overrides };
}

describe("convertRevlog", () => {
  it("maps a learning, review and lapse history to card states", () => {
    const reviews = convertRevlog(USER, [
      entry(start + 10 * DAY, { type: 1, ease: 1, interval: -600, lastInterval: 4 }),
      entry(start, { type: 0, ease: 3, interval: -600, lastInterval: 0 }),
      entry(start + 600_000, { type: 0, ease: 3, interval: 1, lastInterval: -600 }),
      entry(start + DAY, { type: 1, ease: 3, interval: 4, lastInterval: 1 }),
      entry(start + 10 * DAY + 600_000, { type: 2, ease: 3, interval: 1, lastInterval: 4 }),
    ]);
    expect(reviews.map((review) => `${review.prevState}>${review.newState}`)).toEqual([
      "NEW>LEARNING",
      "LEARNING>REVIEW",
      "REVIEW>REVIEW",
      "REVIEW>RELEARNING",
      "RELEARNING>REVIEW",
    ]);
    expect(reviews[3].rating).toBe(1);
    expect(reviews[2].elapsedDays).toBeCloseTo(1 - 600_000 / DAY);
    expect(reviews[0].reviewedAt.getTime()).toBe(start);
  });

  it("skips manual reschedules and entries without an answer", () => {
    const reviews = convertRevlog(USER, [entry(start, { type: 4, ease: 0 }), entry(start + 1, { type: 5, ease: 0 }), entry(start + 2, {})]);
    expect(reviews).toHaveLength(1);
  });

  it("uses stable ids so importing twice can skip duplicates", () => {
    expect(reviewLogId(USER, 42n, 7n)).toBe(reviewLogId(USER, 42n, 7n));
    expect(reviewLogId(USER, 42n, 7n)).not.toBe(reviewLogId(USER, 42n, 8n));
    expect(reviewLogId(USER, 42n, 7n)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("finds the latest review per card", () => {
    const latest = lastReviewByCard(convertRevlog(USER, [entry(start, {}), entry(start + DAY, { type: 1, lastInterval: 1, interval: 3 })]));
    expect(latest.get("42")?.getTime()).toBe(start + DAY);
  });
});
