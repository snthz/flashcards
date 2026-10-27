import { PREMADE_BASE_CSS } from "@/lib/premade/style";
import { intlLocale, type Locale } from "@/lib/i18n/config";
import type { LanguageCode } from "./types";

const TTS_LANG: Record<LanguageCode, string> = {
  en: "en_US",
  es: "es_MX",
  fr: "fr_FR",
  de: "de_DE",
  it: "it_IT",
  pt: "pt_BR",
  nl: "nl_NL",
  ru: "ru_RU",
  ja: "ja_JP",
  ko: "ko_KR",
  zh: "zh_CN",
  ar: "ar_SA",
  hi: "hi_IN",
  tr: "tr_TR",
  pl: "pl_PL",
  sv: "sv_SE",
};

export function speechLocale(language: LanguageCode) {
  return TTS_LANG[language].replace("_", "-");
}

const NAMES: Record<Locale, { noteType: (language: string) => string; fields: string[]; synonyms: string; forward: string; reverse: string }> = {
  en: {
    noteType: (language) => `Translator word (${language})`,
    fields: ["Term", "Meaning", "Kind", "Synonyms", "Example", "Example translation", "Notes", "Recognize", "Recall"],
    synonyms: "Synonyms",
    forward: "Term → meaning",
    reverse: "Meaning → term",
  },
  es: {
    noteType: (language) => `Palabra del traductor (${language})`,
    fields: ["Término", "Significado", "Tipo", "Sinónimos", "Ejemplo", "Traducción del ejemplo", "Notas", "Reconocer", "Recordar"],
    synonyms: "Sinónimos",
    forward: "Término → significado",
    reverse: "Significado → término",
  },
};

const CSS = `${PREMADE_BASE_CSS}.tw { max-width: 34rem; margin: 0 auto; }
.tw-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.tw-word { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; }
.tw-prompt { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.01em; }
.tw hr#answer { margin: 1.25rem 0; }
.tw-meaning { font-size: 1.375rem; font-weight: 600; }
.tw-kind { margin-top: 0.25rem; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.55; }
.tw-synonyms { margin-top: 0.75rem; font-size: 0.95rem; }
.tw-synonyms span { opacity: 0.55; }
.tw-example { margin-top: 1.25rem; padding: 0.75rem 1rem; border-radius: 0.875rem; background: var(--premade-soft); }
.tw-example-term { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-weight: 500; }
.tw-example-meaning { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.7; }
.tw-note { margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.75; }
`;

function languageName(code: LanguageCode, locale: Locale) {
  try {
    const name = new Intl.DisplayNames([intlLocale(locale)], { type: "language" }).of(code) ?? code;
    return name.charAt(0).toLocaleUpperCase() + name.slice(1);
  } catch {
    return code;
  }
}

export function noteTypeName(language: LanguageCode, locale: Locale) {
  return NAMES[locale].noteType(languageName(language, locale));
}

export function vocabularyNoteType(language: LanguageCode, locale: Locale) {
  const names = NAMES[locale];
  const [term, meaning, kind, synonyms, example, exampleTranslation, notes, forward, reverse] = names.fields;
  const tts = TTS_LANG[language];
  const head = `<div class="tw-head"><span class="tw-word">{{${term}}}</span>{{tts ${tts}:${term}}}</div>`;
  const prompt = `<div class="tw-prompt">{{${meaning}}}</div>
  {{#${kind}}}<div class="tw-kind">{{${kind}}}</div>{{/${kind}}}`;
  const details = `{{#${synonyms}}}<div class="tw-synonyms"><span>${names.synonyms}:</span> {{${synonyms}}}</div>{{/${synonyms}}}
  {{#${example}}}<div class="tw-example">
    <div class="tw-example-term"><span>{{${example}}}</span>{{tts ${tts}:${example}}}</div>
    {{#${exampleTranslation}}}<div class="tw-example-meaning">{{${exampleTranslation}}}</div>{{/${exampleTranslation}}}
  </div>{{/${example}}}
  {{#${notes}}}<div class="tw-note">{{${notes}}}</div>{{/${notes}}}`;
  return {
    name: noteTypeName(language, locale),
    fields: names.fields.map((name) => ({ name })),
    templates: [
      {
        name: names.forward,
        qfmt: `{{#${forward}}}<div class="tw">
  ${head}
</div>{{/${forward}}}`,
        afmt: `<div class="tw">
  ${head}
  <hr id="answer">
  <div class="tw-meaning">{{${meaning}}}</div>
  {{#${kind}}}<div class="tw-kind">{{${kind}}}</div>{{/${kind}}}
  ${details}
</div>`,
      },
      {
        name: names.reverse,
        qfmt: `{{#${reverse}}}<div class="tw">
  ${prompt}
</div>{{/${reverse}}}`,
        afmt: `<div class="tw">
  ${prompt}
  <hr id="answer">
  ${head}
  ${details}
</div>`,
      },
    ],
    css: CSS,
  };
}

export function vocabularyFields(card: {
  term: string;
  meaning: string;
  kind: string;
  synonyms: string;
  example: string;
  exampleTranslation: string;
  notes: string;
  direction: "forward" | "reverse" | "both";
}) {
  return [
    card.term,
    card.meaning,
    card.kind,
    card.synonyms,
    card.example,
    card.example ? card.exampleTranslation : "",
    card.notes,
    card.direction === "reverse" ? "" : "y",
    card.direction === "forward" ? "" : "y",
  ].map(textToField);
}

export function textToField(text: string) {
  return text
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "<br>");
}
