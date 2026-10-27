export const LANGUAGES = ["en", "es", "fr", "de", "it", "pt", "nl", "ru", "ja", "ko", "zh", "ar", "hi", "tr", "pl", "sv"] as const;

export type LanguageCode = (typeof LANGUAGES)[number];

export const CLAUDE_MODELS = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"] as const;

export type ClaudeModel = (typeof CLAUDE_MODELS)[number];

export const DEFAULT_CLAUDE_MODEL: ClaudeModel = "claude-opus-5-5";

export const MAX_TEXT = 2000;
export const MAX_CONTEXT = 1000;

export interface TranslateInput {
  text: string;
  source: LanguageCode | "auto";
  target: LanguageCode;
  context?: string;
}

export interface TranslationResult {
  provider: "claude" | "free";
  source: string | null;
  target: LanguageCode;
  text: string;
  translation: string;
  literal: string | null;
  alternatives: Array<{ text: string; note: string }>;
  notes: string[];
  examples: Array<{ source: string; translation: string }>;
  warning?: "claude-unavailable";
}

export interface DictionarySense {
  definition: string;
  examples: string[];
}

export interface DictionaryEntry {
  language: string;
  languageName: string;
  partOfSpeech: string;
  senses: DictionarySense[];
}

export interface DictionaryResult {
  word: string;
  phonetic: string | null;
  audio: string | null;
  entries: DictionaryEntry[];
  sourceUrl: string;
}

export type TranslateError = "empty" | "too-long" | "rate-limited" | "quota" | "invalid-key" | "refused" | "unavailable" | "not-found";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: TranslateError };

export function isLanguage(value: unknown): value is LanguageCode {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

export function isClaudeModel(value: unknown): value is ClaudeModel {
  return typeof value === "string" && (CLAUDE_MODELS as readonly string[]).includes(value);
}
