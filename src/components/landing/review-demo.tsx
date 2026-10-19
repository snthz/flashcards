"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { formatInterval } from "@/lib/scheduler/format";
import { cn } from "@/lib/utils";

const MINUTE = 1 / 1440;

const ratings = [
  { key: "again", interval: MINUTE, tone: "text-danger border-danger/40 hover:bg-danger-soft" },
  { key: "hard", interval: 6 * MINUTE, tone: "text-warning border-warning/40 hover:bg-warning-soft" },
  { key: "good", interval: 10 * MINUTE, tone: "text-success border-success/40 hover:bg-success-soft" },
  { key: "easy", interval: 4, tone: "text-info border-info/40 hover:bg-info-soft" },
] as const;

export function ReviewDemo({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const demo = t.landing.demo;
  const [queue, setQueue] = useState(() => demo.cards.map((_, index) => index));
  const [seen, setSeen] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);

  const current = queue[0];
  const card = current === undefined ? null : demo.cards[current];
  const newCount = queue.filter((index) => !seen.includes(index)).length;
  const learnCount = queue.length - newCount;

  const rate = (again: boolean) => {
    if (current === undefined) return;
    setSeen((list) => (list.includes(current) ? list : [...list, current]));
    setQueue((list) => (again ? [...list.slice(1), current] : list.slice(1)));
    setRevealed(false);
  };

  const restart = () => {
    setQueue(demo.cards.map((_, index) => index));
    setSeen([]);
    setRevealed(false);
  };

  return (
    <div className={cn("w-full max-w-md rounded-2xl border bg-card p-3 shadow-xl", className)}>
      <div className="flex items-center justify-between px-1 pb-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{demo.deck}</span>
        <span className="flex gap-2 tabular-nums">
          <span className="text-info">{newCount}</span>
          <span className="text-danger">{learnCount}</span>
          <span className="text-success">0</span>
        </span>
      </div>
      <div className="flex min-h-44 flex-col items-center justify-center gap-4 rounded-xl border bg-background px-6 py-8 text-center">
        {card ? (
          <>
            <p className="text-2xl font-medium" lang="en">
              {card.front}
            </p>
            {revealed ? (
              <>
                <div className="h-px w-16 bg-border" />
                <p className="text-lg text-muted-foreground animate-in">{card.back}</p>
              </>
            ) : null}
          </>
        ) : (
          <>
            <p className="max-w-xs text-sm text-muted-foreground">{demo.done}</p>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              <RotateCcw className="size-3.5" />
              {demo.restart}
            </button>
          </>
        )}
      </div>
      <div className="mt-3 h-[3.25rem]">
        {card && !revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="h-full w-full rounded-lg border text-sm font-medium transition-colors hover:bg-muted"
          >
            {demo.showAnswer}
          </button>
        ) : null}
        {card && revealed ? (
          <div className="grid h-full grid-cols-4 gap-2">
            {ratings.map((rating) => (
              <button
                key={rating.key}
                type="button"
                onClick={() => rate(rating.key === "again")}
                className={cn("flex flex-col items-center justify-center rounded-lg border transition-colors", rating.tone)}
              >
                <span className="text-[11px] text-muted-foreground tabular-nums">{formatInterval(rating.interval, locale)}</span>
                <span className="text-xs font-semibold">{demo[rating.key]}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
