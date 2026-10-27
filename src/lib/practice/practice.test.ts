import { describe, expect, it } from "vitest";
import { PREMADE_DECKS } from "@/lib/premade/catalog";
import { vocabularyFields, vocabularyNoteType } from "@/lib/translate/vocabulary";
import { extractItem, fieldLanguages, itemCloze, makeCloze, type NoteTypeShape } from "./extract";
import { acceptedAnswers, grade } from "./grade";
import { applyEnrichment, enrichmentHash, toEnrichment } from "./enrich";
import { buildSession, kindAvailability } from "./session";
import type { PracticeItem } from "./types";

function premade(slug: string) {
  const deck = PREMADE_DECKS.find((entry) => entry.slug === slug)!;
  const collection = deck.build("es");
  const [noteType] = collection.noteTypes;
  const shape: NoteTypeShape = { name: noteType.name, fields: noteType.fields.map((field) => field.name), templates: noteType.templates };
  return { shape, notes: collection.notes };
}

function seeded(seed = 7) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function item(term: string, meaning: string, extra: Partial<PracticeItem> = {}): PracticeItem {
  return { id: term, term, meaning, language: "en", example: "", exampleTranslation: "", answer: "", past: "", participle: "", deckName: "Deck", distractors: null, ...extra };
}

describe("extractItem", () => {
  it("reads the premade English words deck", () => {
    const { shape, notes } = premade("english-1000");
    const result = extractItem("n1", shape, notes[0].fields, "1000 words");
    expect(result).toMatchObject({ language: "en", deckName: "1000 words" });
    expect(result!.term.length).toBeGreaterThan(0);
    expect(result!.meaning.length).toBeGreaterThan(0);
    expect(result!.example.length).toBeGreaterThan(0);
  });

  it("reads irregular verb forms", () => {
    const { shape, notes } = premade("irregular-verbs");
    const result = extractItem("n1", shape, notes[0].fields, "Verbs")!;
    expect(result.past).not.toBe("");
    expect(result.participle).not.toBe("");
    expect(result.language).toBe("en");
  });

  it("reads chunk decks with their answer", () => {
    const { shape, notes } = premade("make-do-take-have");
    const result = extractItem("n1", shape, notes[0].fields, "Make or do")!;
    expect(result.answer).not.toBe("");
    expect(itemCloze(result)).not.toBeNull();
  });

  it("reads translator vocabulary notes and their language", () => {
    const noteType = vocabularyNoteType("en", "es");
    const shape = { name: noteType.name, fields: noteType.fields.map((field) => field.name), templates: noteType.templates };
    const values = vocabularyFields({ term: "craving", meaning: "antojo", kind: "sustantivo", synonyms: "urge", example: "I have a craving for pizza.", exampleTranslation: "Tengo antojo de pizza.", notes: "", direction: "both" });
    expect(extractItem("n1", shape, values, "Inglés")).toMatchObject({ term: "craving", meaning: "antojo", language: "en", example: "I have a craving for pizza.", exampleTranslation: "Tengo antojo de pizza." });
  });

  it("falls back to front and back without a language", () => {
    const shape = { name: "Basic", fields: ["Front", "Back"], templates: [{ qfmt: "{{Front}}", afmt: "{{Back}}" }] };
    expect(extractItem("n1", shape, ["perro", "dog<br>"], "Animales")).toMatchObject({ term: "perro", meaning: "dog", language: null });
    expect(extractItem("n2", shape, ["", "dog"], "Animales")).toBeNull();
  });

  it("finds tts languages in templates", () => {
    expect(fieldLanguages([{ qfmt: "{{tts en_US:Word}} {{tts es_MX voices=Paulina:Translation}}" }])).toEqual(new Map([["Word", "en"], ["Translation", "es"]]));
  });
});

describe("makeCloze", () => {
  it("blanks the word with its inflection", () => {
    expect(makeCloze("She was craving chocolate.", ["crave"])).toEqual({ before: "She was ", answer: "craving", after: " chocolate." });
    expect(makeCloze("He tried again.", ["try"])).toEqual({ before: "He ", answer: "tried", after: " again." });
    expect(makeCloze("We stopped early.", ["to stop"])).toEqual({ before: "We ", answer: "stopped", after: " early." });
  });

  it("matches whole expressions and skips partial words", () => {
    expect(makeCloze("Break a leg tonight!", ["break a leg"])).toEqual({ before: "", answer: "Break a leg", after: " tonight!" });
    expect(makeCloze("The cartoon was fun.", ["car"])).toBeNull();
  });
});

