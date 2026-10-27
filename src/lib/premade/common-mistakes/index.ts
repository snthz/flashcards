import type { Locale } from "@/lib/i18n/config";
import { buildPremadeCollection, premadeIds } from "../build";
import { PREMADE_BASE_CSS } from "../style";
import type { PremadeDeck } from "../types";
import { beingHaving } from "./data/being-having";
import { nounsArticles } from "./data/nouns-articles";
import { questionsNegatives } from "./data/questions-negatives";
import { structure } from "./data/structure";
import { verbsTenses } from "./data/verbs-tenses";
import { wordChoice } from "./data/word-choice";
import type { CommonMistake } from "./types";

export const MISTAKE_GROUPS: Array<{ name: string; tag: string; mistakes: CommonMistake[] }> = [
  { name: "Ser, estar y tener", tag: "ser-estar-tener", mistakes: beingHaving },
  { name: "Verbos y tiempos", tag: "verbos", mistakes: verbsTenses },
  { name: "Sustantivos y artículos", tag: "sustantivos", mistakes: nounsArticles },
  { name: "Orden y estructura", tag: "estructura", mistakes: structure },
  { name: "Preguntas y negaciones", tag: "preguntas", mistakes: questionsNegatives },
  { name: "Palabras que se confunden", tag: "palabras", mistakes: wordChoice },
];

const ID_BASE = 9_106_000_000_000n;

const FIELDS = ["Incorrecta", "Correcta", "Traducción", "Explicación"];

const PROMPT = `<div class="cm-label">Corrige la frase</div>
  <div class="cm-wrong">{{Incorrecta}}</div>
  <div class="cm-es">{{Traducción}}</div>
  {{type:Correcta}}`;

const TEMPLATES = [
  {
    name: "Corrige la frase",
    qfmt: `<div class="cm">
  ${PROMPT}
</div>`,
    afmt: `<div class="cm">
  ${PROMPT}
  <hr id="answer">
  <div class="cm-head"><span class="cm-right">{{Correcta}}</span>{{tts en_US:Correcta}}</div>
  <div class="cm-why">{{Explicación}}</div>
</div>`,
  },
];

const CSS = `${PREMADE_BASE_CSS}.cm { max-width: 34rem; margin: 0 auto; }
.cm-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.55; }
.cm-wrong { margin-top: 0.5rem; font-size: 1.375rem; font-weight: 600; text-decoration: line-through; text-decoration-thickness: 2px; opacity: 0.75; }
.cm-es { margin: 0.5rem 0 1rem; font-size: 1rem; opacity: 0.7; }
.cm hr#answer { margin: 1.25rem 0; }
.cm-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.cm-right { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.01em; }
.cm-why { margin-top: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.875rem; background: var(--premade-soft); font-size: 0.95rem; }
`;

function buildCollection(locale: Locale) {
  return buildPremadeCollection({
    idBase: ID_BASE,
    guidPrefix: "fc-cm",
    tag: "common-mistakes",
    rootName: "Common mistakes (EN → ES)",
    description: commonMistakesDeck.text[locale].description,
    noteType: { name: "Common mistake (EN → ES)", fields: FIELDS, templates: TEMPLATES, css: CSS },
    groups: MISTAKE_GROUPS.map((group) => ({
      name: group.name,
      tag: group.tag,
      notes: group.mistakes.map(([wrong, correct, translation, explanation]) => ({ key: wrong, fields: [wrong, correct, translation, explanation] })),
    })),
  });
}

const allMistakes = MISTAKE_GROUPS.flatMap((group) => group.mistakes);

export const commonMistakesDeck: PremadeDeck = {
  slug: "common-mistakes",
  title: "Common mistakes",
  text: {
    en: {
      summary: `${allMistakes.length} mistakes Spanish speakers make in English, corrected by typing the right sentence.`,
      description:
        "«I have 25 years», «Explain me», «People is», «I'm agree»: the errors that come from thinking in Spanish. Each card shows the wrong sentence and what you meant to say; you type the correct version and the app compares it letter by letter. The answer explains the rule and plays the correct sentence with your device's voice.",
      languages: "English → Spanish",
      level: "Beginner",
      tags: ["English", "Grammar", "Typed answers", "With audio"],
    },
    es: {
      summary: `${allMistakes.length} errores que cometemos los hispanohablantes en inglés, para corregir escribiendo la frase correcta.`,
      description:
        "«I have 25 years», «Explain me», «People is», «I'm agree»: los errores que salen de pensar en español. Cada tarjeta muestra la frase incorrecta y lo que querías decir; tú escribes la versión correcta y la app la compara letra por letra. La respuesta explica la regla y reproduce la frase correcta con la voz de tu dispositivo.",
      languages: "Inglés → Español",
      level: "Básico",
      tags: ["Inglés", "Gramática", "Respuesta escrita", "Con audio"],
    },
  },
  cardCount: allMistakes.length,
  subdecks: MISTAKE_GROUPS.map((group) => ({ name: group.name, count: group.mistakes.length })),
  samples: MISTAKE_GROUPS.map((group) => group.mistakes[0]).map(([wrong, correct]) => ({ front: wrong, back: correct })),
  rootAnkiId: premadeIds(ID_BASE).rootDeck,
  build: buildCollection,
};
