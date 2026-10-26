import type { Locale } from "@/lib/i18n/config";
import { buildPremadeCollection, premadeIds } from "../build";
import { PREMADE_BASE_CSS } from "../style";
import type { PremadeDeck } from "../types";
import { feedback } from "./data/feedback";
import { help } from "./data/help";
import { hiring } from "./data/hiring";
import { meetings } from "./data/meetings";
import { messages } from "./data/messages";
import { scheduling } from "./data/scheduling";
import { smallTalk } from "./data/small-talk";
import { standups } from "./data/standups";
import type { WorkPhrase } from "./types";

export const PHRASE_GROUPS: Array<{ name: string; tag: string; phrases: WorkPhrase[] }> = [
  { name: "Standups y avances", tag: "standups", phrases: standups },
  { name: "Juntas y videollamadas", tag: "juntas", phrases: meetings },
  { name: "Correo y chat", tag: "correo-chat", phrases: messages },
  { name: "Plazos y agenda", tag: "plazos", phrases: scheduling },
  { name: "Feedback y opiniones", tag: "feedback", phrases: feedback },
  { name: "Pedir ayuda", tag: "ayuda", phrases: help },
  { name: "Small talk", tag: "small-talk", phrases: smallTalk },
  { name: "Entrevistas y RR. HH.", tag: "entrevistas", phrases: hiring },
];

const ID_BASE = 9_104_000_000_000n;
const SIBLING_GAP = 10;

const FIELDS = ["Inglés", "Español", "Ejemplo", "Traducción del ejemplo", "Notas"];

const ENGLISH_HEAD = `<div class="rw-head"><span class="rw-phrase">{{Inglés}}</span>{{tts en_US:Inglés}}</div>`;

const SPANISH_HEAD = `<div class="rw-prompt">{{Español}}</div>
  <div class="rw-hint">¿Cómo lo dices en inglés?</div>`;

const EXAMPLE = `<div class="rw-example">
    <div class="rw-example-en"><span>{{Ejemplo}}</span>{{tts en_US:Ejemplo}}</div>
    <div class="rw-example-es">{{Traducción del ejemplo}}</div>
  </div>
  {{#Notas}}<div class="rw-note">{{Notas}}</div>{{/Notas}}`;

const TEMPLATES = [
  {
    name: "Inglés → Español",
    qfmt: `<div class="rw">
  ${ENGLISH_HEAD}
</div>`,
    afmt: `<div class="rw">
  ${ENGLISH_HEAD}
  <hr id="answer">
  <div class="rw-meaning">{{Español}}</div>
  ${EXAMPLE}
</div>`,
  },
  {
    name: "Español → Inglés",
    qfmt: `<div class="rw">
  ${SPANISH_HEAD}
</div>`,
    afmt: `<div class="rw">
  ${SPANISH_HEAD}
  <hr id="answer">
  ${ENGLISH_HEAD}
  ${EXAMPLE}
</div>`,
  },
];

const CSS = `${PREMADE_BASE_CSS}.rw { max-width: 34rem; margin: 0 auto; }
.rw-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.rw-phrase { font-size: 1.625rem; font-weight: 700; letter-spacing: -0.015em; line-height: 1.25; }
.rw-prompt { font-size: 1.5rem; font-weight: 700; line-height: 1.3; }
.rw-hint { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.6; }
.rw hr#answer { margin: 1.25rem 0; }
.rw-meaning { font-size: 1.25rem; font-weight: 600; }
.rw-example { margin-top: 1.25rem; padding: 0.75rem 1rem; border-radius: 0.875rem; background: var(--premade-soft); }
.rw-example-en { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-weight: 500; }
.rw-example-es { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.7; }
.rw-note { margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.75; }
`;

function buildCollection(locale: Locale) {
  return buildPremadeCollection({
    idBase: ID_BASE,
    guidPrefix: "fc-rw",
    tag: "remote-work",
    rootName: "English for remote work (EN ↔ ES)",
    description: remoteWorkDeck.text[locale].description,
    noteType: { name: "Work phrase (EN ↔ ES)", fields: FIELDS, templates: TEMPLATES, css: CSS },
    groups: PHRASE_GROUPS.map((group) => ({
      name: group.name,
      tag: group.tag,
      notes: group.phrases.map(([phrase, translation, example, exampleTranslation, note]) => ({
        key: phrase,
        fields: [phrase, translation, example, exampleTranslation, note ?? ""],
      })),
    })),
    siblingGap: SIBLING_GAP,
  });
}

const allPhrases = PHRASE_GROUPS.flatMap((group) => group.phrases);

function sample(phrase: string) {
  const [front, back] = allPhrases.find((entry) => entry[0] === phrase)!;
  return { front, back };
}

export const remoteWorkDeck: PremadeDeck = {
  slug: "remote-work",
  title: "English for remote work",
  text: {
    en: {
      summary: `${allPhrases.length} English phrases for standups, calls, Slack and interviews, practiced in both directions.`,
      description:
        "Ready-to-use phrases for working remotely with English-speaking teams: standups, video calls, email and chat, deadlines and time zones, feedback and polite disagreement, asking for help, small talk, and interviews and HR. One card shows the English phrase; the other gives you the Spanish version so you practice saying it. Each card has a realistic example and usage notes. Pronunciation uses your device's voice.",
      languages: "English ↔ Spanish",
      level: "Intermediate",
      tags: ["English", "Work", "With audio"],
    },
    es: {
      summary: `${allPhrases.length} frases en inglés para standups, llamadas, Slack y entrevistas, para practicar en ambos sentidos.`,
      description:
        "Frases listas para usar al trabajar en remoto con equipos que hablan inglés: standups, videollamadas, correo y chat, plazos y zonas horarias, feedback y cómo disentir con tacto, pedir ayuda, small talk, y entrevistas y RR. HH. Una tarjeta muestra la frase en inglés; la otra te da la versión en español para que practiques decirla. Cada tarjeta trae un ejemplo realista y notas de uso. La pronunciación usa la voz de tu dispositivo.",
      languages: "Inglés ↔ Español",
      level: "Intermedio",
      tags: ["Inglés", "Trabajo", "Con audio"],
    },
  },
  cardCount: allPhrases.length * TEMPLATES.length,
  subdecks: PHRASE_GROUPS.map((group) => ({ name: group.name, count: group.phrases.length * TEMPLATES.length })),
  samples: ["You're on mute.", "I'll keep you posted.", "Let's take this offline.", "Just following up on…", "I'm on the fence.", "Have a good one!"].map(sample),
  rootAnkiId: premadeIds(ID_BASE).rootDeck,
  build: buildCollection,
};
