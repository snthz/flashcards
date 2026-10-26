"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CircleCheck, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { formatInterval } from "@/lib/scheduler/format";
import { cn } from "@/lib/utils";
import { MINUTE, RATINGS, type Rating, type RatingKey } from "./ratings";

const EXIT_MS = 260;

const INTERVALS: Record<RatingKey, number> = {
  again: MINUTE,
  hard: 6 * MINUTE,
  good: 10 * MINUTE,
  easy: 4,
};

export function ReviewDemo({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const demo = t.landing.demo;
  const total = demo.cards.length;
  const [queue, setQueue] = useState(() => demo.cards.map((_, index) => index));
  const [seen, setSeen] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [leaving, setLeaving] = useState<Rating | null>(null);
  const [turn, setTurn] = useState(0);
  const [answer, setAnswer] = useState<{ rating: Rating; turn: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const current = queue[0];
  const card = current === undefined ? null : demo.cards[current];
  const newCount = queue.filter((index) => !seen.includes(index)).length;
  const learnCount = queue.length - newCount;
  const progress = (total - queue.length) / total;
  const stack = Math.min(2, Math.max(0, queue.length - 1));

  const keepFocus = () => {
    if (root.current?.contains(document.activeElement)) root.current.focus({ preventScroll: true });
  };

  const reveal = () => {
    setRevealed(true);
    keepFocus();
  };

  const rate = (rating: Rating) => {
    if (current === undefined || leaving) return;
    keepFocus();
    setLeaving(rating);
    setAnswer({ rating, turn });
    timer.current = setTimeout(() => {
      const again = rating.key === "again";
      setSeen((list) => (list.includes(current) ? list : [...list, current]));
      setQueue((list) => (again ? [...list.slice(1), current] : list.slice(1)));
      setRevealed(false);
      setLeaving(null);
      setTurn((value) => value + 1);
    }, EXIT_MS);
  };

  const restart = () => {
    setQueue(demo.cards.map((_, index) => index));
    setSeen([]);
    setRevealed(false);
    setAnswer(null);
    setTurn((value) => value + 1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!card || leaving) return;
    if (!revealed) {
      if (event.target !== event.currentTarget || (event.key !== " " && event.key !== "Enter")) return;
      event.preventDefault();
      reveal();
      return;
    }
    const rating = RATINGS[Number(event.key) - 1];
    if (!rating) return;
    event.preventDefault();
    rate(rating);
  };

  return (
    <div
      ref={root}
      role="group"
      tabIndex={-1}
      aria-label={demo.label}
      onKeyDown={onKeyDown}
      className={cn("w-full max-w-md rounded-2xl border bg-card p-3 shadow-xl", className)}
    >
      <div className="flex items-center justify-between gap-3 px-1 pb-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{demo.deck}</span>
        <span className="flex gap-2 tabular-nums">
          <span className="text-info">{newCount}</span>
          <span className="text-danger">{learnCount}</span>
          <span className="text-success">0</span>
        </span>
      </div>
      <div className="mx-1 mb-3 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-700 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="relative mb-4">
        {Array.from({ length: stack }, (_, depth) => (
          <div
            key={depth}
            aria-hidden
            className="absolute inset-0 rounded-xl border bg-background transition-[transform,opacity] duration-500"
            style={{ transform: `translateY(${(depth + 1) * 7}px) scale(${1 - (depth + 1) * 0.045})`, opacity: 1 - (depth + 1) * 0.35 }}
          />
        ))}
        <div
          key={`card-${turn}`}
          className={cn(
            "relative flex min-h-44 flex-col items-center justify-center gap-4 rounded-xl border bg-background px-6 py-8 text-center",
            leaving ? (leaving.key === "again" ? "animate-exit-left" : "animate-exit-right") : "animate-card-in",
          )}
        >
          {card ? (
            <>
              <p className="text-2xl font-medium tracking-tight" lang="en">
                {card.front}
              </p>
              {revealed ? (
                <>
                  <div className="h-px w-16 animate-grow-x bg-border" />
                  <p className="animate-in text-lg text-muted-foreground">{card.back}</p>
                </>
              ) : null}
            </>
          ) : (
            <>
              <CircleCheck className="size-7 animate-in text-success" />
              <p className="max-w-xs text-sm text-muted-foreground">{demo.done}</p>
              <button
                type="button"
                onClick={restart}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                <RotateCcw className="size-3.5 transition-transform duration-500 group-hover:-rotate-180" />
                {demo.restart}
              </button>
            </>
          )}
        </div>
        {answer ? (
          <span
            key={`answer-${answer.turn}`}
            aria-hidden
            className={cn(
              "pointer-events-none absolute right-4 top-3 z-10 animate-feedback text-xs font-medium tabular-nums",
              answer.rating.tone,
            )}
          >
            {formatInterval(INTERVALS[answer.rating.key], locale)}
          </span>
        ) : null}
      </div>
      <div className="h-[3.25rem]">
        {card && !revealed ? (
          <button
            type="button"
            onClick={reveal}
            className="h-full w-full rounded-lg border text-sm font-medium transition-[background-color,scale] hover:bg-muted active:scale-[0.98]"
          >
            {demo.showAnswer}
          </button>
        ) : null}
        {card && revealed ? (
          <div className="grid h-full grid-cols-4 gap-2">
            {RATINGS.map((rating, index) => (
              <button
                key={rating.key}
                type="button"
                onClick={() => rate(rating)}
                aria-keyshortcuts={String(index + 1)}
                className={cn(
                  "flex animate-in flex-col items-center justify-center rounded-lg border transition-[background-color,scale] active:scale-95",
                  rating.tone,
                  rating.hover,
                )}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className="text-[11px] text-muted-foreground tabular-nums">{formatInterval(INTERVALS[rating.key], locale)}</span>
                <span className="text-xs font-semibold">{demo[rating.key]}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
