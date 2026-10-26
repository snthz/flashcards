import { Play, Search } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { formatInterval } from "@/lib/scheduler/format";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";
import { ActivityMosaic } from "./activity-mosaic";
import { cssVars, delay } from "./motion";
import { MINUTE, RATINGS, type RatingKey } from "./ratings";

const REVIEW_INTERVALS: Record<RatingKey, number> = {
  again: 10 * MINUTE,
  hard: 2,
  good: 4,
  easy: 9,
};

export function SchedulingArt({ locale, labels, retention }: { locale: Locale; labels: Record<RatingKey, string>; retention: string }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-full border bg-muted/70 p-0.5 text-xs font-medium">
          <span className="rounded-full px-3 py-1 text-muted-foreground">SM-2</span>
          <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground shadow-sm">FSRS</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {retention} <span className="font-semibold text-foreground tabular-nums">90%</span>
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {RATINGS.map((rating, index) => (
          <div
            key={rating.key}
            className={cn("cycle-pill flex flex-col items-center gap-0.5 rounded-xl border bg-card py-3 shadow-sm", rating.tone)}
            style={{ ...delay(index * 1200), ...cssVars({ "--cycle-color": rating.soft }) }}
          >
            <span className="text-[11px] text-muted-foreground tabular-nums">{formatInterval(REVIEW_INTERVALS[rating.key], locale)}</span>
            <span className="text-xs font-semibold">{labels[rating.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const WAVE = [30, 55, 80, 45, 95, 60, 35, 75, 50, 90, 40, 65, 30, 70, 45, 85, 55, 35];

export function MediaArt() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-3 rounded-2xl border bg-card p-3 shadow-md">
      <svg viewBox="0 0 200 84" className="h-20 w-full rounded-lg bg-muted" preserveAspectRatio="xMidYMid slice">
        <circle cx="150" cy="26" r="11" style={{ fill: "var(--border)" }} />
        <path d="M0 84 L55 34 L95 66 L125 46 L200 84 Z" style={{ fill: "var(--border)" }} />
        <path d="M0 84 L40 58 L80 84 Z" style={{ fill: "var(--muted-foreground)", opacity: 0.25 }} />
      </svg>
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Play className="size-3.5 translate-x-px fill-current" />
        </span>
        <div className="flex h-8 flex-1 items-center gap-[3px]">
          {WAVE.map((height, index) => (
            <span
              key={index}
              className="wave-bar w-[3px] rounded-full bg-foreground/70"
              style={{ height: `${height}%`, ...delay(index * -110) }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const HISTORY_DAYS = [1, 3, 7, 15, 29];
const HISTORY_FILLS = ["var(--viz-seq-1)", "var(--viz-seq-2)", "var(--viz-seq-3)", "var(--viz-seq-4)", "var(--viz-seq-5)"];

export function HistoryArt({ locale }: { locale: Locale }) {
  const max = Math.sqrt(HISTORY_DAYS[HISTORY_DAYS.length - 1]);
  return (
    <div className="flex h-28 w-full max-w-60 items-end justify-between gap-3">
      {HISTORY_DAYS.map((days, index) => (
        <div key={days} className="flex flex-1 flex-col items-center gap-2">
          <span
            className="reveal-bar w-full rounded-md"
            style={{ height: `${(Math.sqrt(days) / max) * 5.25}rem`, backgroundColor: HISTORY_FILLS[index], ...delay(200 + index * 120) }}
          />
          <span className="font-mono text-[10px] text-muted-foreground">{formatInterval(days, locale)}</span>
        </div>
      ))}
    </div>
  );
}

export function NoteTypesArt({ types }: { types: string[] }) {
  return (
    <div className="flex w-full max-w-60 flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {types.map((type, index) => (
          <span
            key={type}
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs font-medium",
              index === types.length - 1 ? "border-transparent bg-accent text-accent-foreground" : "bg-card text-muted-foreground",
            )}
          >
            {type}
          </span>
        ))}
      </div>
      <p className="rounded-2xl border bg-card p-4 text-sm leading-relaxed shadow-md" lang="en">
        <span className="inline-grid align-baseline font-semibold text-info">
          <span className="cloze-blank col-start-1 row-start-1 text-center">[…]</span>
          <span className="cloze-answer col-start-1 row-start-1">Jupiter</span>
        </span>{" "}
        is the largest planet in the solar system.
      </p>
    </div>
  );
}

export function BrowserArt({ query, rows }: { query: string; rows: string[] }) {
  const dots = ["bg-info", "bg-danger", "bg-success"];
  return (
    <div className="flex w-full max-w-60 flex-col gap-1.5 rounded-2xl border bg-card p-3 shadow-md">
      <div className="mb-1 flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5">
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="flex min-w-0 items-center">
          <span className="type-text overflow-hidden whitespace-nowrap font-mono text-[11px]" style={cssVars({ "--chars": query.length })}>
            {query}
          </span>
          <span className="type-caret ml-px h-3.5 w-px bg-foreground" />
        </span>
      </div>
      {rows.map((row, index) => (
        <div key={row} className="flex items-center gap-2 rounded-md px-1.5 py-1 text-xs">
          <span className={cn("size-1.5 shrink-0 rounded-full", dots[index % dots.length])} />
          <span lang="en" className="truncate font-medium">
            {row}
          </span>
          <span className="ml-auto h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface StatsArtProps {
  figures: Array<{ label: string; value: number; suffix?: string }>;
  less: string;
  more: string;
}

export function StatsArt({ figures, less, more }: StatsArtProps) {
  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
      <dl className="grid shrink-0 grid-cols-3 gap-4 lg:w-56 lg:grid-cols-1">
        {figures.map((figure) => (
          <div key={figure.label} className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{figure.label}</dt>
            <dd className="text-2xl font-semibold tracking-tight md:text-3xl">
              <CountUp value={figure.value} />
              {figure.suffix}
            </dd>
          </div>
        ))}
      </dl>
      <div className="min-w-0 flex-1">
        <ActivityMosaic less={less} more={more} />
      </div>
    </div>
  );
}
