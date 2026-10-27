import { htmlToText } from "@/lib/anki/render";
import type { DictionaryEntry, DictionaryResult, LanguageCode } from "./types";

const USER_AGENT = "Flashcards/1.0 (https://axlsantos.dev)";
const MAX_SENSES = 8;
const MAX_EXAMPLES = 2;
const NOISE = new Set(["Symbol", "Letter", "Number"]);

export class NotFoundError extends Error {}

interface WiktionaryDefinition {
  definition?: string;
  examples?: string[];
  parsedExamples?: Array<{ example?: string }>;
}

type WiktionaryResponse = Record<string, Array<{ partOfSpeech?: string; language?: string; definitions?: WiktionaryDefinition[] }>>;

interface PhoneticResponse {
  phonetic?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: Array<{ partOfSpeech?: string; synonyms?: string[]; definitions?: Array<{ synonyms?: string[] }> }>;
}

const MAX_SYNONYMS = 6;
const EMPTY_SOUND = { phonetic: null, audio: null, synonyms: {} as Record<string, string[]> };

function clean(html: string) {
  return htmlToText(html).replace(/\s*\n\s*/g, " ").trim();
}

export function parseWiktionary(body: WiktionaryResponse, language: LanguageCode | "auto"): DictionaryEntry[] {
  const entries: DictionaryEntry[] = [];
  for (const [code, sections] of Object.entries(body)) {
    if (!Array.isArray(sections)) continue;
    for (const section of sections) {
      const senses = (section.definitions ?? [])
        .map((item) => ({
          definition: clean(item.definition ?? ""),
          examples: (item.parsedExamples?.map((example) => example.example ?? "") ?? item.examples ?? [])
            .map(clean)
            .filter(Boolean)
            .slice(0, MAX_EXAMPLES),
        }))
        .filter((sense) => sense.definition.length > 0)
        .slice(0, MAX_SENSES);
      if (senses.length === 0) continue;
      entries.push({ language: code, languageName: section.language ?? code, partOfSpeech: section.partOfSpeech ?? "", senses, synonyms: [] });
    }
  }
  const useful = entries.some((entry) => !NOISE.has(entry.partOfSpeech)) ? entries.filter((entry) => !NOISE.has(entry.partOfSpeech)) : entries;
  if (language === "auto") return useful.sort((a, b) => Number(b.language === "en") - Number(a.language === "en"));
  return useful.filter((entry) => entry.language === language);
}

export function parsePhonetics(body: PhoneticResponse[] | unknown) {
  if (!Array.isArray(body)) return EMPTY_SOUND;
  const responses = body as PhoneticResponse[];
  const items = responses.flatMap((entry) => [{ text: entry.phonetic, audio: undefined }, ...(entry.phonetics ?? [])]);
  const phonetic = items.find((item) => item.text)?.text ?? null;
  const audios = items.map((item) => item.audio).filter((audio): audio is string => Boolean(audio && /^https:\/\//.test(audio)));
  const synonyms: Record<string, string[]> = {};
  for (const meaning of responses.flatMap((entry) => entry.meanings ?? [])) {
    const kind = meaning.partOfSpeech?.toLowerCase();
    if (!kind) continue;
    const words = [...(meaning.synonyms ?? []), ...(meaning.definitions ?? []).flatMap((definition) => definition.synonyms ?? [])];
    synonyms[kind] = Array.from(new Set([...(synonyms[kind] ?? []), ...words.map((word) => word.trim()).filter(Boolean)])).slice(0, MAX_SYNONYMS);
  }
  return { phonetic, audio: audios.find((audio) => /-us\.mp3$/.test(audio)) ?? audios[0] ?? null, synonyms };
}

async function fetchWiktionary(word: string) {
  const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.replace(/ /g, "_"))}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`dictionary failed: ${response.status}`);
  return (await response.json()) as WiktionaryResponse;
}

async function fetchPhonetics(word: string) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      signal: AbortSignal.timeout(6_000),
      cache: "no-store",
    });
    return response.ok ? parsePhonetics(await response.json()) : EMPTY_SOUND;
  } catch {
    return EMPTY_SOUND;
  }
}

export async function lookupWord(word: string, language: LanguageCode | "auto"): Promise<DictionaryResult> {
  const candidates = Array.from(new Set([word, word.toLocaleLowerCase()]));
  const english = language === "en" || language === "auto";
  const phonetics = english ? fetchPhonetics(word.toLocaleLowerCase()) : Promise.resolve(EMPTY_SOUND);
  for (const candidate of candidates) {
    const body = await fetchWiktionary(candidate);
    if (!body) continue;
    const entries = parseWiktionary(body, language);
    if (entries.length === 0) continue;
    const sound = entries.some((entry) => entry.language === "en") ? await phonetics : EMPTY_SOUND;
    return {
      word: candidate,
      phonetic: sound.phonetic,
      audio: sound.audio,
      entries: entries.map((entry) => (entry.language === "en" ? { ...entry, synonyms: sound.synonyms[entry.partOfSpeech.toLowerCase()] ?? [] } : entry)),
      sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(candidate.replace(/ /g, "_"))}`,
    };
  }
  throw new NotFoundError(word);
}
