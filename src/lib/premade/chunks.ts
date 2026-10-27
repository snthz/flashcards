import type { Locale } from "@/lib/i18n/config";
import { buildPremadeCollection, premadeIds } from "./build";
import { PREMADE_BASE_CSS } from "./style";
import type { PremadeDeck, PremadeDeckText } from "./types";

// answer is the exact chunk of the example that the learner types, inflected as it appears (got fired).
export type ChunkEntry = [expression: string, meaning: string, example: string, answer: string, exampleTranslation: string, note?: string];

export interface ChunkGroup {
  name: string;
  tag: string;
  entries: ChunkEntry[];
}

interface ChunkDeckSpec {
  slug: string;
  title: string;
  idBase: bigint;
  guidPrefix: string;
  tag: string;
  rootName: string;
  noteTypeName: string;
  groups: ChunkGroup[];
  text: (count: number) => Record<Locale, PremadeDeckText>;
  samples: string[];
}

const SIBLING_GAP = 10;
const BLANK = "_____";

const FIELDS = ["Expresión", "Significado", "Ejemplo", "Respuesta", "Traducción del ejemplo", "Hueco", "Notas"];

const NOTE = `{{#Notas}}<div class="ck-note">{{Notas}}</div>{{/Notas}}`;

const HEAD = `<div class="ck-head"><span class="ck-word">{{Expresión}}</span>{{tts en_US:Expresión}}</div>`;

const TEMPLATES = [
  {
    name: "Completa la frase",
    qfmt: `<div class="ck">
  <div class="ck-es">{{Traducción del ejemplo}}</div>
  <div class="ck-cloze">{{Hueco}}</div>
  {{type:Respuesta}}
</div>`,
    afmt: `<div class="ck">
  <div class="ck-es">{{Traducción del ejemplo}}</div>
  <div class="ck-example"><span>{{Ejemplo}}</span>{{tts en_US:Ejemplo}}</div>
  {{type:Respuesta}}
  <hr id="answer">
  <div class="ck-expr"><b>{{Expresión}}</b> · {{Significado}}</div>
  ${NOTE}
</div>`,
  },
  {
    name: "¿Qué significa?",
    qfmt: `<div class="ck">
  ${HEAD}
  <div class="ck-example"><span>{{Ejemplo}}</span></div>
</div>`,
    afmt: `<div class="ck">
  ${HEAD}
  <div class="ck-example"><span>{{Ejemplo}}</span>{{tts en_US:Ejemplo}}</div>
  <hr id="answer">
  <div class="ck-meaning">{{Significado}}</div>
  <div class="ck-es">{{Traducción del ejemplo}}</div>
  ${NOTE}
</div>`,
  },
];

const CSS = `${PREMADE_BASE_CSS}.ck { max-width: 34rem; margin: 0 auto; }
.ck-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.ck-word { font-size: 1.875rem; font-weight: 700; letter-spacing: -0.02em; }
.ck-es { font-size: 1rem; opacity: 0.7; }
.ck-cloze { margin: 0.75rem 0 1rem; font-size: 1.375rem; font-weight: 600; line-height: 1.4; }
.ck-example { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin: 0.75rem 0; padding: 0.75rem 1rem; border-radius: 0.875rem; background: var(--premade-soft); font-size: 1.125rem; font-weight: 500; }
.ck hr#answer { margin: 1.25rem 0; }
.ck-expr { font-size: 1.125rem; }
.ck-meaning { font-size: 1.375rem; font-weight: 600; margin-bottom: 0.25rem; }
.ck-note { margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.75; }
`;

export function blankOut(example: string, answer: string) {
  return example.replace(answer, BLANK);
}

export function defineChunkDeck(spec: ChunkDeckSpec): PremadeDeck {
  const entries = spec.groups.flatMap((group) => group.entries);
  const text = spec.text(entries.length);

  const sample = (expression: string) => {
    const [front, back] = entries.find((entry) => entry[0] === expression)!;
    return { front, back };
  };

  return {
    slug: spec.slug,
    title: spec.title,
    text,
    cardCount: entries.length * TEMPLATES.length,
    subdecks: spec.groups.map((group) => ({ name: group.name, count: group.entries.length * TEMPLATES.length })),
    samples: spec.samples.map(sample),
    rootAnkiId: premadeIds(spec.idBase).rootDeck,
    build: (locale: Locale) =>
      buildPremadeCollection({
        idBase: spec.idBase,
        guidPrefix: spec.guidPrefix,
        tag: spec.tag,
        rootName: spec.rootName,
        description: text[locale].description,
        noteType: { name: spec.noteTypeName, fields: FIELDS, templates: TEMPLATES, css: CSS },
        groups: spec.groups.map((group) => ({
          name: group.name,
          tag: group.tag,
          notes: group.entries.map(([expression, meaning, example, answer, exampleTranslation, note]) => ({
            key: expression,
            fields: [expression, meaning, example, answer, exampleTranslation, blankOut(example, answer), note ?? ""],
          })),
        })),
        siblingGap: SIBLING_GAP,
      }),
  };
}
