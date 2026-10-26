import type { Locale } from "@/lib/i18n/config";
import { buildPremadeCollection, premadeIds, slugify } from "../build";
import { PREMADE_BASE_CSS } from "../style";
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

const ID_BASE = 9_100_000_000_000n;

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

const CSS = `${PREMADE_BASE_CSS}.pv { max-width: 34rem; margin: 0 auto; }
.pv-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.pv-verb { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; }
.pv hr#answer { margin: 1.25rem 0; }
.pv-meaning { font-size: 1.375rem; font-weight: 600; }
.pv-def { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.65; font-style: italic; }
.pv-example { margin-top: 1.25rem; padding: 0.75rem 1rem; border-radius: 0.875rem; background: var(--premade-soft); }
.pv-example-en { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-weight: 500; }
.pv-example-es { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.7; }
.pv-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; margin-top: 1rem; font-size: 0.875rem; }
.pv-chip { padding: 0.125rem 0.625rem; border: 1px solid currentColor; border-radius: 999px; font-size: 0.75rem; font-weight: 600; opacity: 0.6; }
.pv-syn { opacity: 0.75; }
.pv-syn b { font-weight: 600; }
.pv-note { margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.75; }
`;

function buildCollection(locale: Locale) {
  return buildPremadeCollection({
    idBase: ID_BASE,
    guidPrefix: "fc-pv",
    tag: "phrasal-verbs",
    rootName: "Phrasal verbs (EN → ES)",
    description: phrasalVerbsDeck.text[locale].description,
    noteType: {
      name: "Phrasal verb (EN → ES)",
      fields: FIELDS,
      templates: [{ name: "Inglés → Español", qfmt: FRONT, afmt: BACK }],
      css: CSS,
    },
    groups: PHRASAL_GROUPS.map((group) => ({
      name: group.name,
      tag: slugify(group.name.split(" ")[0]),
      notes: group.verbs.map(([verb, translation, definition, example, exampleTranslation, synonyms, kind, note]) => ({
        key: verb,
        fields: [verb, translation, definition, example, exampleTranslation, synonyms, KIND_LABELS[kind], note ?? ""],
      })),
    })),
  });
}

const allVerbs = PHRASAL_GROUPS.flatMap((group) => group.verbs);

export const phrasalVerbsDeck: PremadeDeck = {
  slug: "phrasal-verbs",
  title: "Phrasal verbs",
  text: {
    en: {
      summary: `The ${allVerbs.length} most common English phrasal verbs, with examples, synonyms and pronunciation.`,
      description:
        "Everyday English phrasal verbs grouped by particle (up, out, off…). Each card has the Spanish translation, a short English definition, an example with its translation, synonyms, whether the verb is separable and usage notes. Pronunciation uses your device's voice.",
      languages: "English → Spanish",
      level: "Intermediate",
      tags: ["English", "Vocabulary", "With audio"],
    },
    es: {
      summary: `Los ${allVerbs.length} phrasal verbs más usados del inglés, con ejemplos, sinónimos y pronunciación.`,
      description:
        "Phrasal verbs del inglés cotidiano agrupados por partícula (up, out, off…). Cada tarjeta trae la traducción al español, una definición corta en inglés, un ejemplo con su traducción, sinónimos, si el verbo es separable y notas de uso. La pronunciación usa la voz de tu dispositivo.",
      languages: "Inglés → Español",
      level: "Intermedio",
      tags: ["Inglés", "Vocabulario", "Con audio"],
    },
  },
  cardCount: allVerbs.length,
  subdecks: PHRASAL_GROUPS.map((group) => ({ name: group.name, count: group.verbs.length })),
  samples: [up[0], out[0], off[1], down[0], on[3], back[0]].map(([verb, translation]) => ({ front: verb, back: translation })),
  rootAnkiId: premadeIds(ID_BASE).rootDeck,
  build: buildCollection,
};
