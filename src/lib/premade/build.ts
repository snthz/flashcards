import type { NoteTypeTemplate, ParsedCard, ParsedCollection, ParsedDeck, ParsedNote, ParsedNoteType } from "@/lib/anki/types";

export interface PremadeGroup {
  name: string;
  tag: string;
  notes: Array<{ key: string; fields: string[] }>;
}

export interface PremadeCollectionSpec {
  idBase: bigint;
  guidPrefix: string;
  tag: string;
  rootName: string;
  description: string;
  noteType: { name: string; fields: string[]; templates: NoteTypeTemplate[]; css: string };
  groups: PremadeGroup[];
}

// Ids far from Anki's millisecond timestamps so they never clash with a user's own imports.
export function premadeIds(idBase: bigint) {
  return {
    note: idBase,
    card: idBase + 100_000_000n,
    rootDeck: idBase + 200_000_000n,
    noteType: idBase + 300_000_001n,
  };
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildPremadeCollection(spec: PremadeCollectionSpec): ParsedCollection {
  const ids = premadeIds(spec.idBase);
  const noteType: ParsedNoteType = {
    ankiId: ids.noteType,
    name: spec.noteType.name,
    kind: "STANDARD",
    css: spec.noteType.css,
    fields: spec.noteType.fields.map((name) => ({ name })),
    templates: spec.noteType.templates,
    sortFieldIdx: 0,
    latexPre: "",
    latexPost: "",
  };

  const decks: ParsedDeck[] = [{ ankiId: ids.rootDeck, name: spec.rootName, description: spec.description, configAnkiId: null }];
  const notes: ParsedNote[] = [];
  const cards: ParsedCard[] = [];
  // Interleave groups by relative rank so studying the whole deck mixes them instead of
  // finishing one group first; each group is already ordered from most to least common.
  const ranked: Array<{ rank: number; index: number }> = [];
  const templateCount = BigInt(spec.noteType.templates.length);
  const now = new Date();

  spec.groups.forEach((group, groupIndex) => {
    const deckId = ids.rootDeck + BigInt(groupIndex + 1);
    decks.push({ ankiId: deckId, name: `${spec.rootName}::${group.name}`, description: "", configAnkiId: null });
    group.notes.forEach((note, position) => {
      const noteIndex = BigInt(notes.length);
      const noteId = ids.note + noteIndex;
      notes.push({
        ankiId: noteId,
        guid: `${spec.guidPrefix}-${slugify(note.key)}`,
        noteTypeAnkiId: ids.noteType,
        fields: note.fields.map(escapeHtml),
        tags: [spec.tag, group.tag],
      });
      spec.noteType.templates.forEach((_, ord) => {
        ranked.push({ rank: (position + 0.5) / group.notes.length, index: cards.length });
        cards.push({
          ankiId: ids.card + noteIndex * templateCount + BigInt(ord),
          noteAnkiId: noteId,
          deckAnkiId: deckId,
          ord,
          state: "NEW",
          due: now,
          newPosition: 0,
          interval: 0,
          ease: 2500,
          reps: 0,
          lapses: 0,
          step: 0,
          stability: null,
          difficulty: null,
          suspended: false,
          buried: false,
          flag: 0,
        });
      });
    });
  });

  ranked
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .forEach(({ index }, order) => {
      cards[index].newPosition = order;
    });

  return { noteTypes: [noteType], decks, deckConfigs: [], notes, cards, media: [] };
}
