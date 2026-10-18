import type { ParsedCard, ParsedCollection, ParsedDeck, ParsedNote, ParsedNoteType } from "@/lib/anki/types";
import type { PremadeDeck } from "../types";
import { around } from "./data/around";
import { away } from "./data/away";
import { back } from "./data/back";
import { down } from "./data/down";
import { inParticle } from "./data/in";
import { into } from "./data/into";
import { off } from "./data/off";
import { on } from "./data/on";
import { across, after, ahead, along, apart, by, forParticle, forward, together, withParticle } from "./data/others";
import { out } from "./data/out";
import { over } from "./data/over";
import { through } from "./data/through";
import { up } from "./data/up";
import type { ParticleGroup, PhrasalKind } from "./types";

export const PHRASAL_GROUPS: ParticleGroup[] = [
  { name: "up", verbs: up },
  { name: "out", verbs: out },
  { name: "off", verbs: off },
  { name: "down", verbs: down },
  { name: "on", verbs: on },
  { name: "in", verbs: inParticle },
  { name: "back", verbs: back },
  { name: "away", verbs: away },
  { name: "over", verbs: over },
  { name: "around · about", verbs: around },
  { name: "into", verbs: into },
  { name: "for", verbs: forParticle },
  { name: "with", verbs: withParticle },
  { name: "through", verbs: through },
  { name: "along", verbs: along },
  { name: "by", verbs: by },
  { name: "apart", verbs: apart },
  { name: "together", verbs: together },
  { name: "after", verbs: after },
  { name: "otras (across · ahead · forward)", verbs: [...across, ...ahead, ...forward] },
];

const ROOT_NAME = "Phrasal verbs (EN → ES)";
// Ids far from Anki's millisecond timestamps so they never clash with a user's own imports.
const NOTE_TYPE_ID = 9_100_300_000_001n;
const ROOT_DECK_ID = 9_100_200_000_000n;
const NOTE_ID_BASE = 9_100_000_000_000n;
const CARD_ID_BASE = 9_100_100_000_000n;

const FIELDS = ["Verbo", "Traducción", "Definición", "Ejemplo", "Traducción del ejemplo", "Sinónimos", "Tipo", "Notas"];

const KIND_LABELS: Record<PhrasalKind, string> = {
  s: "Separable",
  i: "Inseparable",
  n: "Sin objeto",
};

const FRONT = `<div class="pv">
  <div class="pv-head"><span class="pv-verb">{{Verbo}}</span>{{tts en_US:Verbo}}</div>
</div>`;

const BACK = `<div class="pv">
  <div class="pv-head"><span class="pv-verb">{{Verbo}}</span>{{tts en_US:Verbo}}</div>
  <hr id="answer">
  <div class="pv-meaning">{{Traducción}}</div>
  <div class="pv-def">{{Definición}}</div>
  <div class="pv-example">
    <div class="pv-example-en"><span>{{Ejemplo}}</span>{{tts en_US:Ejemplo}}</div>
    <div class="pv-example-es">{{Traducción del ejemplo}}</div>
  </div>
  <div class="pv-meta">
    <span class="pv-chip">{{Tipo}}</span>
    {{#Sinónimos}}<span class="pv-syn"><b>Sinónimos:</b> {{Sinónimos}}</span>{{/Sinónimos}}
  </div>
  {{#Notas}}<div class="pv-note">{{Notas}}</div>{{/Notas}}
</div>`;

