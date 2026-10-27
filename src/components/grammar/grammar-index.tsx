"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { GRAMMAR_LEVELS, type GrammarLevel, type GrammarTopic } from "@/lib/grammar/types";
import { cn } from "@/lib/utils";
import { useGrammarProgress } from "./progress";

export type TopicSummary = Pick<GrammarTopic, "slug" | "level" | "title" | "english" | "summary">;

export function GrammarIndex({ topics, initialLevel }: { topics: TopicSummary[]; initialLevel: GrammarLevel | null }) {
  const t = useI18n().t.grammar;
  const progress = useGrammarProgress();
  const firstOpen = topics.find((topic) => !progress[topic.slug]?.done) ?? null;
  const [chosen, setChosen] = useState<GrammarLevel | null>(initialLevel);
  const level = chosen ?? firstOpen?.level ?? "A1";
  const visible = topics.filter((topic) => topic.level === level);
  const started = Object.values(progress).some((entry) => entry.done);

  const pick = (next: GrammarLevel) => {
    setChosen(next);
    const url = new URL(window.location.href);
    url.searchParams.set("level", next);
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label={t.levelsLabel} className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {GRAMMAR_LEVELS.map((value) => {
          const list = topics.filter((topic) => topic.level === value);
          const done = list.filter((topic) => progress[topic.slug]?.done).length;
          const active = value === level;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => pick(value)}
              className={cn(
                "flex min-w-32 snap-start flex-col gap-2 rounded-xl border px-3.5 py-3 text-left transition-colors sm:min-w-0",
                active ? "border-foreground/40 bg-muted/60" : "bg-card hover:border-foreground/20",
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-lg font-semibold tracking-tight">{value}</span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {done}/{list.length}
                </span>
              </span>
              <span className="truncate text-xs text-muted-foreground">{t.levels[value]}</span>
              <span className="h-1 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-foreground transition-[width] duration-500" style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }} />
              </span>
            </button>
          );
        })}
      </div>

      {started && firstOpen ? (
        <Link href={`/grammar/${firstOpen.slug}`} className="group flex items-center gap-3 rounded-xl border border-dashed px-4 py-3 transition-colors hover:border-foreground/30">
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs text-muted-foreground">{t.continueWhere}</span>
            <span className="truncate text-sm font-medium">
              {firstOpen.level} · {firstOpen.title}
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}

      <section className="flex flex-col gap-3" aria-label={`${level} · ${t.levels[level]}`}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {level} · {t.levels[level]}
          </h2>
          <span className="text-xs text-muted-foreground">{t.progress(visible.filter((topic) => progress[topic.slug]?.done).length, visible.length)}</span>
        </div>
        <ol className="flex flex-col overflow-hidden rounded-2xl border bg-card">
          {visible.map((topic, index) => {
            const entry = progress[topic.slug];
            return (
              <li key={topic.slug} className="border-b last:border-b-0">
                <Link href={`/grammar/${topic.slug}`} className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:px-5">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
                      entry?.done ? "border-transparent bg-foreground text-background" : "text-muted-foreground",
                    )}
                  >
                    {entry?.done ? <Check className="size-4" strokeWidth={2.5} /> : index + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-medium">{topic.title}</span>
                      <span className="text-xs text-muted-foreground" lang="en">
                        {topic.english}
                      </span>
                    </span>
                    <span className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-1">{topic.summary}</span>
                  </span>
                  {entry?.done && entry.total ? (
                    <span className="hidden shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground sm:block">
                      {entry.score}/{entry.total}
                    </span>
                  ) : null}
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
