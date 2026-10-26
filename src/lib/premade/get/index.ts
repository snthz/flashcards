import type { Locale } from "@/lib/i18n/config";
import { buildPremadeCollection, premadeIds } from "../build";
import { PREMADE_BASE_CSS } from "../style";
import type { PremadeDeck } from "../types";
import { arriving } from "./data/arriving";
import { becoming } from "./data/becoming";
import { causing } from "./data/causing";
import { expressions } from "./data/expressions";
import { obtaining } from "./data/obtaining";
import { passive } from "./data/passive";
import { phrasal } from "./data/phrasal";
import { understanding } from "./data/understanding";
import type { GetUse } from "./types";

export const GET_GROUPS: Array<{ name: string; tag: string; uses: GetUse[] }> = [
  { name: "Conseguir y recibir", tag: "conseguir", uses: obtaining },
  { name: "Llegar y moverse", tag: "llegar", uses: arriving },
  { name: "Ponerse y volverse", tag: "ponerse", uses: becoming },
  { name: "Entender", tag: "entender", uses: understanding },
  { name: "Get + participio", tag: "participio", uses: passive },
  { name: "Hacer que algo pase", tag: "causar", uses: causing },
  { name: "Frases hechas", tag: "frases", uses: expressions },
  { name: "Phrasal verbs", tag: "phrasal", uses: phrasal },
];

const ID_BASE = 9_105_000_000_000n;
const SIBLING_GAP = 10;
const BLANK = "_____";

const FIELDS = ["Expresión", "Significado", "Ejemplo", "Respuesta", "Traducción del ejemplo", "Hueco", "Notas"];

const NOTE = `{{#Notas}}<div class="gt-note">{{Notas}}</div>{{/Notas}}`;

const HEAD = `<div class="gt-head"><span class="gt-word">{{Expresión}}</span>{{tts en_US:Expresión}}</div>`;

const TEMPLATES = [
  {
    name: "Completa la frase",
    qfmt: `<div class="gt">
  <div class="gt-es">{{Traducción del ejemplo}}</div>
  <div class="gt-cloze">{{Hueco}}</div>
  {{type:Respuesta}}
</div>`,
    afmt: `<div class="gt">
  <div class="gt-es">{{Traducción del ejemplo}}</div>
  <div class="gt-example"><span>{{Ejemplo}}</span>{{tts en_US:Ejemplo}}</div>
  {{type:Respuesta}}
  <hr id="answer">
  <div class="gt-expr"><b>{{Expresión}}</b> · {{Significado}}</div>
  ${NOTE}
</div>`,
  },
  {
    name: "¿Qué significa?",
    qfmt: `<div class="gt">
  ${HEAD}
  <div class="gt-example"><span>{{Ejemplo}}</span></div>
</div>`,
    afmt: `<div class="gt">
  ${HEAD}
  <div class="gt-example"><span>{{Ejemplo}}</span>{{tts en_US:Ejemplo}}</div>
  <hr id="answer">
  <div class="gt-meaning">{{Significado}}</div>
  <div class="gt-es">{{Traducción del ejemplo}}</div>
  ${NOTE}
</div>`,
  },
];

const CSS = `${PREMADE_BASE_CSS}.gt { max-width: 34rem; margin: 0 auto; }
.gt-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.gt-word { font-size: 1.875rem; font-weight: 700; letter-spacing: -0.02em; }
.gt-es { font-size: 1rem; opacity: 0.7; }
.gt-cloze { margin: 0.75rem 0 1rem; font-size: 1.375rem; font-weight: 600; line-height: 1.4; }
.gt-example { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin: 0.75rem 0; padding: 0.75rem 1rem; border-radius: 0.875rem; background: var(--premade-soft); font-size: 1.125rem; font-weight: 500; }
.gt hr#answer { margin: 1.25rem 0; }
.gt-expr { font-size: 1.125rem; }
.gt-meaning { font-size: 1.375rem; font-weight: 600; margin-bottom: 0.25rem; }
.gt-note { margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.75; }
`;

export function blankOut(example: string, answer: string) {
  return example.replace(answer, BLANK);
}

function buildCollection(locale: Locale) {
  return buildPremadeCollection({
    idBase: ID_BASE,
    guidPrefix: "fc-get",
    tag: "get",
    rootName: "Uses of get (EN → ES)",
    description: getDeck.text[locale].description,
    noteType: { name: "Use of get (EN → ES)", fields: FIELDS, templates: TEMPLATES, css: CSS },
    groups: GET_GROUPS.map((group) => ({
      name: group.name,
      tag: group.tag,
      notes: group.uses.map(([expression, meaning, example, answer, exampleTranslation, note]) => ({
        key: expression,
        fields: [expression, meaning, example, answer, exampleTranslation, blankOut(example, answer), note ?? ""],
      })),
    })),
    siblingGap: SIBLING_GAP,
  });
}

const allUses = GET_GROUPS.flatMap((group) => group.uses);

function sample(expression: string) {
  const [front, back] = allUses.find((entry) => entry[0] === expression)!;
  return { front, back };
}

export const getDeck: PremadeDeck = {
  slug: "get",
  title: "Uses of get",
  text: {
    en: {
      summary: `${allUses.length} everyday uses of «get», the most versatile verb in English, with typed answers and audio.`,
      description:
        "«Get» changes meaning with every word around it: get a job, get home, get tired, get it, get fired, get your hair cut, get used to, get along. The deck groups its uses by meaning. One card gives you a sentence in Spanish and asks you to type the missing English chunk (got married, getting dark); the other shows the expression in context and asks what it means. Pronunciation uses your device's voice.",
      languages: "English → Spanish",
      level: "Intermediate",
      tags: ["English", "Grammar", "Typed answers", "With audio"],
    },
    es: {
      summary: `${allUses.length} usos cotidianos de «get», el verbo más versátil del inglés, con respuesta escrita y audio.`,
      description:
        "«Get» cambia de significado con cada palabra que lo acompaña: get a job, get home, get tired, get it, get fired, get your hair cut, get used to, get along. El mazo agrupa sus usos por significado. Una tarjeta te da una frase en español y te pide escribir el pedazo que falta en inglés (got married, getting dark); la otra muestra la expresión en contexto y te pregunta qué significa. La pronunciación usa la voz de tu dispositivo.",
      languages: "Inglés → Español",
      level: "Intermedio",
      tags: ["Inglés", "Gramática", "Respuesta escrita", "Con audio"],
    },
  },
  cardCount: allUses.length * TEMPLATES.length,
  subdecks: GET_GROUPS.map((group) => ({ name: group.name, count: group.uses.length * TEMPLATES.length })),
  samples: ["get a job", "get home", "get nervous", "get the joke", "get fired", "get used to"].map(sample),
  rootAnkiId: premadeIds(ID_BASE).rootDeck,
  build: buildCollection,
};