// Inherits the app's text color and background so it reads well in light and dark mode.
const CSS = `.card {
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 18px;
  line-height: 1.5;
  text-align: left;
  color: inherit;
  background: transparent;
  --pv-accent: #4f46e5;
  --pv-soft: rgba(79, 70, 229, 0.08);
}
.card.nightMode {
  --pv-accent: #a5b4fc;
  --pv-soft: rgba(165, 180, 252, 0.12);
}
.pv { max-width: 34rem; margin: 0 auto; }
.pv-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.pv-verb { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; color: var(--pv-accent); }
.pv hr#answer { margin: 1.25rem 0; }
.pv-meaning { font-size: 1.375rem; font-weight: 600; }
.pv-def { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.65; font-style: italic; }
.pv-example { margin-top: 1.25rem; padding: 0.75rem 1rem; border-radius: 0.875rem; background: var(--pv-soft); }
.pv-example-en { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-weight: 500; }
.pv-example-es { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.7; }
.pv-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; margin-top: 1rem; font-size: 0.875rem; }
.pv-chip { padding: 0.125rem 0.625rem; border: 1px solid currentColor; border-radius: 999px; font-size: 0.75rem; font-weight: 600; opacity: 0.6; }
.pv-syn { opacity: 0.75; }
.pv-syn b { font-weight: 600; }
.pv-note { margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.75; }
`;

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildCollection(): ParsedCollection {
  const noteType: ParsedNoteType = {
    ankiId: NOTE_TYPE_ID,
    name: "Phrasal verb (EN → ES)",
    kind: "STANDARD",
    css: CSS,
    fields: FIELDS.map((name) => ({ name })),
    templates: [{ name: "Inglés → Español", qfmt: FRONT, afmt: BACK }],
    sortFieldIdx: 0,
    latexPre: "",
    latexPost: "",
  };

  const decks: ParsedDeck[] = [
    {
      ankiId: ROOT_DECK_ID,
      name: ROOT_NAME,
      description: phrasalVerbsDeck.description,
      configAnkiId: null,
    },
  ];
  const notes: ParsedNote[] = [];
  const cards: ParsedCard[] = [];
  // Interleave particles by relative rank so studying the whole deck mixes them instead of
  // finishing every "up" verb first; each list is already ordered from most to least common.
  const ranked: Array<{ rank: number; index: number }> = [];
  const now = new Date();

  PHRASAL_GROUPS.forEach((group, groupIndex) => {
    const deckId = ROOT_DECK_ID + BigInt(groupIndex + 1);
    decks.push({ ankiId: deckId, name: `${ROOT_NAME}::${group.name}`, description: "", configAnkiId: null });
    group.verbs.forEach(([verb, translation, definition, example, exampleTranslation, synonyms, kind, note], position) => {
      const index = notes.length;
      const id = BigInt(index);
      notes.push({
        ankiId: NOTE_ID_BASE + id,
        guid: `fc-pv-${slug(verb)}`,
        noteTypeAnkiId: NOTE_TYPE_ID,
        fields: [verb, translation, definition, example, exampleTranslation, synonyms, KIND_LABELS[kind], note ?? ""].map(escapeHtml),
        tags: ["phrasal-verbs", slug(group.name.split(" ")[0])],
      });
      cards.push({
        ankiId: CARD_ID_BASE + id,
        noteAnkiId: NOTE_ID_BASE + id,
        deckAnkiId: deckId,
        ord: 0,
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
      ranked.push({ rank: (position + 0.5) / group.verbs.length, index });
    });
  });

  ranked
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .forEach(({ index }, order) => {
      cards[index].newPosition = order;
    });

  return { noteTypes: [noteType], decks, deckConfigs: [], notes, cards, media: [] };
}

const allVerbs = PHRASAL_GROUPS.flatMap((group) => group.verbs);

export const phrasalVerbsDeck: PremadeDeck = {
  slug: "phrasal-verbs",
  title: "Phrasal verbs",
  summary: `Los ${allVerbs.length} phrasal verbs más usados del inglés, con ejemplos, sinónimos y pronunciación.`,
  description:
    "Phrasal verbs del inglés cotidiano agrupados por partícula (up, out, off…). Cada tarjeta trae la traducción al español, una definición corta en inglés, un ejemplo con su traducción, sinónimos, si el verbo es separable y notas de uso. La pronunciación usa la voz de tu dispositivo.",
  languages: "Inglés → Español",
  level: "Intermedio",
  tags: ["Inglés", "Vocabulario", "Con audio"],
  cardCount: allVerbs.length,
  subdecks: PHRASAL_GROUPS.map((group) => ({ name: group.name, count: group.verbs.length })),
  samples: [up[0], out[0], off[1], down[0], on[3], back[0]].map(([verb, translation]) => ({ front: verb, back: translation })),
  rootAnkiId: ROOT_DECK_ID,
  build: buildCollection,
};
