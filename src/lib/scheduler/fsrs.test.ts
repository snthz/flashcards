import { describe, expect, it } from "vitest";
import { scheduleFsrs } from "./fsrs";
import type { SchedulableCard, SchedulerConfig, SchedulerContext } from "./types";

const config: SchedulerConfig = {
  algorithm: "FSRS",
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
const ctx: SchedulerContext = { now, dayStart };

const fresh: SchedulableCard = {
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
};

describe("scheduleFsrs", () => {
  it("puts a new card into learning on again", () => {
    const { card } = scheduleFsrs(fresh, 1, config, ctx);
    expect(card.state).toBe("LEARNING");
    expect(card.stability).toBeGreaterThan(0);
    expect(card.difficulty).toBeGreaterThan(0);
    expect(card.due.getTime()).toBeGreaterThan(now.getTime());
  });

  it("graduates a new card to review on easy", () => {
    const { card } = scheduleFsrs(fresh, 4, config, ctx);
    expect(card.state).toBe("REVIEW");
    expect(card.interval).toBeGreaterThanOrEqual(1);
    expect(card.due.getTime()).toBe(dayStart.getTime() + card.interval * 86_400_000);
  });

  it("grows the interval on good for a review card", () => {
    const review: SchedulableCard = {
      ...fresh,
      state: "REVIEW",
      interval: 10,
      stability: 10,
      difficulty: 5,
      reps: 3,
      lastReview: new Date(now.getTime() - 10 * 86_400_000),
    };
    const { card } = scheduleFsrs(review, 3, config, ctx);
    expect(card.state).toBe("REVIEW");
    expect(card.interval).toBeGreaterThan(10);
  });

  it("derives memory state for imported cards without one", () => {
    const imported: SchedulableCard = {
      ...fresh,
      state: "REVIEW",
      interval: 30,
      ease: 2500,
      reps: 8,
      lastReview: new Date(now.getTime() - 30 * 86_400_000),
    };
    const { card } = scheduleFsrs(imported, 3, config, ctx);
    expect(card.stability).toBeGreaterThan(0);
    expect(card.difficulty).toBeGreaterThanOrEqual(1);
    expect(card.difficulty).toBeLessThanOrEqual(10);
  });

  it("lapses into relearning on again", () => {
    const review: SchedulableCard = {
      ...fresh,
      state: "REVIEW",
      interval: 10,
      stability: 10,
      difficulty: 5,
      reps: 3,
      lastReview: new Date(now.getTime() - 10 * 86_400_000),
    };
    const { card } = scheduleFsrs(review, 1, config, ctx);
    expect(card.state).toBe("RELEARNING");
    expect(card.lapses).toBe(1);
  });
});
