import type { Locale } from "@/lib/i18n/config";
import { buildPremadeCollection, premadeIds } from "../build";
import { PREMADE_BASE_CSS } from "../style";
import type { PremadeDeck } from "../types";
import { words001 } from "./data/words-001";
import { words101 } from "./data/words-101";
import { words201 } from "./data/words-201";
import { words301 } from "./data/words-301";
import { words401 } from "./data/words-401";
import { words501 } from "./data/words-501";
import { words601 } from "./data/words-601";
import { words701 } from "./data/words-701";
import { words801 } from "./data/words-801";
import { words901 } from "./data/words-901";
import type { EnglishWord, WordKind } from "./types";

export const WORD_BANDS: EnglishWord[][] = [words001, words101, words201, words301, words401, words501, words601, words701, words801, words901];

const ID_BASE = 9_102_000_000_000n;
const SIBLING_GAP = 10;

const FIELDS = ["Inglés", "Español", "Tipo", "Ejemplo", "Traducción del ejemplo", "Notas"];

export const KIND_LABELS: Record<WordKind, string> = {
  n: "sustantivo",
  v: "verbo",
  adj: "adjetivo",
  adv: "adverbio",
  prep: "preposición",
  pron: "pronombre",
  conj: "conjunción",
  det: "determinante",
  num: "número",
  modal: "verbo modal",
  interj: "interjección",
};

const EXAMPLE = `<div class="ew-example">
    <div class="ew-example-en"><span>{{Ejemplo}}</span>{{tts en_US:Ejemplo}}</div>
    <div class="ew-example-es">{{Traducción del ejemplo}}</div>
  </div>
  {{#Notas}}<div class="ew-note">{{Notas}}</div>{{/Notas}}`;

const ENGLISH_HEAD = `<div class="ew-head"><span class="ew-word">{{Inglés}}</span>{{tts en_US:Inglés}}</div>`;

const SPANISH_HEAD = `<div class="ew-prompt">{{Español}}</div>
  <div class="ew-kind">{{Tipo}}</div>`;

const TEMPLATES = [
  {
    name: "Inglés → Español",
    qfmt: `<div class="ew">
  ${ENGLISH_HEAD}
</div>`,
    afmt: `<div class="ew">
  ${ENGLISH_HEAD}
  <hr id="answer">
  <div class="ew-meaning">{{Español}}</div>
  <div class="ew-kind">{{Tipo}}</div>
  ${EXAMPLE}
</div>`,
  },
  {
    name: "Español → Inglés",
    qfmt: `<div class="ew">
  ${SPANISH_HEAD}
</div>`,
    afmt: `<div class="ew">
  ${SPANISH_HEAD}
  <hr id="answer">
  ${ENGLISH_HEAD}
  ${EXAMPLE}
</div>`,
  },
];

const CSS = `${PREMADE_BASE_CSS}.ew { max-width: 34rem; margin: 0 auto; }
.ew-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.ew-word { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; }
.ew-prompt { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.01em; }
.ew hr#answer { margin: 1.25rem 0; }
.ew-meaning { font-size: 1.375rem; font-weight: 600; }
.ew-kind { margin-top: 0.25rem; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.55; }
.ew-example { margin-top: 1.25rem; padding: 0.75rem 1rem; border-radius: 0.875rem; background: var(--premade-soft); }
.ew-example-en { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-weight: 500; }
.ew-example-es { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.7; }
.ew-note { margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.75; }
`;

function bandName(index: number, separator: string) {
  const start = index * 100 + 1;
  return `${String(start).padStart(3, "0")}${separator}${start + 99}`;
}

function buildCollection(locale: Locale) {
  return buildPremadeCollection({
    idBase: ID_BASE,
    guidPrefix: "fc-ew",
    tag: "english-1000",
    rootName: "1000 English words (EN ↔ ES)",
    description: englishWordsDeck.text[locale].description,
    noteType: { name: "English word (EN ↔ ES)", fields: FIELDS, templates: TEMPLATES, css: CSS },
    groups: WORD_BANDS.map((band, index) => ({
      name: bandName(index, "–"),
      tag: bandName(index, "-"),
      notes: band.map(([word, translation, kinds, example, exampleTranslation, note]) => ({
        key: word,
        fields: [word, translation, kinds.map((kind) => KIND_LABELS[kind]).join(" · "), example, exampleTranslation, note ?? ""],
      })),
    })),
    sequential: true,
    siblingGap: SIBLING_GAP,
  });
}

const allWords = WORD_BANDS.flat();

function sample(word: string) {
  const [front, back] = allWords.find((entry) => entry[0] === word)!;
  return { front, back };
}

export const englishWordsDeck: PremadeDeck = {
  slug: "english-1000",
  title: "1000 English words",
  text: {
    en: {
      summary: `The ${allWords.length} most common English words, with examples and pronunciation, studied in both directions.`,
      description:
        "Core English vocabulary ordered by frequency, in subdecks of 100 words. Every word has two cards: English → Spanish to recognize it and Spanish → English to produce it, which comes up a little later. Each card has the Spanish translation, the part of speech, an example with its translation and usage notes. Pronunciation uses your device's voice.",
      languages: "English ↔ Spanish",
      level: "Beginner",
      tags: ["English", "Vocabulary", "With audio"],
    },
    es: {
      summary: `Las ${allWords.length} palabras más comunes del inglés, con ejemplos y pronunciación, para estudiar en ambos sentidos.`,
      description:
        "Vocabulario esencial del inglés ordenado por frecuencia, en submazos de 100 palabras. Cada palabra tiene dos tarjetas: inglés → español para reconocerla y español → inglés para producirla, que aparece un poco después. Cada tarjeta trae la traducción, el tipo de palabra, un ejemplo con su traducción y notas de uso. La pronunciación usa la voz de tu dispositivo.",
      languages: "Inglés ↔ Español",
      level: "Básico",
      tags: ["Inglés", "Vocabulario", "Con audio"],
    },
  },
  cardCount: allWords.length * TEMPLATES.length,
  subdecks: WORD_BANDS.map((band, index) => ({ name: bandName(index, "–"), count: band.length * TEMPLATES.length })),
  samples: ["time", "people", "house", "learn", "beautiful", "weather"].map(sample),
  rootAnkiId: premadeIds(ID_BASE).rootDeck,
  build: buildCollection,
};
