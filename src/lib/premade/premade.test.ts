import { describe, expect, it } from "vitest";
import { fieldMap, renderCard } from "@/lib/anki/render";
import { PREMADE_DECKS } from "./catalog";
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
    const collection = deck.build();
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