describe("grade", () => {
  it("accepts any listed meaning and ignores case and punctuation", () => {
    expect(grade("Antojo", "antojo, ansia")).toBe("correct");
    expect(grade("ansia.", "antojo, ansia")).toBe("correct");
    expect(grade("conform", "to conform")).toBe("correct");
    expect(grade("to conform", "conform")).toBe("correct");
  });

  it("calls missing accents and small typos almost right", () => {
    expect(grade("cancion", "canción")).toBe("almost");
    expect(grade("cravng", "craving")).toBe("almost");
    expect(grade("dog", "cat")).toBe("wrong");
    expect(grade("", "cat")).toBe("wrong");
  });

  it("splits alternatives", () => {
    expect(acceptedAnswers("got / gotten")).toEqual(expect.arrayContaining(["got", "gotten"]));
  });
});

describe("buildSession", () => {
  const pool = [
    item("craving", "antojo", { example: "I have a craving for pizza." }),
    item("put", "poner", { past: "put", participle: "put", example: "I put it there." }),
    item("conform", "ajustarse"),
    item("thrive", "prosperar"),
    item("meet", "conocer"),
  ];

  it("builds the requested number of exercises with variety", () => {
    const exercises = buildSession(pool, { kinds: ["choice", "type", "cloze", "listen", "sentence", "forms", "match"], length: 10, canSpeak: true }, seeded());
    expect(exercises).toHaveLength(10);
    expect(new Set(exercises.map((exercise) => exercise.kind)).size).toBeGreaterThanOrEqual(5);
    for (const exercise of exercises) {
      if (exercise.kind === "choice") {
        expect(exercise.options).toHaveLength(4);
        expect(exercise.options).toContain(exercise.reverse ? exercise.item.term : exercise.item.meaning);
      }
      if (exercise.kind === "forms") expect(exercise.item.term).toBe("put");
      if (exercise.kind === "match") expect(new Set(exercise.items.map((entry) => entry.id)).size).toBe(4);
    }
  });

  it("skips kinds that do not fit", () => {
    const small = pool.slice(0, 2);
    const exercises = buildSession(small, { kinds: ["choice", "listen", "type"], length: 4, canSpeak: false }, seeded());
    expect(exercises.every((exercise) => exercise.kind === "type")).toBe(true);
    expect(buildSession(pool, { kinds: [], length: 5, canSpeak: true })).toEqual([]);
  });
});

describe("generated distractors", () => {
  const lonely = [
    item("craving", "antojo", { distractors: { meanings: ["ansiedad", "almuerzo", "cosecha"], terms: ["carving", "crawling", "caring"] } }),
    item("thrive", "prosperar", { distractors: { meanings: ["sufrir", "dormir", "nadar"], terms: ["strive", "drive", "thrift"] } }),
  ];

  it("unlock multiple choice when there are few studied words", () => {
    const exercises = buildSession(lonely, { kinds: ["choice"], length: 4, canSpeak: false }, seeded(3));
    expect(exercises).toHaveLength(4);
    for (const exercise of exercises) {
      if (exercise.kind !== "choice") throw new Error("expected choice");
      expect(exercise.options).toHaveLength(4);
      expect(exercise.options).toContain(exercise.reverse ? exercise.item.term : exercise.item.meaning);
    }
  });

  it("explains why a kind is unavailable", () => {
    const availability = kindAvailability(lonely, false);
    expect(availability.choice).toBeNull();
    expect(availability.match).toBe("few-words");
    expect(availability.cloze).toBe("no-examples");
    expect(availability.listen).toBe("no-speech");
    expect(availability.forms).toBe("no-verbs");
  });
});

describe("applyEnrichment", () => {
  const output = {
    id: "1",
    language: "en",
    example: "I have a craving for tacos.",
    example_translation: "Tengo antojo de tacos.",
    cloze_answer: "craving",
    wrong_meanings: ["antojo", "cosecha", "almuerzo", "ruido"],
    wrong_terms: ["carving", "craving", "crawling", "caring"],
    past: "",
    participle: "",
  };

  it("fills missing data without overriding the card", () => {
    const base = item("craving", "antojo", { language: null });
    const data = toEnrichment(output, base);
    expect(data.wrongMeanings).toEqual(["cosecha", "almuerzo", "ruido"]);
    expect(data.wrongTerms).toEqual(["carving", "crawling", "caring"]);
    const enriched = applyEnrichment(base, data);
    expect(enriched).toMatchObject({ language: "en", example: "I have a craving for tacos.", exampleTranslation: "Tengo antojo de tacos.", answer: "craving" });
    const own = applyEnrichment(item("craving", "antojo", { example: "She was craving pizza." }), data);
    expect(own.example).toBe("She was craving pizza.");
    expect(own.exampleTranslation).toBe("");
  });

  it("changes the hash when the card changes", () => {
    expect(enrichmentHash(item("a", "b"))).not.toBe(enrichmentHash(item("a", "c")));
  });
});
