import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { parseApkg } from "./apkg";
import { fieldChecksum, writeAnkiCollection, writeNotesText, type ExportInput } from "./export";
import { ankiGuid } from "./guid";

const DAY = 86_400_000;
const now = new Date("2026-10-26T15:00:00Z");
const dayStart = new Date("2026-10-26T10:00:00Z");
const dayEnd = new Date(dayStart.getTime() + DAY);

function sampleInput(overrides: Partial<ExportInput> = {}): ExportInput {
  return {
    now,
    dayStart,
    dayEnd,
    includeScheduling: true,
    noteTypes: [
      {
        ankiId: 1700000000001n,
        name: "Basic",
        kind: "STANDARD",
        css: ".card { color: red; }",
        fields: [{ name: "Front" }, { name: "Back" }],
        templates: [{ name: "Card 1", qfmt: "{{Front}}", afmt: "{{FrontSide}}<hr id=answer>{{Back}}" }],
        sortFieldIdx: 0,
        latexPre: "",
        latexPost: "",
      },
    ],
    decks: [
      { ankiId: 1700000000100n, name: "Languages", description: "", configAnkiId: 1n },
      { ankiId: 1700000000101n, name: "Languages::English", description: "Phrasal verbs", configAnkiId: 1700000000200n },
    ],
    deckConfigs: [
      {
        ankiId: 1n,
        name: "Default",
        algorithm: "SM2",
        newPerDay: 20,
        reviewsPerDay: 200,
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
        leechAction: "TAG",
        newCardOrder: "SEQUENTIAL",
        desiredRetention: 0.9,
        fsrsWeights: [],
      },
      {
        ankiId: 1700000000200n,
        name: "Intensive",
        algorithm: "FSRS",
        newPerDay: 35,
        reviewsPerDay: 500,
        learningSteps: [1, 10, 60],
        relearningSteps: [5],
        graduatingInterval: 2,
        easyInterval: 5,
        startingEase: 2300,
        easyBonus: 1.4,
        hardMultiplier: 1.1,
        intervalModifier: 0.9,
        lapseMultiplier: 0.2,
        minLapseInterval: 2,
        maxInterval: 3650,
        leechThreshold: 6,
        leechAction: "SUSPEND",
        newCardOrder: "RANDOM",
        desiredRetention: 0.85,
        fsrsWeights: Array.from({ length: 21 }, (_, i) => i / 10),
      },
    ],
    notes: [
      { ankiId: 1700000001000n, guid: "abc", noteTypeAnkiId: 1700000000001n, fields: ["give up", '<img src="cat.png"> [sound:a.mp3]'], tags: ["verbs"], modified: now },
      { ankiId: 1700000001001n, guid: "def", noteTypeAnkiId: 1700000000001n, fields: ["take off", "despegar"], tags: [], modified: now },
      { ankiId: 1700000001002n, guid: "ghi", noteTypeAnkiId: 1700000000001n, fields: ["look up", "buscar"], tags: [], modified: now },
    ],
    cards: [
      {
        ankiId: 1700000002000n,
        noteAnkiId: 1700000001000n,
        deckAnkiId: 1700000000101n,
        ord: 0,
        state: "REVIEW",
        due: new Date(dayStart.getTime() - 3 * DAY),
        newPosition: 0,
        interval: 12,
        ease: 2350,
        reps: 7,
        lapses: 1,
        step: 0,
        stepCount: 0,
        stability: 14.25,
        difficulty: 5.5,
        suspended: false,
        flag: 2,
      },
      {
        ankiId: 1700000002001n,
        noteAnkiId: 1700000001001n,
        deckAnkiId: 1700000000101n,
        ord: 0,
        state: "LEARNING",
        due: new Date(now.getTime() + 10 * 60_000),
        newPosition: 0,
        interval: 0,
        ease: 2500,
        reps: 1,
        lapses: 0,
        step: 1,
        stepCount: 3,
        stability: null,
        difficulty: null,
        suspended: false,
        flag: 0,
      },
      {
        ankiId: 1700000002002n,
        noteAnkiId: 1700000001002n,
        deckAnkiId: 1700000000100n,
        ord: 0,
        state: "NEW",
        due: now,
        newPosition: 42,
        interval: 0,
        ease: 2500,
        reps: 0,
        lapses: 0,
        step: 0,
        stepCount: 2,
        stability: null,
        difficulty: null,
        suspended: true,
        flag: 0,
      },
    ],
    reviews: [
      {
        ankiId: 1700000003000n,
        cardAnkiId: 1700000002000n,
        rating: 3,
        prevState: "REVIEW",
        newState: "REVIEW",
        prevInterval: 5,
        newInterval: 12,
        ease: 2350,
        durationMs: 4200,
      },
    ],
    ...overrides,
  };
}

