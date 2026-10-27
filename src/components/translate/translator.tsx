"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeftRight, BookOpen, Check, Copy, Languages, Plus, Search, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FormError } from "@/components/ui/field";
import { useI18n } from "@/lib/i18n/client";
import { MAX_CONTEXT, MAX_TEXT, type LanguageCode, type TranslationResult } from "@/lib/translate/types";
import { cn } from "@/lib/utils";
import { SaveCardDialog, type CardDraft } from "./save-card-dialog";
import { DictionaryView, FreeHint, ProviderBadge, TermFacts, TranslationDetails } from "./results";
import { IconButton, LanguagePicker, speak, translationDraft, useDictionary, useLanguageName, useTranslator, type ToolError } from "./shared";

export type TranslatorTab = "translate" | "dictionary";

interface TranslatorProps {
  autoFocus?: boolean;
  initialText?: string;
  cardText?: string | null;
  deckId?: string;
  extraTab?: { label: string; icon: ReactNode; content: ReactNode };
}

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };
  return { copied, copy };
}

export function errorMessage(error: ToolError | null, t: ReturnType<typeof useI18n>["t"]["translate"]) {
  if (!error) return null;
  return error === "offline" ? t.offline : t.errors[error];
}

function CompactResult({ result, onSave }: { result: TranslationResult; onSave: (chosen?: string) => void }) {
  const t = useI18n().t.translate;
  const { copied, copy } = useCopy();
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 animate-in" aria-live="polite">
      <div className="flex items-start gap-2">
        <p className="flex-1 whitespace-pre-wrap text-lg font-medium leading-snug" lang={result.target}>
          {result.translation}
        </p>
        <div className="flex shrink-0 items-center">
          <IconButton label={t.listen} onClick={() => speak(result.translation, result.target)}>
            <Volume2 className="size-4" />
          </IconButton>
          <IconButton label={copied ? t.copied : t.copy} onClick={() => copy(result.translation)}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </IconButton>
        </div>
      </div>
      <TermFacts result={result} />
      <TranslationDetails result={result} onSave={onSave} />
      <div className="flex items-center justify-between gap-2">
        <ProviderBadge provider={result.provider} />
        <Button size="sm" variant="secondary" onClick={() => onSave()}>
          <Plus className="size-4" />
          {t.saveCard}
        </Button>
      </div>
      {result.provider === "free" ? <FreeHint /> : null}
    </div>
  );
}

export function Translator({ autoFocus = false, initialText = "", cardText = null, deckId, extraTab }: TranslatorProps) {
  const { locale, t } = useI18n();
  const tr = t.translate;
  const languageName = useLanguageName();
  const [tab, setTab] = useState<TranslatorTab | "extra">("translate");
  const translator = useTranslator({ initialText, cardText });
  const dictionary = useDictionary({});
  const [draft, setDraft] = useState<CardDraft | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const wordRef = useRef<HTMLInputElement>(null);
  const { languages, updateLanguages, text, setText, context, setContext, showContext, setShowContext, result } = translator;

  const switchTab = (next: TranslatorTab | "extra") => {
    setTab(next);
    translator.setError(null);
    dictionary.setError(null);
    if (next !== "extra") window.setTimeout(() => (next === "translate" ? textRef.current : wordRef.current)?.focus(), 0);
  };

  const submitTranslate = (event: FormEvent) => {
    event.preventDefault();
    translator.run();
  };

  const submitLookup = (event: FormEvent) => {
    event.preventDefault();
    dictionary.run();
  };

  const tabs: Array<{ id: TranslatorTab | "extra"; label: string; icon: ReactNode }> = [
    { id: "translate", label: tr.tabTranslate, icon: <Languages className="size-4" /> },
    { id: "dictionary", label: tr.tabDictionary, icon: <BookOpen className="size-4" /> },
    ...(extraTab ? [{ id: "extra" as const, label: extraTab.label, icon: extraTab.icon }] : []),
  ];

  return (
    <div className="flex min-h-full flex-col gap-4" data-translator>
      <div role="tablist" aria-label={tr.title} className={cn("grid gap-1 rounded-lg bg-muted p-1", tabs.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchTab(item.id)}
              className={cn(
                "flex h-8 items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors [&>svg]:shrink-0",
                active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "translate" ? (
        <>
          <form onSubmit={submitTranslate} className="flex flex-col gap-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 rounded-lg border bg-card p-1">
              <LanguagePicker label={tr.from} value={languages.source} auto={tr.detect} onChange={(value) => updateLanguages({ source: value as LanguageCode | "auto" })} />
              <IconButton label={tr.swap} onClick={translator.swap}>
                <ArrowLeftRight className="size-4" />
              </IconButton>
              <LanguagePicker label={tr.to} value={languages.target} align="right" onChange={(value) => updateLanguages({ target: value as LanguageCode })} />
            </div>
            <div className="relative">
              <Textarea
                ref={textRef}
                aria-label={tr.textLabel}
                placeholder={tr.textPlaceholder}
                value={text}
                maxLength={MAX_TEXT}
                autoFocus={autoFocus}
                className="min-h-20 resize-none pb-6"
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    translator.run();
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
            <Button type="submit" loading={translator.pending} className="w-full">
              <Languages className="size-4" />
              {tr.submit}
            </Button>
          </form>
          <FormError message={errorMessage(translator.error, tr)} />
          {result ? (
            <CompactResult
              result={result}
              onSave={(chosen) => setDraft(translationDraft(result, locale, languages.source === "auto" ? null : languages.source, tr.literal, chosen))}
            />
          ) : null}
        </>
      ) : null}

      {tab === "dictionary" ? (
        <>
          <form onSubmit={submitLookup} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                ref={wordRef}
                className="min-w-0 flex-1"
                aria-label={tr.wordLabel}
                placeholder={tr.wordPlaceholder}
                value={dictionary.word}
                maxLength={80}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => dictionary.setWord(event.target.value)}
              />
              <div className="w-32 shrink-0 rounded-lg border bg-card">
                <LanguagePicker label={tr.language} value={dictionary.language} auto={tr.anyLanguage} onChange={(value) => dictionary.changeLanguage(value as LanguageCode | "auto")} />
              </div>
            </div>
            <Button type="submit" loading={dictionary.pending} className="w-full">
              <Search className="size-4" />
              {tr.lookUp}
            </Button>
          </form>
          <FormError message={errorMessage(dictionary.error, tr)} />
          {dictionary.entry ? (
            <DictionaryView
              result={dictionary.entry}
              onSave={setDraft}
              onLookup={(word) => dictionary.run(word)}
              onTranslate={(value) => {
                setText(value);
                translator.setResult(null);
                switchTab("translate");
                translator.run(value, languages, "");
              }}
            />
          ) : null}
        </>
      ) : null}

      {extraTab ? (
        <div hidden={tab !== "extra"} className="flex flex-1 flex-col">
          {extraTab.content}
        </div>
      ) : null}

      <SaveCardDialog draft={draft} deckId={deckId} languageName={languageName} onClose={() => setDraft(null)} />
    </div>
  );
}
