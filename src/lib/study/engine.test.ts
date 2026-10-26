import { describe, expect, it } from "vitest";
import { applyOp, createEngine, engineCounts, pickCard, reviewOutcome, shouldReplay, toSchedulableCard } from "./engine";
import type { PackCard, PackConfig, StudyOp, StudyPack } from "./types";

const USER = "11111111-1111-4111-8111-111111111111";
const DAY = 86_400_000;
const dayStart = new Date("2026-10-26T10:00:00Z");
const now = new Date("2026-10-26T15:00:00Z");

const config: PackConfig = {
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
  leechAction: "TAG",
};

function card(id: string, overrides: Partial<PackCard> = {}): PackCard {
  return {
    id,
    noteId: `note-${id}`,
    configId: "c1",
    ord: 0,
    state: "NEW",
    due: now.toISOString(),
    newPosition: 0,
    interval: 0,
    ease: 2500,
    reps: 0,
    lapses: 0,
    step: 0,
    stability: null,
    difficulty: null,
    lastReview: null,
    suspended: false,
    buriedUntil: null,
    flag: 0,
    question: `q-${id}`,
    answer: `a-${id}`,
    styleId: "s1",
    audio: { question: [], answer: [] },
    ...overrides,
  };
}

function pack(cards: PackCard[], overrides: Partial<StudyPack> = {}): StudyPack {
  return {
    version: 1,
    userId: USER,
    deckId: "deck",
    deckName: "Deck",
    fetchedAt: now.toISOString(),
    timezone: "UTC",
    dayStartHour: 10,
    dayStart: dayStart.toISOString(),
    dayEnd: new Date(dayStart.getTime() + DAY).toISOString(),
    newLimit: cards.filter((c) => c.state === "NEW").length,
    reviewLimit: cards.filter((c) => c.state === "REVIEW").length,
    truncated: false,
    newCardOrder: "SEQUENTIAL",
    serverUndo: false,
    configs: { c1: config },
    styles: { s1: "" },
    cards,
    ...overrides,
  };
}

function review(cardId: string, rating: 1 | 2 | 3 | 4, at: Date, id = `00000000-0000-4000-8000-${cardId.padStart(12, "0")}`): StudyOp {
  return { id, userId: USER, cardId, at: at.toISOString(), kind: "review", rating, durationMs: 1000 };
}

describe("pickCard", () => {
  it("shows due learning cards before anything else", () => {
    const engine = createEngine(
      pack([
        card("new", { newPosition: 1 }),
        card("rev", { state: "REVIEW", due: new Date(now.getTime() - DAY).toISOString(), interval: 3 }),
        card("lrn", { state: "LEARNING", due: new Date(now.getTime() - 60_000).toISOString() }),
      ]),
      [],
    );
    expect(pickCard(engine, now).cardId).toBe("lrn");
  });

  it("interleaves new and review cards by the remaining counts", () => {
    const engine = createEngine(
      pack([card("new", { newPosition: 1 }), card("rev", { state: "REVIEW", due: now.toISOString(), interval: 3 })]),
      [],
    );
    expect(pickCard(engine, now, { random: () => 0.1 }).cardId).toBe("new");
    expect(pickCard(engine, now, { random: () => 0.9 }).cardId).toBe("rev");
  });

  it("takes new cards in position order unless the deck uses random order", () => {
    const cards = [card("b", { newPosition: 2 }), card("a", { newPosition: 1 }), card("c", { newPosition: 3 })];
    expect(pickCard(createEngine(pack(cards), []), now).cardId).toBe("a");
    const random = createEngine(pack(cards, { newCardOrder: "RANDOM" }), []);
    expect(pickCard(random, now, { random: () => 0.99 }).cardId).toBe("c");
  });

  it("learns ahead up to twenty minutes and reports when the next card is ready", () => {
    const soon = createEngine(pack([card("l", { state: "LEARNING", due: new Date(now.getTime() + 10 * 60_000).toISOString() })]), []);
    expect(pickCard(soon, now).cardId).toBe("l");
    const later = new Date(now.getTime() + 2 * 3_600_000);
    const wait = createEngine(pack([card("l", { state: "LEARNING", due: later.toISOString() })]), []);
    expect(pickCard(wait, now)).toEqual({ cardId: null, learnAheadAt: later });
  });

  it("returns a preferred card when it can still be studied", () => {
    const engine = createEngine(pack([card("a", { newPosition: 1 }), card("b", { newPosition: 2 })]), []);
    expect(pickCard(engine, now, { preferId: "b" }).cardId).toBe("b");
    expect(pickCard(engine, now, { preferId: "missing" }).cardId).toBe("a");
  });
});

