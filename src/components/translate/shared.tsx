"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import { lookupDictionary, translateText } from "@/lib/translate/actions";
import { isLanguage, LANGUAGES, MAX_CONTEXT, type DictionaryResult, type LanguageCode, type TranslateError, type TranslationResult } from "@/lib/translate/types";
import { cn } from "@/lib/utils";
import { swapDraft, type CardDraft } from "./save-card-dialog";

const LANG_KEY = "fc-translate-langs";
const RECENT_TRANSLATIONS = "fc-translate-recent";
const RECENT_WORDS = "fc-dictionary-recent";
const STORE_EVENT = "fc-translate-store";

export type Languages = { source: LanguageCode | "auto"; target: LanguageCode; word: LanguageCode | "auto" };
export type ToolError = TranslateError | "offline";

function fallbackLanguages(locale: string): Languages {
  const target: LanguageCode = locale === "es" ? "es" : "en";
  return { source: target === "en" ? "auto" : "en", target, word: "en" };
}

function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") as T | null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(STORE_EVENT));
  } catch {
    return;
  }
}

function rawItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribeStore(listener: () => void) {
  window.addEventListener(STORE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(STORE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function parseList<T>(raw: string | null, valid: (item: unknown) => item is T, max: number): T[] {
  try {
    const parsed = JSON.parse(raw ?? "null") as unknown;
    return Array.isArray(parsed) ? parsed.filter(valid).slice(0, max) : [];
  } catch {
    return [];
  }
}

function isTranslation(item: unknown): item is TranslationResult {
  const value = item as TranslationResult | null;
  return Boolean(value && typeof value.text === "string" && typeof value.translation === "string" && Array.isArray(value.alternatives));
}

function isWord(item: unknown): item is string {
  return typeof item === "string" && item.length > 0;
}

export function loadLanguages(locale: string): Languages {
  const fallback = fallbackLanguages(locale);
  const saved = readJson<Record<string, unknown>>(LANG_KEY);
  if (!saved) return fallback;
  return {
    source: saved.source === "auto" || isLanguage(saved.source) ? saved.source : fallback.source,
    target: isLanguage(saved.target) ? saved.target : fallback.target,
    word: saved.word === "auto" || isLanguage(saved.word) ? saved.word : fallback.word,
  };
}

function saveLanguages(locale: string, patch: Partial<Languages>) {
  writeJson(LANG_KEY, { ...loadLanguages(locale), ...patch });
}

function recentTranslations() {
  return parseList(rawItem(RECENT_TRANSLATIONS), isTranslation, 6);
}

function rememberTranslation(result: TranslationResult) {
  const key = result.text.trim().toLowerCase();
  const others = recentTranslations().filter((item) => !(item.text.trim().toLowerCase() === key && item.target === result.target));
  writeJson(RECENT_TRANSLATIONS, [result, ...others].slice(0, 6));
}

export function forgetTranslations() {
  writeJson(RECENT_TRANSLATIONS, []);
}

export function useRecentTranslations() {
  const raw = useSyncExternalStore(subscribeStore, () => rawItem(RECENT_TRANSLATIONS), () => null);
  return useMemo(() => parseList(raw, isTranslation, 6), [raw]);
}

function rememberWord(word: string) {
  const others = parseList(rawItem(RECENT_WORDS), isWord, 10).filter((item) => item.toLowerCase() !== word.toLowerCase());
  writeJson(RECENT_WORDS, [word, ...others].slice(0, 10));
}

export function forgetWords() {
  writeJson(RECENT_WORDS, []);
}

export function useRecentWords() {
  const raw = useSyncExternalStore(subscribeStore, () => rawItem(RECENT_WORDS), () => null);
  return useMemo(() => parseList(raw, isWord, 10), [raw]);
}

export function useLanguageName() {
  const { locale } = useI18n();
  return useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([intlLocale(locale)], { type: "language" });
    } catch {
      names = null;
    }
    return (code: string) => {
      const name = names?.of(code) ?? code;
      return name.charAt(0).toLocaleUpperCase() + name.slice(1);
    };
  }, [locale]);
}

export function speak(text: string, language: string) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  speechSynthesis.speak(utterance);
}

