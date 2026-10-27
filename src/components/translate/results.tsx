"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, Languages, Plus, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/client";
import type { DictionaryResult, TranslationResult } from "@/lib/translate/types";
import { cn } from "@/lib/utils";
import { dictionaryDraft, IconButton, speak } from "./shared";
import type { CardDraft } from "./save-card-dialog";

export function ToolTabs({ current }: { current: "translate" | "dictionary" }) {
  const t = useMessages().translate;
  const tabs = [
    { id: "translate", href: "/translate", label: t.tabTranslate, icon: Languages },
    { id: "dictionary", href: "/dictionary", label: t.tabDictionary, icon: BookOpen },
  ] as const;
  return (
    <nav aria-label={t.title} className="flex rounded-lg bg-muted p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.id === current;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
              active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ProviderBadge({ provider }: { provider: TranslationResult["provider"] }) {
  const t = useMessages().translate;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        provider === "claude" ? "bg-card text-foreground" : "text-muted-foreground",
      )}
    >
      {provider === "claude" ? <Sparkles className="size-3" /> : null}
      {provider === "claude" ? t.providerClaude : t.providerFree}
    </span>
  );
}

export function FreeHint({ className }: { className?: string }) {
  const t = useMessages().translate;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground", className)}>
      <Sparkles className="size-3.5 shrink-0" />
      <span className="min-w-0 flex-1">{t.freeHint}</span>
      <Link href="/settings?tab=translator" className="font-medium text-foreground underline underline-offset-2">
        {t.freeHintAction}
      </Link>
    </p>
  );
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function TermFacts({ result }: { result: TranslationResult }) {
  const t = useMessages().translate;
  if (!result.literal && !result.kind && result.synonyms.length === 0 && !result.warning) return null;
  return (
    <div className="flex flex-col gap-2 text-sm">
      {result.literal ? (
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{t.literal}:</span> {result.literal}
        </p>
      ) : null}
      {result.kind || result.synonyms.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {result.kind ? <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-background">{result.kind}</span> : null}
          {result.synonyms.map((word) => (
            <span key={word} className="rounded-md border px-1.5 py-0.5 text-xs text-muted-foreground" lang={result.source ?? undefined}>
              {word}
            </span>
          ))}
        </div>
      ) : null}
      {result.warning ? <p className="text-xs text-muted-foreground">{t.claudeUnavailable}</p> : null}
    </div>
  );
}

