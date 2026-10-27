"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftRight, BookOpen, Check, Copy, ExternalLink, Languages, Plus, Search, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FormError } from "@/components/ui/field";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import { lookupDictionary, translateText } from "@/lib/translate/actions";
import { isLanguage, LANGUAGES, MAX_CONTEXT, MAX_TEXT, type DictionaryResult, type LanguageCode, type TranslateError, type TranslationResult } from "@/lib/translate/types";
import { cn } from "@/lib/utils";
import { SaveCardDialog, swapDraft, type CardDraft } from "./save-card-dialog";

export type TranslatorTab = "translate" | "dictionary";

const LANG_KEY = "fc-translate-langs";

interface TranslatorProps {
  compact?: boolean;
  autoFocus?: boolean;
  initialTab?: TranslatorTab;
  initialText?: string;
  cardText?: string | null;
  deckId?: string;
}

function loadLanguages(fallbackTarget: LanguageCode): { source: LanguageCode | "auto"; target: LanguageCode; word: LanguageCode | "auto" } {
  const fallback = { source: fallbackTarget === "en" ? ("auto" as const) : ("en" as const), target: fallbackTarget, word: "en" as const };
  try {
    const saved = JSON.parse(localStorage.getItem(LANG_KEY) ?? "null") as Record<string, unknown> | null;
    if (!saved) return fallback;
    return {
      source: saved.source === "auto" || isLanguage(saved.source) ? saved.source : fallback.source,
      target: isLanguage(saved.target) ? saved.target : fallback.target,
      word: saved.word === "auto" || isLanguage(saved.word) ? saved.word : fallback.word,
    };
  } catch {
    return fallback;
  }
}

function saveLanguages(value: ReturnType<typeof loadLanguages>) {
  try {
    localStorage.setItem(LANG_KEY, JSON.stringify(value));
  } catch {
    return;
  }
}

