import { htmlToText } from "@/lib/anki/render";
import { isLanguage, type LanguageCode } from "@/lib/translate/types";
import type { Cloze, PracticeItem } from "./types";

const TERM = ["term", "término", "inglés", "english", "word", "palabra", "verbo", "verb", "infinitivo", "infinitive", "expresión", "expression", "phrase", "frase", "front", "anverso", "frente"];
const MEANING = ["meaning", "significado", "español", "spanish", "traducción", "translation", "back", "reverso", "definición", "definition"];
const EXAMPLE = ["example", "ejemplo", "example sentence"];
const EXAMPLE_TRANSLATION = ["example translation", "traducción del ejemplo"];
const ANSWER = ["respuesta", "answer"];
const PAST = ["pasado simple", "past simple", "simple past", "past"];
const PARTICIPLE = ["participio", "past participle", "participle"];

const TTS = /\{\{tts\s+([a-z]{2})(?:[_-][A-Za-z]{2})?\b[^:}]*:([^}]+)\}\}/g;

export interface NoteTypeShape {
  name: string;
  fields: string[];
  templates: Array<{ qfmt?: string; afmt?: string }>;
}

function find(fields: string[], aliases: string[], skip: number[] = []) {
  const lower = fields.map((field) => field.trim().toLowerCase());
  for (const alias of aliases) {
    const index = lower.findIndex((field, position) => field === alias && !skip.includes(position));
    if (index >= 0) return index;
  }
  return -1;
}

export function fieldLanguages(templates: NoteTypeShape["templates"]) {
  const languages = new Map<string, LanguageCode>();
  for (const template of templates) {
    for (const source of [template.qfmt ?? "", template.afmt ?? ""]) {
      for (const match of source.matchAll(TTS)) {
        const code = match[1].toLowerCase();
        if (isLanguage(code) && !languages.has(match[2].trim())) languages.set(match[2].trim(), code);
      }
    }
  }
  return languages;
}

function guessLanguage(name: string): LanguageCode | null {
  if (/\bEN\b|english|inglés/i.test(name)) return "en";
  if (/\bES\b|spanish|español/i.test(name)) return "es";
  return null;
}

function clean(html: string | undefined) {
  if (!html) return "";
  return htmlToText(html).replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inflections(word: string) {
  const forms = new Set([word, `${word}s`, `${word}es`, `${word}ed`, `${word}d`, `${word}ing`]);
  if (word.endsWith("e")) forms.add(`${word.slice(0, -1)}ing`);
  if (word.endsWith("y")) {
    forms.add(`${word.slice(0, -1)}ies`);
    forms.add(`${word.slice(0, -1)}ied`);
  }
  if (/[^aeiou][aeiou][bdgmnprt]$/.test(word)) {
    forms.add(`${word}${word.at(-1)}ed`);
    forms.add(`${word}${word.at(-1)}ing`);
  }
  return [...forms].sort((a, b) => b.length - a.length);
}

export function makeCloze(example: string, candidates: string[]): Cloze | null {
  if (!example) return null;
  for (const raw of candidates) {
    const candidate = raw.replace(/^to\s+/i, "").trim();
    if (!candidate || candidate.length > 60) continue;
    const words = candidate.split(/\s+/);
    const options = words.length === 1 ? inflections(candidate.toLowerCase()) : [candidate];
    for (const option of options) {
      const pattern = new RegExp(`(?<![\\p{L}\\p{N}'])${escapeRegExp(option)}(?![\\p{L}\\p{N}])`, "iu");
      const match = pattern.exec(example);
      if (match) {
        return { before: example.slice(0, match.index), answer: match[0], after: example.slice(match.index + match[0].length) };
      }
    }
  }
  return null;
}

export function extractItem(id: string, noteType: NoteTypeShape, values: string[], deckName: string): PracticeItem | null {
  const termIndex = find(noteType.fields, TERM);
  const meaningIndex = find(noteType.fields, MEANING, [termIndex]);
  if (termIndex < 0 || meaningIndex < 0) return null;
  const term = clean(values[termIndex]);
  const meaning = clean(values[meaningIndex]);
  if (!term || !meaning || term.length > 80 || meaning.length > 160 || term.toLowerCase() === meaning.toLowerCase()) return null;

  const languages = fieldLanguages(noteType.templates);
  const exampleIndex = find(noteType.fields, EXAMPLE);
  const exampleName = exampleIndex >= 0 ? noteType.fields[exampleIndex] : "";
  const language = languages.get(noteType.fields[termIndex]) ?? languages.get(exampleName) ?? [...languages.values()][0] ?? guessLanguage(noteType.name);
  const value = (aliases: string[]) => {
    const index = find(noteType.fields, aliases);
    return index >= 0 ? clean(values[index]) : "";
  };

  return {
    id,
    term,
    meaning,
    language,
    example: exampleIndex >= 0 ? clean(values[exampleIndex]) : "",
    exampleTranslation: value(EXAMPLE_TRANSLATION),
    answer: value(ANSWER),
    past: value(PAST),
    participle: value(PARTICIPLE),
    deckName,
  };
}

export function itemCloze(item: PracticeItem) {
  return makeCloze(item.example, [item.answer, item.term, ...item.past.split(/[\/,]/), ...item.participle.split(/[\/,]/)].map((value) => value.trim()).filter(Boolean));
}