export function TranslationDetails({ result, onSave, layout = "stack" }: { result: TranslationResult; onSave: (chosen?: string) => void; layout?: "stack" | "grid" }) {
  const t = useMessages().translate;
  const card = layout === "grid" ? "rounded-xl border bg-card p-4" : "";
  const sections: ReactNode[] = [];
  if (result.alternatives.length > 0) {
    sections.push(
      <Section key="alternatives" title={t.alternatives} className={card}>
        <ul className="-mx-2 flex flex-col">
          {result.alternatives.map((alt) => (
            <li key={alt.text} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60">
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
      </Section>,
    );
  }
  if (result.examples.length > 0) {
    sections.push(
      <Section key="examples" title={t.examples} className={card}>
        <ul className="flex flex-col gap-2.5">
          {result.examples.map((example) => (
            <li key={example.source} className="flex items-start gap-2 border-l-2 pl-3 text-sm">
              <div className="min-w-0 flex-1">
                <p lang={result.source ?? undefined}>{example.source}</p>
                <p className="text-muted-foreground" lang={result.target}>
                  {example.translation}
                </p>
              </div>
              {result.source ? (
                <IconButton label={t.listen} onClick={() => speak(example.source, result.source!)} className="size-7">
                  <Volume2 className="size-3.5" />
                </IconButton>
              ) : null}
            </li>
          ))}
        </ul>
      </Section>,
    );
  }
  if (result.notes.length > 0) {
    sections.push(
      <Section key="notes" title={t.notes} className={card}>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground">
          {result.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </Section>,
    );
  }
  if (sections.length === 0) return null;
  return <div className={cn(layout === "grid" ? "grid gap-3 md:grid-cols-2" : "flex flex-col gap-4")}>{sections}</div>;
}

export function DictionaryView({
  result,
  onSave,
  onTranslate,
  onLookup,
  size = "compact",
}: {
  result: DictionaryResult;
  onSave: (draft: CardDraft) => void;
  onTranslate: (word: string) => void;
  onLookup?: (word: string) => void;
  size?: "compact" | "full";
}) {
  const t = useMessages().translate;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const full = size === "full";
  const mixed = result.entries.some((entry) => entry.language !== result.entries[0]?.language);

  const play = () => {
    if (!result.audio) return;
    audioRef.current?.pause();
    audioRef.current = new Audio(result.audio);
    void audioRef.current.play().catch(() => null);
  };

  return (
    <article className={cn("flex flex-col animate-in", full ? "gap-5" : "gap-4 rounded-xl border bg-card p-4")} aria-live="polite">
      <header className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", full && "rounded-2xl border bg-card px-5 py-4")}>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className={cn("font-semibold tracking-tight", full ? "text-3xl" : "text-xl")}>{result.word}</h2>
          {result.phonetic ? <span className="font-mono text-sm text-muted-foreground">{result.phonetic}</span> : null}
        </div>
        <div className="flex items-center gap-1">
          {result.audio ? (
            <button
              type="button"
              onClick={play}
              aria-label={t.playPronunciation}
              title={t.playPronunciation}
              className={cn(
                "flex items-center justify-center rounded-full border text-foreground transition-colors hover:bg-muted active:scale-95",
                full ? "size-10" : "size-8",
              )}
            >
              <Volume2 className="size-4" />
            </button>
          ) : null}
          <Button size="sm" variant={full ? "outline" : "ghost"} onClick={() => onTranslate(result.word)}>
            <Languages className="size-4" />
            {t.translateWord}
          </Button>
        </div>
      </header>
      {result.entries.map((entry, index) => (
        <section
          key={`${entry.language}-${entry.partOfSpeech}-${index}`}
          className={cn("flex flex-col gap-2", full && "rounded-2xl border bg-card px-5 py-4")}
        >
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className={cn(full && "rounded-md bg-foreground px-1.5 py-0.5 text-[11px] text-background")}>{entry.partOfSpeech}</span>
            {entry.language !== "en" || mixed ? <span className="font-medium normal-case tracking-normal">{entry.languageName}</span> : null}
          </h3>
          <ol className="-mx-2 flex flex-col">
            {entry.senses.map((sense, senseIndex) => (
              <li key={`${senseIndex}-${sense.definition}`} className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-muted/60">
                <span className="w-4 shrink-0 pt-px text-right text-xs tabular-nums text-muted-foreground">{senseIndex + 1}</span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className={cn(full ? "text-[15px] leading-relaxed" : "text-sm")}>{sense.definition}</p>
                  {sense.examples.map((example) => (
                    <p key={example} className="border-l-2 pl-2.5 text-sm italic text-muted-foreground">
                      {example}
                    </p>
                  ))}
                </div>
                <IconButton label={t.saveSense} onClick={() => onSave(dictionaryDraft(result.word, entry, sense))}>
                  <Plus className="size-4" />
                </IconButton>
              </li>
            ))}
          </ol>
          {entry.synonyms.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 border-t pt-3">
              <span className="mr-1 text-xs font-medium text-muted-foreground">{t.synonyms}</span>
              {entry.synonyms.map((synonym) =>
                onLookup ? (
                  <button
                    key={synonym}
                    type="button"
                    onClick={() => onLookup(synonym)}
                    title={t.lookUpWord(synonym)}
                    className="rounded-full border px-2.5 py-0.5 text-xs transition-colors hover:border-foreground/30 hover:bg-muted"
                  >
                    {synonym}
                  </button>
                ) : (
                  <span key={synonym} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {synonym}
                  </span>
                ),
              )}
            </div>
          ) : null}
        </section>
      ))}
      <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        {t.dictionarySource}
        <ExternalLink className="size-3" />
      </a>
    </article>
  );
}
