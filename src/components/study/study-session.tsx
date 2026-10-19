"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Flag, MoreHorizontal, Pencil, PauseCircle, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import { answerCard, buryCard, flagCard, suspendCard, undoLastReview } from "@/lib/study/actions";
import type { StudyState } from "@/lib/study/types";
import type { Rating } from "@/lib/scheduler";
import { CardFrame } from "./card-frame";

const RATING_META: Record<Rating, { label: "again" | "hard" | "good" | "easy"; tone: string; key: string }> = {
  1: { label: "again", tone: "text-danger border-danger/40 hover:bg-danger-soft", key: "1" },
  2: { label: "hard", tone: "text-warning border-warning/40 hover:bg-warning-soft", key: "2" },
  3: { label: "good", tone: "text-success border-success/40 hover:bg-success-soft", key: "3" },
  4: { label: "easy", tone: "text-info border-info/40 hover:bg-info-soft", key: "4" },
};

const FLAG_COLORS = ["", "#ef4444", "#f97316", "#22c55e", "#3b82f6", "#ec4899", "#14b8a6", "#a855f7"];

const EMPTY: string[] = [];

export function StudySession({ initial }: { initial: StudyState }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [state, setState] = useState<StudyState>(initial);
  const [revealed, setRevealed] = useState(false);
  const [pending, startTransition] = useTransition();
  const shownAt = useRef<number>(0);
  const card = state.card;

  useEffect(() => {
    shownAt.current = Date.now();
  }, [card?.id]);

  const apply = useCallback(
    (work: () => Promise<StudyState | null>) => {
      startTransition(async () => {
        const next = await work();
        if (next) {
          setState(next);
          setRevealed(false);
          shownAt.current = Date.now();
        }
      });
    },
    [startTransition],
  );

  const reveal = useCallback(() => setRevealed(true), []);

  const rate = useCallback(
    (rating: Rating) => {
      if (!card || pending) return;
      const duration = Date.now() - shownAt.current;
      apply(() => answerCard(state.deckId, card.id, rating, duration));
    },
    [card, pending, apply, state.deckId],
  );

  const undo = useCallback(() => {
    if (!state.canUndo || pending) return;
    apply(() => undoLastReview(state.deckId));
  }, [state.canUndo, state.deckId, pending, apply]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
        return;
      }
      if (!card) return;
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (!revealed) reveal();
        else rate(3);
        return;
      }
      if (revealed && ["1", "2", "3", "4"].includes(event.key)) {
        event.preventDefault();
        rate(Number(event.key) as Rating);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed, reveal, rate, undo]);

  return (
    <div className="-mb-24 flex h-[calc(100dvh_-_1rem_-_var(--safe-top))] flex-col md:mb-0 md:h-auto">
      <header className="flex items-center justify-between gap-3 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={`/decks/${state.deckId}`} aria-label={t.study.exit} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-5" />
          </Link>
          <p className="truncate text-sm font-medium">{state.deckName}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm tabular-nums" aria-label={t.study.remaining}>
            <span className={cn("text-info", card?.state === "NEW" && "underline underline-offset-4")}>{state.counts.fresh}</span>
            <span className={cn("text-danger", (card?.state === "LEARNING" || card?.state === "RELEARNING") && "underline underline-offset-4")}>
              {state.counts.learning}
            </span>
            <span className={cn("text-success", card?.state === "REVIEW" && "underline underline-offset-4")}>{state.counts.review}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={undo} disabled={!state.canUndo || pending} aria-label={t.study.undo}>
            <Undo2 className="size-4" />
          </Button>
          {card ? (
            <Menu
              trigger={
                <span className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">{t.study.moreActions}</span>
                </span>
              }
            >
              <MenuItem icon={<Pencil />} onSelect={() => router.push(`/notes/${card.noteId}/edit?from=/decks/${state.deckId}/study`)}>
                {t.study.editNote}
              </MenuItem>
              <MenuItem icon={<Flag />} onSelect={() => apply(() => flagCard(state.deckId, card.id, card.flag ? 0 : 1))}>
                {card.flag ? t.study.removeFlag : t.study.flag}
              </MenuItem>
              <MenuSeparator />
              <MenuItem icon={<EyeOff />} onSelect={() => apply(() => buryCard(state.deckId, card.id))}>
                {t.study.buryUntilTomorrow}
              </MenuItem>
              <MenuItem icon={<PauseCircle />} tone="danger" onSelect={() => apply(() => suspendCard(state.deckId, card.id))}>
                {t.study.suspend}
              </MenuItem>
            </Menu>
          ) : null}
        </div>
      </header>

      {card ? (
        <>
          <section
            className={cn(
              "relative flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border bg-card shadow-sm transition-opacity md:min-h-96",
              pending && "opacity-60",
            )}
            onClick={() => {
              if (!revealed) reveal();
            }}
          >
            {card.flag ? (
              <span className="absolute right-3 top-3" style={{ color: FLAG_COLORS[card.flag] }}>
                <Flag className="size-4 fill-current" />
              </span>
            ) : null}
            <CardFrame
              key={`${card.id}-${revealed ? "a" : "q"}`}
              html={revealed ? card.answer : card.question}
              css={card.css}
              ord={card.ord}
              side={revealed ? "answer" : "question"}
              autoplay={revealed ? card.audio.answer : card.audio.question.length > 0 ? card.audio.question : EMPTY}
            />
          </section>

          <footer className="safe-bottom pt-3">
            {revealed ? (
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 3, 4] as Rating[]).map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    disabled={pending}
                    onClick={() => rate(rating)}
                    className={cn(
                      "flex h-16 flex-col items-center justify-center rounded-xl border bg-card transition-colors disabled:opacity-50",
                      RATING_META[rating].tone,
                    )}
                  >
                    <span className="text-xs tabular-nums text-muted-foreground">{card.intervals[rating]}</span>
                    <span className="text-sm font-semibold">{t.study[RATING_META[rating].label]}</span>
                  </button>
                ))}
              </div>
            ) : (
              <Button
                size="lg"
                className="h-16 w-full gap-2.5 rounded-xl text-base font-semibold shadow-md active:scale-[0.98]"
                onClick={reveal}
                disabled={pending}
              >
                <Eye className="size-5" aria-hidden />
                {t.study.showAnswer}
                <kbd className="ml-1 hidden rounded-md border border-current/25 px-1.5 py-0.5 font-sans text-xs font-medium opacity-60 md:inline">
                  {t.study.spaceKey}
                </kbd>
              </Button>
            )}
            <p className="mt-2 hidden text-center text-xs text-muted-foreground md:block">
              {t.study.shortcutsHint}
            </p>
          </footer>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-10 text-center animate-in">
          <CheckCircle2 className="size-12 text-success" />
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">{t.study.finishedTitle}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {state.learnAheadAt
                ? t.study.learnAheadAt(new Date(state.learnAheadAt).toLocaleTimeString(intlLocale(locale), { hour: "2-digit", minute: "2-digit" }))
                : t.study.noMoreCards}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/decks/${state.deckId}`)}>
              {t.study.backToDeck}
            </Button>
            {state.canUndo ? (
              <Button variant="ghost" onClick={undo} disabled={pending}>
                <Undo2 className="size-4" />
                {t.study.undo}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
