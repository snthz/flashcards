import { describe, expect, it } from "vitest";
import { longTermReviews, reviewHistories, trainingItems, type ReviewEntry } from "./history";

const at = (iso: string) => new Date(iso);

describe("reviewHistories", () => {
  it("counts days with the user's day boundary and keeps same-day reviews at zero", () => {
    const entries: ReviewEntry[] = [
      { cardId: "a", rating: 3, prevState: "NEW", reviewedAt: at("2026-10-01T15:00:00Z") },
      { cardId: "a", rating: 3, prevState: "LEARNING", reviewedAt: at("2026-10-01T15:10:00Z") },
      { cardId: "a", rating: 3, prevState: "REVIEW", reviewedAt: at("2026-10-03T03:00:00Z") },
      { cardId: "a", rating: 1, prevState: "REVIEW", reviewedAt: at("2026-10-10T12:00:00Z") },
    ];
    expect(reviewHistories(entries, "UTC", 4)).toEqual([
      [
        { rating: 3, deltaT: 0 },
        { rating: 3, deltaT: 0 },
        { rating: 3, deltaT: 1 },
        { rating: 1, deltaT: 8 },
      ],
    ]);
  });

  it("starts from the last time a card was new and skips cards without a learning start", () => {
    const entries: ReviewEntry[] = [
      { cardId: "a", rating: 3, prevState: "NEW", reviewedAt: at("2026-09-01T12:00:00Z") },
      { cardId: "a", rating: 3, prevState: "REVIEW", reviewedAt: at("2026-09-05T12:00:00Z") },
      { cardId: "a", rating: 4, prevState: "NEW", reviewedAt: at("2026-09-10T12:00:00Z") },
      { cardId: "a", rating: 3, prevState: "REVIEW", reviewedAt: at("2026-09-14T12:00:00Z") },
      { cardId: "imported", rating: 3, prevState: "REVIEW", reviewedAt: at("2026-09-14T12:00:00Z") },
    ];
    expect(reviewHistories(entries, "UTC", 4)).toEqual([
      [
        { rating: 4, deltaT: 0 },
        { rating: 3, deltaT: 4 },
      ],
    ]);
  });

  it("only counts reviews on later days as long-term", () => {
    expect(longTermReviews([[{ deltaT: 0 }, { deltaT: 0 }, { deltaT: 2 }], [{ deltaT: 0 }, { deltaT: 5 }]])).toBe(2);
  });

  it("keeps only training items that reach a review on a later day", () => {
    const items = trainingItems([
      [
        { rating: 3, deltaT: 0 },
        { rating: 3, deltaT: 0 },
        { rating: 3, deltaT: 2 },
        { rating: 1, deltaT: 0 },
      ],
      [
        { rating: 3, deltaT: 0 },
        { rating: 4, deltaT: 0 },
      ],
      [
        { rating: 9, deltaT: 0 },
        { rating: 3, deltaT: 4 },
      ],
    ]);
    expect(items.map((item) => item.length)).toEqual([3, 4]);
    expect(items.every((item) => item.slice(1).some((review) => review.deltaT > 0))).toBe(true);
  });
});
