import { describe, expect, it } from "vitest";
import { fieldMap, renderCard } from "@/lib/anki/render";
import { PREMADE_DECKS } from "./catalog";
import { KIND_LABELS, WORD_BANDS } from "./english-words";
import { FALSE_FRIEND_GROUPS } from "./false-friends";
import { PATTERN_GROUPS, SPOKEN_FORMS, spokenForms } from "./irregular-verbs";
import { PHRASAL_GROUPS } from "./phrasal-verbs";

describe("phrasal verbs deck", () => {
  const verbs = PHRASAL_GROUPS.flatMap((group) => group.verbs);

  it("has complete, unique entries", () => {
    expect(verbs.length).toBeGreaterThanOrEqual(400);
    const names = new Set<string>();
    for (const [verb, translation, definition, example, exampleTranslation, , kind] of verbs) {
      expect([verb, translation, definition, example, exampleTranslation].every((v) => v.trim().length > 0), verb).toBe(true);
      expect(["s", "i", "n"]).toContain(kind);
      expect(names.has(verb), `duplicado: ${verb}`).toBe(false);
      names.add(verb);
    }
  });

  it("builds a collection the importer can take", () => {
    const deck = PREMADE_DECKS.find((d) => d.slug === "phrasal-verbs")!;
    const collection = deck.build("en");
    expect(collection.notes).toHaveLength(verbs.length);
    expect(new Set(collection.notes.map((n) => n.guid)).size).toBe(verbs.length);
    expect(new Set(collection.cards.map((c) => c.newPosition)).size).toBe(verbs.length);
    expect(collection.decks[0].ankiId).toBe(deck.rootAnkiId);
    expect(collection.decks.every((d) => collection.cards.some((c) => c.deckAnkiId === d.ankiId) || d.ankiId === deck.rootAnkiId)).toBe(true);

    const [noteType] = collection.noteTypes;
    const note = collection.notes[0];
    const rendered = renderCard({
      fields: fieldMap(noteType.fields.map((f) => f.name), note.fields),
      template: noteType.templates[0],
      css: noteType.css,
      ord: 0,
      kind: "STANDARD",
      tags: note.tags,
      deckName: "x",
      noteTypeName: noteType.name,
      mediaBase: "/api/media/",
    });
    expect(rendered.audio.question).toEqual([`tts:en-US:${encodeURIComponent(verbs[0][0])}`]);
    expect(rendered.audio.answer).toHaveLength(2);
    expect(rendered.answer).not.toContain("{{");
  });
});

describe("irregular verbs deck", () => {
  const verbs = PATTERN_GROUPS.flatMap((group) => group.verbs);

  it("has complete, unique entries", () => {
    expect(verbs.length).toBeGreaterThanOrEqual(120);
    const bases = new Set<string>();
    for (const verb of verbs) {
      const [base, past, participle, translation, example, exampleTranslation] = verb;
      expect([base, past, participle, translation, example, exampleTranslation].every((v) => v.trim() === v && v.length > 0), base).toBe(true);
      expect([past, participle].every((form) => form.split("/").every((variant) => /^[a-z]+$/.test(variant.trim()))), base).toBe(true);
      expect(bases.has(base), `duplicado: ${base}`).toBe(false);
      bases.add(base);
    }
    for (const base of Object.keys(SPOKEN_FORMS)) expect(bases.has(base), base).toBe(true);
  });

  it("speaks the first spelling of each form", () => {
    const find = (base: string) => verbs.find((verb) => verb[0] === base)!;
    expect(spokenForms(find("go"))).toBe("go, went, gone");
    expect(spokenForms(find("learn"))).toBe("learn, learned, learned");
    expect(spokenForms(find("read"))).toBe("read, red, red");
  });

  it("builds a collection the importer can take", () => {
    const deck = PREMADE_DECKS.find((d) => d.slug === "irregular-verbs")!;
    const collection = deck.build("es");
    expect(collection.notes).toHaveLength(verbs.length);
    expect(deck.cardCount).toBe(collection.cards.length);
    expect(new Set(collection.notes.map((n) => n.guid)).size).toBe(verbs.length);
    expect(new Set(collection.cards.map((c) => c.newPosition)).size).toBe(verbs.length);
    expect(collection.decks[0].ankiId).toBe(deck.rootAnkiId);

    const [noteType] = collection.noteTypes;
    const note = collection.notes.find((n) => n.guid === "fc-iv-go")!;
    const rendered = renderCard({
      fields: fieldMap(noteType.fields.map((f) => f.name), note.fields),
      template: noteType.templates[0],
      css: noteType.css,
      ord: 0,
      kind: "STANDARD",
      tags: note.tags,
      deckName: "x",
      noteTypeName: noteType.name,
      mediaBase: "/api/media/",
    });
    expect(rendered.audio.question).toEqual(["tts:en-US:go"]);
    expect(rendered.audio.answer).toEqual([`tts:en-US:${encodeURIComponent("go, went, gone")}`, `tts:en-US:${encodeURIComponent("We went to the beach last summer.")}`]);
    expect(rendered.answer).toContain("went");
    expect(rendered.answer).not.toContain("{{");
  });
});