export function IconButton({ label, onClick, children, className }: { label: string; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LanguagePicker({
  value,
  onChange,
  label,
  auto,
  align = "left",
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  auto?: string;
  align?: "left" | "right";
}) {
  const languageName = useLanguageName();
  return (
    <div className={cn("relative flex min-w-0", align === "right" && "justify-end")}>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-9 min-w-0 max-w-full cursor-pointer appearance-none truncate rounded-lg bg-transparent pl-3 pr-8 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          align === "right" && "text-right",
        )}
      >
        {auto ? <option value="auto">{auto}</option> : null}
        {LANGUAGES.map((code) => (
          <option key={code} value={code}>
            {languageName(code)}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function failure(): { ok: false; error: TranslateError } {
  return { ok: false, error: "unavailable" };
}

function requestTranslation(text: string, langs: Languages, contexts: Array<string | null | undefined>) {
  const context = contexts
    .map((value) => value?.trim())
    .filter(Boolean)
    .join("\n\n")
    .slice(0, MAX_CONTEXT);
  return translateText({ text, source: langs.source, target: langs.target, context: context || undefined }).catch(failure);
}

function requestLookup(word: string, language: LanguageCode | "auto") {
  return lookupDictionary({ word, language }).catch(failure);
}

export function translationDraft(result: TranslationResult, uiLocale: string, sourceFallback: LanguageCode | null, literalLabel: string, chosen = result.translation): CardDraft {
  const source: LanguageCode = isLanguage(result.source) ? result.source : (sourceFallback ?? (result.target === "en" ? "es" : "en"));
  const others = [result.translation, ...result.alternatives.map((alt) => alt.text)].filter((text) => text !== chosen);
  const example = result.examples[0];
  const draft: CardDraft = {
    term: result.text,
    termLang: source,
    meaning: chosen,
    meaningLang: result.target,
    kind: result.kind ?? "",
    synonyms: { [result.target]: others.join(", "), [source]: result.synonyms.join(", ") },
    example: example?.source ?? "",
    exampleTranslation: example?.translation ?? "",
    notes: [result.literal && chosen === result.translation ? `${literalLabel}: ${result.literal}` : null, ...result.notes].filter(Boolean).join("\n"),
  };
  return source === uiLocale && result.target !== uiLocale ? swapDraft(draft) : draft;
}

export function dictionaryDraft(word: string, entry: DictionaryResult["entries"][number], sense: DictionaryResult["entries"][number]["senses"][number]): CardDraft {
  const language: LanguageCode = isLanguage(entry.language) ? entry.language : "en";
  return {
    term: word,
    termLang: language,
    meaning: sense.definition,
    meaningLang: language,
    kind: entry.partOfSpeech.toLowerCase(),
    synonyms: { [language]: entry.synonyms.join(", ") },
    example: sense.examples[0] ?? "",
    exampleTranslation: "",
    notes: "",
  };
}

export function useTranslator({ initialText = "", cardText = null }: { initialText?: string; cardText?: string | null }) {
  const { locale } = useI18n();
  const [languages, setLanguages] = useState<Languages>(() => fallbackLanguages(locale));
  const [text, setText] = useState(initialText);
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [pending, startTransition] = useTransition();
  const [initial] = useState({ text: initialText.trim(), context: cardText });

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const langs = loadLanguages(locale);
      setLanguages(langs);
      if (!initial.text || !navigator.onLine) return;
      startTransition(async () => {
        const response = await requestTranslation(initial.text, langs, [initial.context]);
        if (response.ok) {
          setResult(response.data);
          rememberTranslation(response.data);
        } else setError(response.error);
      });
    }, 0);
    return () => window.clearTimeout(restore);
  }, [locale, initial]);

  const updateLanguages = (patch: Partial<Languages>) => {
    setLanguages((current) => ({ ...current, ...patch }));
    saveLanguages(locale, patch);
  };

  const run = (value = text, langs = languages, extra = showContext ? context : "") => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("empty");
      return;
    }
    if (!navigator.onLine) {
      setError("offline");
      return;
    }
    startTransition(async () => {
      setError(null);
      const response = await requestTranslation(trimmed, langs, [cardText, extra]);
      if (response.ok) {
        setResult(response.data);
        rememberTranslation(response.data);
      } else setError(response.error);
    });
  };

  const swap = () => {
    if (languages.source === "auto") {
      const detected = result?.source && isLanguage(result.source) ? result.source : null;
      updateLanguages({ source: languages.target, target: detected && detected !== languages.target ? detected : languages.target === "en" ? "es" : "en" });
    } else {
      updateLanguages({ source: languages.target, target: languages.source });
    }
    if (result) setText(result.translation);
    setResult(null);
  };

  const restore = (saved: TranslationResult) => {
    setText(saved.text);
    setResult(saved);
    setError(null);
  };

  const clear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  return { languages, updateLanguages, text, setText, context, setContext, showContext, setShowContext, result, setResult, error, setError, pending, run, swap, restore, clear };
}

export function useDictionary({ initialText = "" }: { initialText?: string }) {
  const { locale } = useI18n();
  const [language, setLanguage] = useState<LanguageCode | "auto">("en");
  const [word, setWord] = useState(initialText);
  const [entry, setEntry] = useState<DictionaryResult | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [pending, startTransition] = useTransition();
  const [initial] = useState(initialText.trim());

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const langs = loadLanguages(locale);
      setLanguage(langs.word);
      if (!initial || !navigator.onLine) return;
      startTransition(async () => {
        const response = await requestLookup(initial, langs.word);
        if (response.ok) {
          setEntry(response.data);
          rememberWord(response.data.word);
        } else setError(response.error);
      });
    }, 0);
    return () => window.clearTimeout(restore);
  }, [locale, initial]);

  const changeLanguage = (value: LanguageCode | "auto") => {
    setLanguage(value);
    saveLanguages(locale, { word: value });
  };

  const run = (value = word, lang = language) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("empty");
      return;
    }
    if (!navigator.onLine) {
      setError("offline");
      return;
    }
    setWord(trimmed);
    startTransition(async () => {
      setError(null);
      const response = await requestLookup(trimmed, lang);
      if (response.ok) {
        setEntry(response.data);
        rememberWord(response.data.word);
      } else {
        setEntry(null);
        setError(response.error);
      }
    });
  };

  return { language, changeLanguage, word, setWord, entry, error, setError, pending, run };
}