function useLanguageName() {
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

function speak(text: string, language: string) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  speechSynthesis.speak(utterance);
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

function failure(): { ok: false; error: TranslateError } {
  return { ok: false, error: "unavailable" };
}

function requestTranslation(text: string, langs: ReturnType<typeof loadLanguages>, contexts: Array<string | null | undefined>) {
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

function translationDraft(result: TranslationResult, uiLocale: string, sourceFallback: LanguageCode | null, literalLabel: string, chosen = result.translation): CardDraft {
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

function dictionaryDraft(word: string, entry: DictionaryResult["entries"][number], sense: DictionaryResult["entries"][number]["senses"][number]): CardDraft {
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

function TranslationView({
  result,
  compact,
  onSave,
  languageName,
}: {
  result: TranslationResult;
  compact: boolean;
  onSave: (chosen?: string) => void;
  languageName: (code: string) => string;
}) {
  const t = useI18n().t.translate;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard?.writeText(result.translation).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 animate-in" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
            result.provider === "claude" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {result.provider === "claude" ? <Sparkles className="size-3" /> : null}
          {result.provider === "claude" ? t.providerClaude : t.providerFree}
        </span>
        {result.source ? <span className="text-xs text-muted-foreground">{t.detected(languageName(result.source))}</span> : null}
      </div>
      <div className="flex items-start gap-2">
        <p className={cn("flex-1 whitespace-pre-wrap font-medium leading-snug", compact ? "text-lg" : "text-xl")} lang={result.target}>
          {result.translation}
        </p>
        <div className="flex shrink-0 items-center">
          <IconButton label={t.listen} onClick={() => speak(result.translation, result.target)}>
            <Volume2 className="size-4" />
          </IconButton>
          <IconButton label={copied ? t.copied : t.copy} onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </IconButton>
        </div>
      </div>
      {result.literal ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t.literal}:</span> {result.literal}
        </p>
      ) : null}
      {result.kind || result.synonyms.length > 0 ? (
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground">
          {result.kind ? <span className="text-xs font-semibold uppercase tracking-wide">{result.kind}</span> : null}
          {result.synonyms.length > 0 ? (
            <span>
              <span className="font-medium text-foreground">{t.synonyms}:</span> {result.synonyms.join(", ")}
            </span>
          ) : null}
        </p>
      ) : null}
      {result.warning ? <p className="text-xs text-muted-foreground">{t.claudeUnavailable}</p> : null}
      {result.alternatives.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.alternatives}</h3>
          <ul className="flex flex-col gap-1">
            {result.alternatives.map((alt) => (
              <li key={alt.text} className="group flex items-start gap-2 rounded-lg px-2 py-1.5 -mx-2 hover:bg-muted/60">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium" lang={result.target}>
                    {alt.text}
                  </span>
                  {alt.note ? <span className="text-xs text-muted-foreground">{alt.note}</span> : null}
                </div>
                <IconButton label={t.saveAlternative(alt.text)} onClick={() => onSave(alt.text)}>
                  <Plus className="size-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {result.notes.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.notes}</h3>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {result.examples.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.examples}</h3>
          <ul className="flex flex-col gap-2">
            {result.examples.map((example) => (
              <li key={example.source} className="border-l-2 pl-3 text-sm">
                <p>{example.source}</p>
                <p className="text-muted-foreground">{example.translation}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {result.provider === "free" ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          {t.freeHint}{" "}
          <Link href="/settings#translator" className="font-medium text-foreground underline underline-offset-2">
            {t.freeHintAction}
          </Link>
        </p>
      ) : null}
      <Button variant="secondary" onClick={() => onSave()}>
        <Plus className="size-4" />
        {t.saveCard}
      </Button>
    </div>
  );
}

function DictionaryView({ result, onSave, onTranslate }: { result: DictionaryResult; onSave: (draft: CardDraft) => void; onTranslate: (word: string) => void }) {
  const t = useI18n().t.translate;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = () => {
    if (!result.audio) return;
    audioRef.current?.pause();
    audioRef.current = new Audio(result.audio);
    void audioRef.current.play().catch(() => null);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 animate-in" aria-live="polite">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-xl font-semibold">{result.word}</h3>
        {result.phonetic ? <span className="font-mono text-sm text-muted-foreground">{result.phonetic}</span> : null}
        {result.audio ? (
          <IconButton label={t.playPronunciation} onClick={play}>
            <Volume2 className="size-4" />
          </IconButton>
        ) : null}
        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => onTranslate(result.word)}>
          <Languages className="size-4" />
          {t.translateWord}
        </Button>
      </div>
      {result.entries.map((entry, index) => (
        <section key={`${entry.language}-${entry.partOfSpeech}-${index}`} className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {entry.partOfSpeech}
            {entry.language !== "en" || result.entries.some((other) => other.language !== entry.language) ? ` · ${entry.languageName}` : ""}
          </h4>
          <ol className="flex flex-col gap-2">
            {entry.senses.map((sense, senseIndex) => (
              <li key={`${senseIndex}-${sense.definition}`} className="group flex items-start gap-2 rounded-lg px-2 py-1.5 -mx-2 hover:bg-muted/60">
                <span className="w-4 shrink-0 pt-px text-right text-xs tabular-nums text-muted-foreground">{senseIndex + 1}</span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-sm">{sense.definition}</p>
                  {sense.examples.map((example) => (
                    <p key={example} className="text-sm italic text-muted-foreground">
                      {example}
                    </p>
                  ))}
                </div>
                <IconButton
                  label={t.saveSense}
                  onClick={() => onSave(dictionaryDraft(result.word, entry, sense))}
                >
                  <Plus className="size-4" />
                </IconButton>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        {t.dictionarySource}
        <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

export function Translator({ compact = false, autoFocus = !compact, initialTab = "translate", initialText = "", cardText = null, deckId }: TranslatorProps) {
  const { locale, t } = useI18n();
  const tr = t.translate;
  const languageName = useLanguageName();
  const [tab, setTab] = useState<TranslatorTab>(initialTab);
  const [languages, setLanguages] = useState<ReturnType<typeof loadLanguages>>({ source: "auto", target: locale === "es" ? "es" : "en", word: "en" });
  const [text, setText] = useState(initialTab === "translate" ? initialText : "");
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [word, setWord] = useState(initialTab === "dictionary" ? initialText : "");
  const [entry, setEntry] = useState<DictionaryResult | null>(null);
  const [error, setError] = useState<TranslateError | "offline" | null>(null);
  const [draft, setDraft] = useState<CardDraft | null>(null);
  const [pending, startTransition] = useTransition();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const wordRef = useRef<HTMLInputElement>(null);
  const [initial] = useState({ text: initialText, tab: initialTab, context: cardText });

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const langs = loadLanguages(locale === "es" ? "es" : "en");
      setLanguages(langs);
      const value = initial.text.trim();
      if (!value || !navigator.onLine) return;
      startTransition(async () => {
        if (initial.tab === "dictionary") {
          const response = await requestLookup(value, langs.word);
          if (response.ok) setEntry(response.data);
          else setError(response.error);
        } else {
          const response = await requestTranslation(value, langs, [initial.context]);
          if (response.ok) setResult(response.data);
          else setError(response.error);
        }
      });
    }, 0);
    return () => window.clearTimeout(restore);
  }, [locale, initial]);

  const updateLanguages = (patch: Partial<ReturnType<typeof loadLanguages>>) => {
    setLanguages((current) => {
      const next = { ...current, ...patch };
      saveLanguages(next);
      return next;
    });
  };

  const runTranslate = (value = text, langs = languages, extra = showContext ? context : "") => {
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
      if (response.ok) setResult(response.data);
      else setError(response.error);
    });
  };

  const runLookup = (value = word, language = languages.word) => {
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
      const response = await requestLookup(trimmed, language);
      if (response.ok) setEntry(response.data);
      else {
        setEntry(null);
        setError(response.error);
      }
    });
  };

  const switchTab = (next: TranslatorTab) => {
    setTab(next);
    setError(null);
    window.setTimeout(() => (next === "translate" ? textRef.current : wordRef.current)?.focus(), 0);
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

  const submitTranslate = (event: FormEvent) => {
    event.preventDefault();
    runTranslate();
  };

  const submitLookup = (event: FormEvent) => {
    event.preventDefault();
    runLookup();
  };

  const tabs: Array<{ id: TranslatorTab; label: string; icon: typeof Languages }> = [
    { id: "translate", label: tr.tabTranslate, icon: Languages },
    { id: "dictionary", label: tr.tabDictionary, icon: BookOpen },
  ];

  return (
    <div className="flex flex-col gap-4" data-translator>
      <div role="tablist" aria-label={tr.title} className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchTab(item.id)}
              className={cn(
                "flex h-8 items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors",
                active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "translate" ? (
        <form onSubmit={submitTranslate} className="flex flex-col gap-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <Select aria-label={tr.from} value={languages.source} onChange={(event) => updateLanguages({ source: event.target.value as LanguageCode | "auto" })}>
              <option value="auto">{tr.detect}</option>
              {LANGUAGES.map((code) => (
                <option key={code} value={code}>
                  {languageName(code)}
                </option>
              ))}
            </Select>
            <Button variant="ghost" size="icon" onClick={swap} aria-label={tr.swap} title={tr.swap}>
              <ArrowLeftRight className="size-4" />
            </Button>
            <Select aria-label={tr.to} value={languages.target} onChange={(event) => updateLanguages({ target: event.target.value as LanguageCode })}>
              {LANGUAGES.map((code) => (
                <option key={code} value={code}>
                  {languageName(code)}
                </option>
              ))}
            </Select>
          </div>
          <div className="relative">
            <Textarea
              ref={textRef}
              aria-label={tr.textLabel}
              placeholder={tr.textPlaceholder}
              value={text}
              maxLength={MAX_TEXT}
              autoFocus={autoFocus}
              className={cn("resize-none pb-6", compact ? "min-h-20" : "min-h-28 text-base sm:text-base")}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  runTranslate();
                }
              }}
            />
            <span className="pointer-events-none absolute bottom-1.5 right-3 text-[11px] tabular-nums text-muted-foreground">{tr.characters(text.length, MAX_TEXT)}</span>
          </div>
          {cardText ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{tr.cardContext}</span>
              <button type="button" className="font-medium text-foreground underline underline-offset-2" onClick={() => setText(cardText.slice(0, MAX_TEXT))}>
                {tr.useCardText}
              </button>
            </div>
          ) : showContext ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="translate-context" className="text-sm font-medium">
                {tr.contextLabel}
              </label>
              <Textarea
                id="translate-context"
                className="min-h-16 resize-none"
                placeholder={tr.contextPlaceholder}
                value={context}
                maxLength={MAX_CONTEXT}
                onChange={(event) => setContext(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">{tr.contextHint}</p>
            </div>
          ) : (
            <button type="button" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground" onClick={() => setShowContext(true)}>
              <Plus className="size-3.5" />
              {tr.contextToggle}
            </button>
          )}
          <Button type="submit" loading={pending} className="w-full sm:w-auto sm:self-end">
            <Languages className="size-4" />
            {tr.submit}
            <kbd className="ml-1 hidden rounded border border-current/25 px-1 font-sans text-[11px] opacity-60 md:inline">{tr.submitHint}</kbd>
          </Button>
        </form>
      ) : (
        <form onSubmit={submitLookup} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              ref={wordRef}
              className="min-w-0 flex-1"
              aria-label={tr.wordLabel}
              placeholder={tr.wordPlaceholder}
              value={word}
              maxLength={80}
              autoFocus={autoFocus}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(event) => setWord(event.target.value)}
            />
            <div className="w-36 shrink-0 sm:w-44">
              <Select
                aria-label={tr.language}
                value={languages.word}
                onChange={(event) => updateLanguages({ word: event.target.value as LanguageCode | "auto" })}
              >
                <option value="auto">{tr.anyLanguage}</option>
                {LANGUAGES.map((code) => (
                  <option key={code} value={code}>
                    {languageName(code)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button type="submit" loading={pending} className="w-full sm:w-auto sm:self-end">
            <Search className="size-4" />
            {tr.lookUp}
          </Button>
        </form>
      )}

      <FormError message={error ? (error === "offline" ? tr.offline : tr.errors[error]) : null} />

      {tab === "translate" && result ? (
        <TranslationView
          result={result}
          compact={compact}
          languageName={languageName}
          onSave={(chosen) => setDraft(translationDraft(result, locale, languages.source === "auto" ? null : languages.source, tr.literal, chosen))}
        />
      ) : null}
      {tab === "dictionary" && entry ? (
        <DictionaryView
          result={entry}
          onSave={setDraft}
          onTranslate={(value) => {
            setText(value);
            setResult(null);
            switchTab("translate");
            runTranslate(value, languages, "");
          }}
        />
      ) : null}

      <SaveCardDialog draft={draft} deckId={deckId} languageName={languageName} onClose={() => setDraft(null)} />
    </div>
  );
}
