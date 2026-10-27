"use client";

import { useState } from "react";
import { ArrowLeftRight, ArrowRight, Check, Copy, History, Languages, MessageSquareText, Plus, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/client";
import { MAX_CONTEXT, MAX_TEXT, type LanguageCode, type TranslationResult } from "@/lib/translate/types";
import { cn } from "@/lib/utils";
import { SaveCardDialog, type CardDraft } from "./save-card-dialog";
import { FreeHint, ProviderBadge, TermFacts, TranslationDetails } from "./results";
import { forgetTranslations, IconButton, LanguagePicker, speak, translationDraft, useLanguageName, useRecentTranslations, useTranslator } from "./shared";
import { errorMessage, useCopy } from "./translator";

function Recent({ onPick, languageName }: { onPick: (item: TranslationResult) => void; languageName: (code: string) => string }) {
  const t = useI18n().t.translate;
  const items = useRecentTranslations();
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-2 animate-in">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <History className="size-3.5" />
          {t.recent}
        </h2>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={forgetTranslations}
        >
          {t.clearRecent}
        </button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={`${item.text}-${item.target}`}>
            <button
              type="button"
              onClick={() => onPick(item)}
              className="group flex w-full items-center gap-3 rounded-xl border bg-card px-3.5 py-2.5 text-left transition-colors hover:border-foreground/20"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{item.text}</span>
                <span className="truncate text-sm text-muted-foreground">{item.translation}</span>
              </span>
              <span className="shrink-0 text-[11px] font-medium uppercase text-muted-foreground" title={`${item.source ? languageName(item.source) : ""} → ${languageName(item.target)}`}>
                {item.source ?? "…"} → {item.target}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TranslatorWorkspace({ initialText = "" }: { initialText?: string }) {
  const { locale, t } = useI18n();
  const tr = t.translate;
  const languageName = useLanguageName();
  const translator = useTranslator({ initialText });
  const { languages, updateLanguages, text, setText, context, setContext, showContext, setShowContext, result, pending } = translator;
  const [draft, setDraft] = useState<CardDraft | null>(null);
  const { copied, copy } = useCopy();
  const error = errorMessage(translator.error, tr);
  const sourceLang = languages.source === "auto" ? (result?.source ?? null) : languages.source;

  const run = () => translator.run();

  const save = (chosen?: string) => {
    if (result) setDraft(translationDraft(result, locale, languages.source === "auto" ? null : languages.source, tr.literal, chosen));
  };

  return (
    <div className="flex flex-col gap-5" data-translator>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          run();
        }}
        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 border-b px-2 py-1.5">
          <LanguagePicker label={tr.from} value={languages.source} auto={tr.detect} onChange={(value) => updateLanguages({ source: value as LanguageCode | "auto" })} />
          <IconButton label={tr.swap} onClick={translator.swap} className="size-9 rounded-full">
            <ArrowLeftRight className="size-4" />
          </IconButton>
          <div className="md:pl-3">
            <LanguagePicker label={tr.to} value={languages.target} onChange={(value) => updateLanguages({ target: value as LanguageCode })} />
          </div>
        </div>

        <div className="grid md:grid-cols-2">
          <div className="flex min-h-48 flex-col md:min-h-64 md:border-r">
            <div className="relative flex flex-1">
              <textarea
                aria-label={tr.textLabel}
                placeholder={tr.textPlaceholder}
                value={text}
                maxLength={MAX_TEXT}
                autoFocus
                lang={sourceLang ?? undefined}
                className="min-h-36 w-full flex-1 resize-none bg-transparent py-4 pl-4 pr-11 text-lg leading-relaxed placeholder:text-muted-foreground focus:outline-none md:text-xl"
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    run();
                  }
                }}
              />
              {text ? (
                <IconButton label={tr.clear} onClick={translator.clear} className="absolute right-2 top-3">
                  <X className="size-4" />
                </IconButton>
              ) : null}
            </div>
            <div className="flex items-center gap-1 px-2 pb-2">
              {text.trim() && sourceLang ? (
                <IconButton label={tr.listen} onClick={() => speak(text, sourceLang)}>
                  <Volume2 className="size-4" />
                </IconButton>
              ) : null}
              <button
                type="button"
                aria-pressed={showContext}
                onClick={() => setShowContext(!showContext)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                  showContext ? "border-foreground/30 bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <MessageSquareText className="size-3.5" />
                {tr.contextShort}
              </button>
              <span className="ml-auto pr-1 text-[11px] tabular-nums text-muted-foreground">{tr.characters(text.length, MAX_TEXT)}</span>
              <Button type="submit" size="sm" loading={pending} disabled={!text.trim()}>
                {pending ? null : <Languages className="size-4" />}
                {tr.submit}
                <kbd className="ml-0.5 hidden rounded border border-current/25 px-1 font-sans text-[10px] opacity-60 md:inline">{tr.submitHint}</kbd>
              </Button>
            </div>
          </div>

          <div className="flex min-h-48 flex-col border-t bg-muted/30 md:min-h-64 md:border-t-0" aria-live="polite" aria-busy={pending}>
            <div className="flex-1 px-4 py-4">
              {pending ? (
                <div className="flex flex-col gap-3 pt-1.5">
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-6 w-3/5" />
                  <Skeleton className="mt-2 h-4 w-2/5" />
                </div>
              ) : error ? (
                <p role="alert" className="text-sm text-danger">
                  {error}
                </p>
              ) : result ? (
                <div className="flex flex-col gap-3 animate-in">
                  <p className="whitespace-pre-wrap text-lg font-medium leading-relaxed md:text-xl" lang={result.target}>
                    {result.translation}
                  </p>
                  <TermFacts result={result} />
                </div>
              ) : (
                <p className="text-lg text-muted-foreground/70 md:text-xl">{tr.resultPlaceholder}</p>
              )}
            </div>
            {result && !pending ? (
              <div className="flex items-center gap-1 px-2 pb-2">
                <span className="pl-2">
                  <ProviderBadge provider={result.provider} />
                </span>
                <span className="ml-auto flex items-center">
                  <IconButton label={tr.listen} onClick={() => speak(result.translation, result.target)}>
                    <Volume2 className="size-4" />
                  </IconButton>
                  <IconButton label={copied ? tr.copied : tr.copy} onClick={() => copy(result.translation)}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </IconButton>
                </span>
                <Button size="sm" variant="outline" className="shrink-0 whitespace-nowrap" onClick={() => save()}>
                  <Plus className="size-4" />
                  {tr.saveCard}
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {showContext ? (
          <div className="flex flex-col gap-1 border-t px-4 py-3 animate-in">
            <label htmlFor="translate-context" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {tr.contextLabel}
            </label>
            <textarea
              id="translate-context"
              rows={2}
              autoFocus
              className="w-full resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none"
              placeholder={tr.contextPlaceholder}
              value={context}
              maxLength={MAX_CONTEXT}
              onChange={(event) => setContext(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">{tr.contextHint}</p>
          </div>
        ) : null}
      </form>

      {result && !pending ? (
        <>
          {result.provider === "free" ? <FreeHint /> : null}
          <TranslationDetails result={result} onSave={save} layout="grid" />
        </>
      ) : null}

      {!result && !pending ? (
        <Recent
          languageName={languageName}
          onPick={(item) => {
            translator.restore(item);
            if (item.source && languages.source !== "auto") updateLanguages({ source: item.source as LanguageCode });
            updateLanguages({ target: item.target });
          }}
        />
      ) : null}

      {!result && !pending ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowRight className="size-3.5" />
          {tr.translatorTip}
        </p>
      ) : null}

      <SaveCardDialog draft={draft} languageName={languageName} onClose={() => setDraft(null)} />
    </div>
  );
}