async function roundTrip(input: ExportInput, media: Record<string, Uint8Array> = {}) {
  const collection = await writeAnkiCollection(input);
  const manifest: Record<string, string> = {};
  const files: Record<string, Uint8Array> = { "collection.anki2": collection };
  Object.entries(media).forEach(([name, data], index) => {
    manifest[String(index)] = name;
    files[String(index)] = data;
  });
  files.media = strToU8(JSON.stringify(manifest));
  return parseApkg(zipSync(files), { now });
}

describe("writeAnkiCollection", () => {
  it("round-trips note types, decks, notes and media through the importer", async () => {
    const parsed = await roundTrip(sampleInput(), { "cat.png": new Uint8Array([1, 2, 3]) });
    expect(parsed.noteTypes).toHaveLength(1);
    expect(parsed.noteTypes[0].templates[0].afmt).toBe("{{FrontSide}}<hr id=answer>{{Back}}");
    expect(parsed.decks.map((deck) => deck.name).sort()).toEqual(["Default", "Languages", "Languages::English"]);
    expect(parsed.decks.find((deck) => deck.name === "Languages::English")?.description).toBe("Phrasal verbs");
    expect(parsed.notes.map((note) => note.guid)).toEqual(["abc", "def", "ghi"]);
    expect(parsed.notes[0].fields[1]).toBe('<img src="cat.png"> [sound:a.mp3]');
    expect(parsed.notes[0].tags).toEqual(["verbs"]);
    expect(parsed.media).toEqual([{ name: "cat.png", data: new Uint8Array([1, 2, 3]) }]);
  });

  it("keeps scheduling, FSRS memory and flags", async () => {
    const parsed = await roundTrip(sampleInput());
    const review = parsed.cards.find((card) => card.ankiId === 1700000002000n)!;
    expect(review.state).toBe("REVIEW");
    expect(review.due.getTime()).toBe(dayStart.getTime() - 3 * DAY);
    expect(review.interval).toBe(12);
    expect(review.ease).toBe(2350);
    expect(review.stability).toBeCloseTo(14.25);
    expect(review.difficulty).toBeCloseTo(5.5);
    expect(review.flag).toBe(2);
    const learning = parsed.cards.find((card) => card.ankiId === 1700000002001n)!;
    expect(learning.state).toBe("LEARNING");
    expect(Math.abs(learning.due.getTime() - (now.getTime() + 10 * 60_000))).toBeLessThan(1000);
    expect(learning.step).toBe(1);
    const fresh = parsed.cards.find((card) => card.ankiId === 1700000002002n)!;
    expect(fresh.state).toBe("NEW");
    expect(fresh.newPosition).toBe(42);
    expect(fresh.suspended).toBe(true);
    expect(parsed.reviews).toEqual([
      { id: 1700000003000n, cardAnkiId: 1700000002000n, ease: 3, interval: 12, lastInterval: 5, factor: 2350, timeMs: 4200, type: 1 },
    ]);
  });

  it("keeps deck options, including the algorithm and FSRS parameters", async () => {
    const parsed = await roundTrip(sampleInput());
    const intensive = parsed.deckConfigs.find((config) => config.name === "Intensive")!;
    expect(intensive.algorithm).toBe("FSRS");
    expect(intensive.newPerDay).toBe(35);
    expect(intensive.learningSteps).toEqual([1, 10, 60]);
    expect(intensive.relearningSteps).toEqual([5]);
    expect(intensive.leechAction).toBe("SUSPEND");
    expect(intensive.desiredRetention).toBeCloseTo(0.85);
    expect(intensive.fsrsWeights).toHaveLength(21);
    expect(parsed.decks.find((deck) => deck.name === "Languages::English")?.configAnkiId).toBe(1700000000200n);
  });

  it("resets every card to new when scheduling is excluded", async () => {
    const parsed = await roundTrip(sampleInput({ includeScheduling: false }));
    expect(parsed.cards.every((card) => card.state === "NEW" && !card.suspended && card.flag === 0)).toBe(true);
  });
});

describe("helpers", () => {
  it("creates distinct Anki style guids", () => {
    const guids = new Set(Array.from({ length: 200 }, () => ankiGuid()));
    expect(guids.size).toBe(200);
  });

  it("checksums the first field the way Anki does", () => {
    expect(fieldChecksum("<b>hello</b>")).toBe(fieldChecksum("hello"));
    expect(fieldChecksum("hello")).toBe(0xaaf4c61d);
  });

  it("writes Anki's plain text format with quoted multi-line fields", () => {
    const text = writeNotesText([
      { guid: "g1", noteTypeName: "Basic", deckName: "A::B", fields: ["one", 'two\n"lines"'], tags: ["x", "y"] },
      { guid: "g2", noteTypeName: "Cloze", deckName: "A", fields: ["{{c1::three}}"], tags: [] },
    ]);
    const lines = text.split("\n");
    expect(lines.slice(0, 6)).toEqual(["#separator:tab", "#html:true", "#guid column:1", "#notetype column:2", "#deck column:3", "#tags column:6"]);
    expect(text).toContain('g1\tBasic\tA::B\tone\t"two\n""lines"""\tx y');
    expect(text).toContain("g2\tCloze\tA\t{{c1::three}}\t\t");
  });
});
