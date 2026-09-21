import { describe, expect, it } from "vitest";
import { scheduleSm2 } from "./sm2";
import type { SchedulableCard, SchedulerConfig, SchedulerContext } from "./types";

const config: SchedulerConfig = {
  algorithm: "SM2",
  learningSteps: [1, 10],
  relearningSteps: [10],
  graduatingInterval: 1,
  easyInterval: 4,
  startingEase: 2500,
  easyBonus: 1.3,
  hardMultiplier: 1.2,
  intervalModifier: 1,
  lapseMultiplier: 0,
  minLapseInterval: 1,
  maxInterval: 36500,
  leechThreshold: 8,
  desiredRetention: 0.9,
  fsrsWeights: [],
};

const now = new Date("2026-03-10T15:00:00Z");
const dayStart = new Date("2026-03-10T04:00:00Z");
const ctx: SchedulerContext = { now, dayStart, random: () => 0.5 };

function newCard(overrides: Partial<SchedulableCard> = {}): SchedulableCard {
  return {
    state: "NEW",
    due: now,
    interval: 0,
    ease: 2500,
    reps: 0,
    lapses: 0,
    step: 0,
    stability: null,
    difficulty: null,
    lastReview: null,
    ...overrides,
  };
}

function reviewCard(interval: number, ease = 2500, lapses = 0): SchedulableCard {
  return newCard({
    state: "REVIEW",
    interval,
    ease,
    lapses,
    reps: 5,
    lastReview: new Date(now.getTime() - interval * 86_400_000),
  });
}

describe("scheduleSm2 learning", () => {
  it("moves a new card to the first learning step on again", () => {
    const { card } = scheduleSm2(newCard(), 1, config, ctx);
    expect(card.state).toBe("LEARNING");
    expect(card.step).toBe(0);
    expect(card.due.getTime()).toBe(now.getTime() + 60_000);
  });

  it("advances to the next step on good", () => {
    const { card } = scheduleSm2(newCard(), 3, config, ctx);
    expect(card.state).toBe("LEARNING");
    expect(card.step).toBe(1);
    expect(card.due.getTime()).toBe(now.getTime() + 10 * 60_000);
  });

  it("graduates after the last step", () => {
    const { card } = scheduleSm2(newCard({ state: "LEARNING", step: 1 }), 3, config, ctx);
    expect(card.state).toBe("REVIEW");
    expect(card.interval).toBe(1);
    expect(card.due.getTime()).toBe(dayStart.getTime() + 86_400_000);
  });

  it("graduates immediately with the easy interval", () => {
    const { card } = scheduleSm2(newCard(), 4, config, ctx);
    expect(card.state).toBe("REVIEW");
    expect(card.interval).toBe(4);
  });

  it("uses the average of the first two steps on hard", () => {
    const { card } = scheduleSm2(newCard(), 2, config, ctx);
    expect(card.due.getTime()).toBe(now.getTime() + 5.5 * 60_000);
  });
});

describe("scheduleSm2 review", () => {
  it("multiplies the interval by the ease on good", () => {
    const { card } = scheduleSm2(reviewCard(10), 3, config, ctx);
    expect(card.interval).toBe(25);
    expect(card.ease).toBe(2500);
  });

  it("applies the hard multiplier and lowers ease", () => {
    const { card } = scheduleSm2(reviewCard(10), 2, config, ctx);
    expect(card.interval).toBe(12);
    expect(card.ease).toBe(2350);
  });

  it("applies the easy bonus and raises ease", () => {
    const { card } = scheduleSm2(reviewCard(10), 4, config, ctx);
    expect(card.interval).toBe(33);
    expect(card.ease).toBe(2650);
  });

  it("lapses into relearning on again", () => {
    const { card, leech } = scheduleSm2(reviewCard(10), 1, config, ctx);
    expect(card.state).toBe("RELEARNING");
    expect(card.lapses).toBe(1);
    expect(card.ease).toBe(2300);
    expect(card.interval).toBe(1);
    expect(card.due.getTime()).toBe(now.getTime() + 10 * 60_000);
    expect(leech).toBe(false);
  });

  it("flags a leech at the threshold", () => {
    const { leech } = scheduleSm2(reviewCard(10, 2500, 7), 1, config, ctx);
    expect(leech).toBe(true);
  });

  it("never drops ease below 1300", () => {
    const { card } = scheduleSm2(reviewCard(10, 1300), 1, config, ctx);
    expect(card.ease).toBe(1300);
  });

  it("respects the maximum interval", () => {
    const { card } = scheduleSm2(reviewCard(100), 4, { ...config, maxInterval: 120 }, ctx);
    expect(card.interval).toBe(120);
  });

  it("gives overdue cards credit on good", () => {
    const card = reviewCard(10);
    card.lastReview = new Date(now.getTime() - 20 * 86_400_000);
    const result = scheduleSm2(card, 3, config, ctx).card;
    expect(result.interval).toBe(38);
  });
});

describe("scheduleSm2 relearning", () => {
  it("returns to review after the relearning step", () => {
    const card = newCard({ state: "RELEARNING", interval: 1, ease: 2300, lapses: 1, step: 0 });
    const result = scheduleSm2(card, 3, config, ctx).card;
    expect(result.state).toBe("REVIEW");
    expect(result.interval).toBe(1);
  });
});