describe("applyOp", () => {
  it("moves a new card into learning, spends the daily limit and buries its siblings", () => {
    const engine = createEngine(
      pack([card("a", { noteId: "n1" }), card("b", { noteId: "n1", ord: 1, newPosition: 1 }), card("c", { noteId: "n2", newPosition: 2 })]),
      [],
    );
    applyOp(engine, review("a", 3, now));
    expect(engine.cards.get("a")?.state).toBe("LEARNING");
    expect(engine.cards.get("b")?.buriedUntil).toBe(dayStart.getTime() + DAY);
    expect(engine.newLeft).toBe(2);
    expect(engineCounts(engine, now)).toEqual({ fresh: 1, learning: 1, review: 0 });
    expect(pickCard(engine, now).cardId).toBe("c");
  });

  it("applies bury, suspend and flag operations", () => {
    const engine = createEngine(pack([card("a"), card("b", { newPosition: 1 }), card("c", { newPosition: 2 })]), []);
    applyOp(engine, { id: "1", userId: USER, cardId: "a", at: now.toISOString(), kind: "bury" });
    applyOp(engine, { id: "2", userId: USER, cardId: "b", at: now.toISOString(), kind: "suspend" });
    applyOp(engine, { id: "3", userId: USER, cardId: "c", at: now.toISOString(), kind: "flag", flag: 3 });
    expect(engineCounts(engine, now).fresh).toBe(1);
    expect(engine.cards.get("c")?.flag).toBe(3);
    expect(pickCard(engine, now).cardId).toBe("c");
  });
});

describe("replay", () => {
  it("skips operations the server already applied before the pack was fetched", () => {
    const p = pack([card("a")]);
    expect(shouldReplay({ ...review("a", 3, now), syncedAt: new Date(now.getTime() - 1000).toISOString() }, p)).toBe(false);
    expect(shouldReplay({ ...review("a", 3, now), syncedAt: new Date(now.getTime() + 1000).toISOString() }, p)).toBe(true);
    expect(shouldReplay(review("a", 3, now), p)).toBe(true);
  });

  it("replays pending answers on top of a fresh pack and ignores other accounts", () => {
    const p = pack([card("a"), card("b", { newPosition: 1 })]);
    const engine = createEngine(p, [review("a", 4, now), { ...review("b", 4, now), userId: "someone-else" }]);
    expect(engine.cards.get("a")?.state).toBe("REVIEW");
    expect(engine.cards.get("b")?.state).toBe("NEW");
  });
});

describe("reviewOutcome", () => {
  it("fuzzes the same way for the same answer so the device and the server agree", () => {
    const reviewCard = toSchedulableCard(
      createEngine(pack([card("r", { state: "REVIEW", interval: 40, reps: 8, lastReview: new Date(now.getTime() - 40 * DAY).toISOString() })]), []).cards.get("r")!,
    );
    const first = reviewOutcome(reviewCard, 3, config, now, dayStart, "op-1");
    const again = reviewOutcome(reviewCard, 3, config, now, dayStart, "op-1");
    expect(again.card.interval).toBe(first.card.interval);
    expect(again.card.due.getTime()).toBe(first.card.due.getTime());
    const fsrs = { ...config, algorithm: "FSRS" as const };
    const memory = { ...reviewCard, stability: 30, difficulty: 5 };
    expect(reviewOutcome(memory, 3, fsrs, now, dayStart, "x").card.due.getTime()).toBe(reviewOutcome(memory, 3, fsrs, now, dayStart, "y").card.due.getTime());
  });
});