describe("english words deck", () => {
  const words = WORD_BANDS.flat();

  it("has 1000 complete, unique entries in bands of 100", () => {
    expect(WORD_BANDS.every((band) => band.length === 100)).toBe(true);
    const seen = new Set<string>();
    for (const [word, translation, kinds, example, exampleTranslation, note] of words) {
      expect([word, translation, example, exampleTranslation].every((v) => v.trim() === v && v.length > 0), word).toBe(true);
      expect(note === undefined || (note.trim() === note && note.length > 0), word).toBe(true);
      expect(kinds.length > 0 && kinds.every((kind) => kind in KIND_LABELS), word).toBe(true);
      expect(seen.has(word.toLowerCase()), `duplicado: ${word}`).toBe(false);
      seen.add(word.toLowerCase());
    }
  });

  it("builds both directions and introduces the reverse card a few words later", () => {
    const deck = PREMADE_DECKS.find((d) => d.slug === "english-1000")!;
    const collection = deck.build("es");
    expect(collection.notes).toHaveLength(1000);
    expect(collection.cards).toHaveLength(2000);
    expect(deck.cardCount).toBe(2000);
    expect(new Set(collection.cards.map((c) => c.newPosition)).size).toBe(2000);
    const ordered = [...collection.cards].sort((a, b) => a.newPosition - b.newPosition).map((c) => `${c.noteAnkiId - collection.notes[0].ankiId}:${c.ord}`);
    expect(ordered.slice(0, 13)).toEqual(["0:0", "1:0", "2:0", "3:0", "4:0", "5:0", "6:0", "7:0", "8:0", "9:0", "0:1", "10:0", "1:1"]);

    const [noteType] = collection.noteTypes;
    const note = collection.notes.find((n) => n.guid === "fc-ew-house")!;
    const render = (ord: number) =>
      renderCard({
        fields: fieldMap(noteType.fields.map((f) => f.name), note.fields),
        template: noteType.templates[ord],
        css: noteType.css,
        ord,
        kind: "STANDARD",
        tags: note.tags,
        deckName: "x",
        noteTypeName: noteType.name,
        mediaBase: "/api/media/",
      });
    const english = render(0);
    expect(english.audio.question).toEqual(["tts:en-US:house"]);
    expect(english.audio.answer).toHaveLength(2);
    const spanish = render(1);
    expect(spanish.audio.question).toEqual([]);
    expect(spanish.question).toContain("sustantivo");
    expect(spanish.audio.answer).toHaveLength(2);
    expect(spanish.answer).not.toContain("{{");
  });
});

function renderBoth(slug: string, guid: string) {
  const collection = PREMADE_DECKS.find((d) => d.slug === slug)!.build("es");
  const [noteType] = collection.noteTypes;
  const note = collection.notes.find((n) => n.guid === guid)!;
  return noteType.templates.map((template, ord) =>
    renderCard({
      fields: fieldMap(noteType.fields.map((f) => f.name), note.fields),
      template,
      css: noteType.css,
      ord,
      kind: "STANDARD",
      tags: note.tags,
      deckName: "x",
      noteTypeName: noteType.name,
      mediaBase: "/api/media/",
    }),
  );
}

describe("false friends deck", () => {
  const words = FALSE_FRIEND_GROUPS.flatMap((group) => group.words);

  it("has complete, unique entries", () => {
    expect(words.length).toBeGreaterThanOrEqual(100);
    expect(new Set(words.map((w) => w[0])).size).toBe(words.length);
    expect(new Set(words.map((w) => w[2])).size).toBe(words.length);
    for (const entry of words) {
      expect(entry.slice(0, 8).every((v) => typeof v === "string" && v.trim() === v && v.length > 0), entry[0]).toBe(true);
      expect(entry[8] === undefined || (entry[8].trim() === entry[8] && entry[8].length > 0), entry[0]).toBe(true);
    }
  });

  it("asks for the meaning and for the look-alike in English", () => {
    const deck = PREMADE_DECKS.find((d) => d.slug === "false-friends")!;
    const collection = deck.build("en");
    expect(collection.cards).toHaveLength(words.length * 2);
    expect(new Set(collection.cards.map((c) => c.newPosition)).size).toBe(words.length * 2);
    const [english, spanish] = renderBoth("false-friends", "fc-ff-actually");
    expect(english.audio.question).toEqual(["tts:en-US:actually"]);
    expect(english.answer).toContain("actualmente");
    expect(spanish.audio.question).toEqual([]);
    expect(spanish.question).toContain("actualmente");
    expect(spanish.answer).toContain("actually");
    expect(spanish.audio.answer).toHaveLength(2);
    expect([english.answer, spanish.answer].join("")).not.toContain("{{");
  });
});

describe("premade catalog", () => {
  it("keeps slugs and Anki ids apart between decks", () => {
    const collections = PREMADE_DECKS.map((deck) => deck.build("en"));
    expect(new Set(PREMADE_DECKS.map((deck) => deck.slug)).size).toBe(PREMADE_DECKS.length);
    const ids = collections.flatMap((c) => [...c.noteTypes, ...c.decks, ...c.notes, ...c.cards].map((item) => item.ankiId));
    expect(new Set(ids).size).toBe(ids.length);
    const guids = collections.flatMap((c) => c.notes.map((n) => n.guid));
    expect(new Set(guids).size).toBe(guids.length);
  });
});
