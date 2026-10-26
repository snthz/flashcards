import type { Locale } from "@/lib/i18n/config";
import { buildPremadeCollection, premadeIds } from "../build";
import { PREMADE_BASE_CSS } from "../style";
import type { PremadeDeck } from "../types";
import { allDifferent } from "./data/all-different";
import { allSame } from "./data/all-same";
import { alsoRegular } from "./data/also-regular";
import { participleLikeBase } from "./data/participle-like-base";
import { samePastParticiple } from "./data/same-past-participle";
import type { IrregularVerb, PatternGroup } from "./types";

export const PATTERN_GROUPS: PatternGroup[] = [
  { name: "Pasado y participio iguales", tag: "pasado-participio", verbs: samePastParticiple },
  { name: "Tres formas distintas", tag: "tres-distintas", verbs: allDifferent },
  { name: "Tres formas iguales", tag: "tres-iguales", verbs: allSame },
  { name: "Participio igual a la base", tag: "participio-base", verbs: participleLikeBase },
  { name: "También regulares", tag: "tambien-regulares", verbs: alsoRegular },
];

const ID_BASE = 9_101_000_000_000n;

const FIELDS = ["Infinitivo", "Pasado simple", "Participio", "Traducción", "Ejemplo", "Traducción del ejemplo", "Notas", "Pronunciación"];

export const SPOKEN_FORMS: Record<string, string> = {
  be: "be, was, were, been",
  read: "read, red, red",
  tear: "tare, tore, torn",
};

const FRONT = `<div class="iv">
  <div class="iv-head"><span class="iv-base">{{Infinitivo}}</span>{{tts en_US:Infinitivo}}</div>
  <div class="iv-meaning">{{Traducción}}</div>
</div>`;

const BACK = `<div class="iv">
  <div class="iv-head"><span class="iv-base">{{Infinitivo}}</span>{{tts en_US:Pronunciación}}</div>
  <div class="iv-meaning">{{Traducción}}</div>
  <hr id="answer">
  <div class="iv-forms">
    <div class="iv-form"><span class="iv-label">Infinitivo</span><span class="iv-value">{{Infinitivo}}</span></div>
    <div class="iv-form"><span class="iv-label">Pasado</span><span class="iv-value">{{Pasado simple}}</span></div>
    <div class="iv-form"><span class="iv-label">Participio</span><span class="iv-value">{{Participio}}</span></div>
  </div>
  <div class="iv-example">
    <div class="iv-example-en"><span>{{Ejemplo}}</span>{{tts en_US:Ejemplo}}</div>
    <div class="iv-example-es">{{Traducción del ejemplo}}</div>
  </div>
  {{#Notas}}<div class="iv-note">{{Notas}}</div>{{/Notas}}
</div>`;

const CSS = `${PREMADE_BASE_CSS}.iv { max-width: 34rem; margin: 0 auto; }
.iv-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.iv-base { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; }
.iv-meaning { margin-top: 0.25rem; font-size: 1.05rem; opacity: 0.7; }
.iv hr#answer { margin: 1.25rem 0; }
.iv-forms { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
.iv-form { display: flex; flex-direction: column; gap: 0.125rem; }
.iv-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.55; }
.iv-value { font-size: 1.25rem; font-weight: 600; overflow-wrap: anywhere; }
.iv-example { margin-top: 1.25rem; padding: 0.75rem 1rem; border-radius: 0.875rem; background: var(--premade-soft); }
.iv-example-en { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-weight: 500; }
.iv-example-es { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.7; }
.iv-note { margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.75; }
`;

function firstVariant(form: string) {
  return form.split(" / ")[0];
}

export function spokenForms([base, past, participle]: IrregularVerb) {
  return SPOKEN_FORMS[base] ?? [base, past, participle].map(firstVariant).join(", ");
}

function buildCollection(locale: Locale) {
  return buildPremadeCollection({
    idBase: ID_BASE,
    guidPrefix: "fc-iv",
    tag: "irregular-verbs",
    rootName: "Irregular verbs (EN → ES)",
    description: irregularVerbsDeck.text[locale].description,
    noteType: {
      name: "Irregular verb (EN → ES)",
      fields: FIELDS,
      templates: [{ name: "Infinitivo → formas", qfmt: FRONT, afmt: BACK }],
      css: CSS,
    },
    groups: PATTERN_GROUPS.map((group) => ({
      name: group.name,
      tag: group.tag,
      notes: group.verbs.map((verb) => {
        const [base, past, participle, translation, example, exampleTranslation, note] = verb;
        return {
          key: base,
          fields: [base, past, participle, translation, example, exampleTranslation, note ?? "", spokenForms(verb)],
        };
      }),
    })),
  });
}

const allVerbs = PATTERN_GROUPS.flatMap((group) => group.verbs);

function sample(verbs: IrregularVerb[], base: string) {
  const [front, past, participle] = verbs.find((verb) => verb[0] === base)!;
  return { front, back: `${past} · ${participle}` };
}

export const irregularVerbsDeck: PremadeDeck = {
  slug: "irregular-verbs",
  title: "Irregular verbs",
  text: {
    en: {
      summary: `The ${allVerbs.length} most useful English irregular verbs, with their past forms, examples and pronunciation.`,
      description:
        "English irregular verbs grouped by pattern: past and participle alike (buy → bought), three different forms (go → went → gone), all three the same (cut), participle like the base (come → came → come) and verbs that also have a regular form (learned / learnt). Each card shows the verb and its Spanish meaning; the answer has the past simple, the past participle, an example with its translation and usage notes. Pronunciation uses your device's voice.",
      languages: "English → Spanish",
      level: "Beginner",
      tags: ["English", "Grammar", "With audio"],
    },
    es: {
      summary: `Los ${allVerbs.length} verbos irregulares más útiles del inglés, con su pasado, ejemplos y pronunciación.`,
      description:
        "Verbos irregulares del inglés agrupados por patrón: pasado y participio iguales (buy → bought), tres formas distintas (go → went → gone), las tres iguales (cut), participio igual a la base (come → came → come) y verbos que también tienen forma regular (learned / learnt). Cada tarjeta muestra el verbo y su significado; la respuesta trae el pasado simple, el participio, un ejemplo con su traducción y notas de uso. La pronunciación usa la voz de tu dispositivo.",
      languages: "Inglés → Español",
      level: "Básico",
      tags: ["Inglés", "Gramática", "Con audio"],
    },
  },
  cardCount: allVerbs.length,
  subdecks: PATTERN_GROUPS.map((group) => ({ name: group.name, count: group.verbs.length })),
  samples: ["go", "buy", "take", "put", "come", "learn"].map((base) => sample(allVerbs, base)),
  rootAnkiId: premadeIds(ID_BASE).rootDeck,
  build: buildCollection,
};
