import type { Locale } from "@/lib/i18n/config";
import { buildPremadeCollection, premadeIds } from "../build";
import { PREMADE_BASE_CSS } from "../style";
import type { PremadeDeck } from "../types";
import { curious } from "./data/curious";
import { essential } from "./data/essential";
import { everyday } from "./data/everyday";
import { workAndStudy } from "./data/work-and-study";
import type { FalseFriend } from "./types";

export const FALSE_FRIEND_GROUPS: Array<{ name: string; tag: string; words: FalseFriend[] }> = [
  { name: "Imprescindibles", tag: "imprescindibles", words: essential },
  { name: "Del día a día", tag: "dia-a-dia", words: everyday },
  { name: "Trabajo y estudios", tag: "trabajo-estudios", words: workAndStudy },
  { name: "Parecidos curiosos", tag: "curiosos", words: curious },
];

const ID_BASE = 9_103_000_000_000n;
const SIBLING_GAP = 10;

const FIELDS = [
  "Inglés",
  "Significado",
  "Parecido",
  "Cómo se dice",
  "Ejemplo",
  "Traducción del ejemplo",
  "Ejemplo del parecido",
  "Traducción del ejemplo del parecido",
  "Notas",
];

const ENGLISH_HEAD = `<div class="ff-head"><span class="ff-word">{{Inglés}}</span>{{tts en_US:Inglés}}</div>`;

const SPANISH_HEAD = `<div class="ff-prompt">{{Parecido}}</div>
  <div class="ff-hint">¿Cómo se dice en inglés?</div>`;

const NOTE = `{{#Notas}}<div class="ff-note">{{Notas}}</div>{{/Notas}}`;

const TEMPLATES = [
  {
    name: "Inglés → Español",
    qfmt: `<div class="ff">
  ${ENGLISH_HEAD}
</div>`,
    afmt: `<div class="ff">
  ${ENGLISH_HEAD}
  <hr id="answer">
  <div class="ff-meaning">{{Significado}}</div>
  <div class="ff-trap">No es «{{Parecido}}», que se dice <b>{{Cómo se dice}}</b>.</div>
  <div class="ff-example">
    <div class="ff-example-en"><span>{{Ejemplo}}</span>{{tts en_US:Ejemplo}}</div>
    <div class="ff-example-es">{{Traducción del ejemplo}}</div>
  </div>
  ${NOTE}
</div>`,
  },
  {
    name: "Español → Inglés",
    qfmt: `<div class="ff">
  ${SPANISH_HEAD}
</div>`,
    afmt: `<div class="ff">
  ${SPANISH_HEAD}
  <hr id="answer">
  <div class="ff-head"><span class="ff-word">{{Cómo se dice}}</span>{{tts en_US:Cómo se dice}}</div>
  <div class="ff-trap">No digas <b>{{Inglés}}</b>: significa «{{Significado}}».</div>
  <div class="ff-example">
    <div class="ff-example-en"><span>{{Ejemplo del parecido}}</span>{{tts en_US:Ejemplo del parecido}}</div>
    <div class="ff-example-es">{{Traducción del ejemplo del parecido}}</div>
  </div>
  ${NOTE}
</div>`,
  },
];

const CSS = `${PREMADE_BASE_CSS}.ff { max-width: 34rem; margin: 0 auto; }
.ff-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.ff-word { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; }
.ff-prompt { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.01em; }
.ff-hint { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.6; }
.ff hr#answer { margin: 1.25rem 0; }
.ff-meaning { font-size: 1.375rem; font-weight: 600; }
.ff-trap { margin-top: 0.75rem; padding-left: 0.75rem; border-left: 3px solid currentColor; font-size: 0.95rem; opacity: 0.8; }
.ff-example { margin-top: 1.25rem; padding: 0.75rem 1rem; border-radius: 0.875rem; background: var(--premade-soft); }
.ff-example-en { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-weight: 500; }
.ff-example-es { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.7; }
.ff-note { margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.75; }
`;

function buildCollection(locale: Locale) {
  return buildPremadeCollection({
    idBase: ID_BASE,
    guidPrefix: "fc-ff",
    tag: "false-friends",
    rootName: "False friends (EN ↔ ES)",
    description: falseFriendsDeck.text[locale].description,
    noteType: { name: "False friend (EN ↔ ES)", fields: FIELDS, templates: TEMPLATES, css: CSS },
    groups: FALSE_FRIEND_GROUPS.map((group) => ({
      name: group.name,
      tag: group.tag,
      notes: group.words.map(([word, meaning, lookalike, lookalikeInEnglish, example, exampleTranslation, lookalikeExample, lookalikeExampleTranslation, note]) => ({
        key: word,
        fields: [word, meaning, lookalike, lookalikeInEnglish, example, exampleTranslation, lookalikeExample, lookalikeExampleTranslation, note ?? ""],
      })),
    })),
    siblingGap: SIBLING_GAP,
  });
}

const allWords = FALSE_FRIEND_GROUPS.flatMap((group) => group.words);

function sample(word: string) {
  const [front, meaning, lookalike] = allWords.find((entry) => entry[0] === word)!;
  return { front, back: `${meaning} (≠ ${lookalike})` };
}

export const falseFriendsDeck: PremadeDeck = {
  slug: "false-friends",
  title: "False friends",
  text: {
    en: {
      summary: `${allWords.length} English words that look like Spanish but mean something else, practiced in both directions.`,
      description:
        "Words like «actually», «embarrassed» or «carpet» that trick Spanish speakers. One card asks what the English word really means; the other starts from the Spanish look-alike (actualmente, embarazada, carpeta) and asks how to say it in English, which trains the exact mistake you would make when speaking. Each card has examples, translations and notes. Pronunciation uses your device's voice.",
      languages: "English ↔ Spanish",
      level: "Intermediate",
      tags: ["English", "Vocabulary", "With audio"],
    },
    es: {
      summary: `${allWords.length} palabras en inglés que parecen español pero significan otra cosa, para practicar en ambos sentidos.`,
      description:
        "Palabras como «actually», «embarrassed» o «carpet» que confunden a los hispanohablantes. Una tarjeta pregunta qué significa de verdad la palabra en inglés; la otra parte del parecido en español (actualmente, embarazada, carpeta) y pregunta cómo se dice en inglés, para entrenar justo el error que cometerías al hablar. Cada tarjeta trae ejemplos, traducciones y notas. La pronunciación usa la voz de tu dispositivo.",
      languages: "Inglés ↔ Español",
      level: "Intermedio",
      tags: ["Inglés", "Vocabulario", "Con audio"],
    },
  },
  cardCount: allWords.length * TEMPLATES.length,
  subdecks: FALSE_FRIEND_GROUPS.map((group) => ({ name: group.name, count: group.words.length * TEMPLATES.length })),
  samples: ["actually", "embarrassed", "carpet", "library", "realize", "pie"].map(sample),
  rootAnkiId: premadeIds(ID_BASE).rootDeck,
  build: buildCollection,
};
