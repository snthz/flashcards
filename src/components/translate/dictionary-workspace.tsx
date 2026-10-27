"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, History, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/client";
import type { LanguageCode } from "@/lib/translate/types";
import { SaveCardDialog, type CardDraft } from "./save-card-dialog";
import { DictionaryView } from "./results";
import { forgetWords, IconButton, LanguagePicker, useDictionary, useLanguageName, useRecentWords } from "./shared";
import { errorMessage } from "./translator";

function Loading() {
  return (
    <div className="flex flex-col gap-5" aria-hidden>
      <div className="flex items-center gap-3 rounded-2xl border bg-card px-5 py-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border bg-card px-5 py-5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}

export function DictionaryWorkspace({ initialText = "" }: { initialText?: string }) {
  const { t } = useI18n();
  const tr = t.translate;
  const router = useRouter();
  const languageName = useLanguageName();
  const dictionary = useDictionary({ initialText });
  const recent = useRecentWords();
  const [draft, setDraft] = useState<CardDraft | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const error = errorMessage(dictionary.error, tr);

  const lookUp = (word?: string) => {
    dictionary.run(word);
    if (word) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6" data-translator>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          lookUp();
        }}
        className="flex items-center gap-1 rounded-2xl border bg-card p-1.5 pl-4 shadow-sm transition-shadow focus-within:border-accent focus-within:ring-2 focus-within:ring-ring"
      >
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={input}
          type="search"
          aria-label={tr.wordLabel}
          placeholder={tr.wordPlaceholder}
          value={dictionary.word}
          maxLength={80}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onChange={(event) => dictionary.setWord(event.target.value)}
          className="h-10 min-w-0 flex-1 bg-transparent px-2 text-base placeholder:text-muted-foreground focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {dictionary.word ? (
          <IconButton
            label={tr.clear}
            onClick={() => {
              dictionary.setWord("");
              input.current?.focus();
            }}
          >
            <X className="size-4" />
          </IconButton>
        ) : null}
        <span aria-hidden className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <div className="hidden w-40 sm:block">
          <LanguagePicker label={tr.language} value={dictionary.language} auto={tr.anyLanguage} onChange={(value) => dictionary.changeLanguage(value as LanguageCode | "auto")} />
        </div>
        <Button type="submit" loading={dictionary.pending} disabled={!dictionary.word.trim()} className="rounded-xl">
          {tr.lookUp}
        </Button>
      </form>
      <div className="-mt-3 w-44 sm:hidden">
        <LanguagePicker label={tr.language} value={dictionary.language} auto={tr.anyLanguage} onChange={(value) => dictionary.changeLanguage(value as LanguageCode | "auto")} />
      </div>

      {error && !dictionary.pending ? (
        <p role="alert" className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
          {error}
        </p>
      ) : null}

      {dictionary.pending ? (
        <Loading />
      ) : dictionary.entry ? (
        <DictionaryView
          size="full"
          result={dictionary.entry}
          onSave={setDraft}
          onLookup={lookUp}
          onTranslate={(word) => router.push(`/translate?q=${encodeURIComponent(word)}`)}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {recent.length > 0 ? (
            <section className="flex flex-col gap-2 animate-in">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <History className="size-3.5" />
                  {tr.recent}
                </h2>
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={forgetWords}>
                  {tr.clearRecent}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => lookUp(word)}
                    className="rounded-full border bg-card px-3 py-1 text-sm transition-colors hover:border-foreground/30"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          {!error ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <BookOpen className="size-5" />
              </span>
              <div className="flex max-w-sm flex-col gap-1">
                <p className="font-medium">{tr.dictionaryEmptyTitle}</p>
                <p className="text-sm text-muted-foreground">{tr.dictionaryEmptyDescription}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <SaveCardDialog draft={draft} languageName={languageName} onClose={() => setDraft(null)} />
    </div>
  );
}
