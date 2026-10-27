"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, CloudOff, Eye, EyeOff, Flag, Info, MoreHorizontal, Pencil, PauseCircle, RefreshCw, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import { useOnline } from "@/lib/hooks/use-online";
import { undoLatestReview } from "@/lib/study/actions";
import { applyOp, createEngine, engineCounts, intervalLabels, LEARN_AHEAD_MS, pickCard, type Engine } from "@/lib/study/engine";
import { addOp, deleteOps, loadOps, loadPack, savePack, setMeta } from "@/lib/study/offline/store";
import { flushOps, subscribeSync } from "@/lib/study/offline/sync";
import { downloadPack } from "@/lib/study/offline/prefetch";
import type { StudyCounts, StudyOp, StudyPack } from "@/lib/study/types";
import type { CardState, Rating } from "@/lib/scheduler";
import { uuid } from "@/lib/uuid";
import { customStudyQuery } from "@/lib/study/custom";
import { CardFrame } from "./card-frame";
import { markSwipeHintSeen, shouldShowSwipeHint, SwipeHint, SwipeTint, useSwipe, type SwipeDirection } from "./swipe";
import { CardInfoDialog } from "@/components/browse/card-info-dialog";
import { StudyTimerButton, TimerBreak, TimerNotice, useStudyTimer } from "./study-timer";
import { StudyTranslator } from "@/components/translate/study-translator";

const RATING_META: Record<Rating, { label: "again" | "hard" | "good" | "easy"; tone: string }> = {
  1: { label: "again", tone: "text-danger border-danger/40 hover:bg-danger-soft" },
  2: { label: "hard", tone: "text-warning border-warning/40 hover:bg-warning-soft" },
  3: { label: "good", tone: "text-success border-success/40 hover:bg-success-soft" },
  4: { label: "easy", tone: "text-info border-info/40 hover:bg-info-soft" },
};

const FLAG_COLORS = ["", "#ef4444", "#f97316", "#22c55e", "#3b82f6", "#ec4899", "#14b8a6", "#a855f7"];
const EMPTY: string[] = [];
const SYNC_DELAY_MS = 800;
const SYNC_INTERVAL_MS = 30_000;
const PACK_MAX_AGE_MS = 10 * 60_000;

interface ViewCard {
  id: string;
  noteId: string;
  ord: number;
  state: CardState;
  flag: number;
  question: string;
  answer: string;
  css: string;
  audio: { question: string[]; answer: string[] };
  intervals: Record<Rating, string>;
}

interface View {
  card: ViewCard | null;
  learnAheadAt: Date | null;
  counts: StudyCounts;
  canUndo: boolean;
}

function lastReviewOp(ops: StudyOp[]) {
  for (let i = ops.length - 1; i >= 0; i -= 1) if (ops[i].kind === "review") return ops[i];
  return null;
}

export function StudySession({ initialPack, preferCardId = null }: { initialPack: StudyPack; preferCardId?: string | null }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const online = useOnline();
  const userId = initialPack.userId;
  const deckId = initialPack.deckId;
  const custom = initialPack.custom ?? null;
  const engineRef = useRef<Engine | null>(null);
  const opsRef = useRef<StudyOp[]>([]);
  const nextPackRef = useRef<StudyPack | null>(null);
  const shownAt = useRef(0);
  const typedRef = useRef("");
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState("");
  const [pendingOps, setPendingOps] = useState(0);
  const [syncFailed, setSyncFailed] = useState(false);
  const [undoing, startUndo] = useTransition();
  const [swipeHint, setSwipeHint] = useState(false);
  const [infoCard, setInfoCard] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [translating, setTranslating] = useState(false);
  const timer = useStudyTimer();
  const onBreak = timer.state?.phase === "break";

  const canUndoNow = useCallback(() => {
    const engine = engineRef.current;
    const last = lastReviewOp(opsRef.current);
    if (last && !last.syncedAt) return true;
    return navigator.onLine && Boolean(engine?.pack.serverUndo || last);
  }, []);

  const advance = useCallback(
    (preferId: string | null = null) => {
      if (nextPackRef.current) {
        engineRef.current = createEngine(nextPackRef.current, opsRef.current);
        nextPackRef.current = null;
      }
      const engine = engineRef.current;
      if (!engine) return;
      const now = new Date();
      const choice = pickCard(engine, now, { preferId });
      const packCard = choice.cardId ? engine.pack.cards.find((card) => card.id === choice.cardId) : undefined;
      const engineCard = choice.cardId ? engine.cards.get(choice.cardId) : undefined;
      setView({
        card:
          packCard && engineCard
            ? {
                id: packCard.id,
                noteId: packCard.noteId,
                ord: packCard.ord,
                state: engineCard.state,
                flag: engineCard.flag,
                question: packCard.question,
                answer: packCard.answer,
                css: engine.pack.styles[packCard.styleId] ?? "",
                audio: packCard.audio,
                intervals: intervalLabels(engine, packCard.id, now, locale),
              }
            : null,
        learnAheadAt: choice.learnAheadAt,
        counts: engineCounts(engine, now),
        canUndo: canUndoNow(),
      });
      setRevealed(false);
      typedRef.current = "";
      setTyped("");
      shownAt.current = Date.now();
    },
    [locale, canUndoNow],
  );

  const refreshPending = useCallback(async () => {
    const ops = await loadOps(userId);
    opsRef.current = ops;
    setPendingOps(ops.filter((op) => !op.syncedAt).length);
    setView((current) => (current ? { ...current, canUndo: canUndoNow() } : current));
  }, [userId, canUndoNow]);

  const sync = useCallback(async () => {
    const result = await flushOps(userId);
    setSyncFailed(!result.ok);
    await refreshPending();
  }, [userId, refreshPending]);

  const scheduleSync = useCallback(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => void sync(), SYNC_DELAY_MS);
  }, [sync]);

  const refreshPack = useCallback(
    async (adoptNow: boolean) => {
      const pack = await downloadPack(deckId);
      if (!pack) return;
      nextPackRef.current = pack;
      if (adoptNow) advance();
    },
    [deckId, advance],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = custom ? null : await loadPack(userId, deckId);
      const pack = stored && Date.parse(stored.fetchedAt) > Date.parse(initialPack.fetchedAt) ? stored : initialPack;
      if (pack === initialPack && !custom) await savePack(initialPack);
      await setMeta("userId", userId);
      const ops = await loadOps(userId);
      if (cancelled) return;
      opsRef.current = ops;
      engineRef.current = createEngine(pack, ops);
      setPendingOps(ops.filter((op) => !op.syncedAt).length);
      advance(preferCardId);
      void sync();
      if (!custom && navigator.onLine && Date.now() - Date.parse(pack.fetchedAt) > PACK_MAX_AGE_MS) void refreshPack(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialPack, userId, deckId, preferCardId, advance, sync, refreshPack, custom]);

  useEffect(() => subscribeSync(() => void refreshPending()), [refreshPending]);

  useEffect(() => {
    if (!online) return;
    const first = setTimeout(() => void sync(), 0);
    const interval = setInterval(() => void sync(), SYNC_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [online, sync]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flushOps(userId);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [userId]);

  useEffect(() => {
    if (!view || view.card || !view.learnAheadAt) return;
    const wait = Math.max(1000, view.learnAheadAt.getTime() - LEARN_AHEAD_MS - Date.now());
    const timer = setTimeout(() => advance(), wait);
    return () => clearTimeout(timer);
  }, [view, advance]);

  useEffect(() => {
    if (!view || view.card || !online || custom) return;
    const engine = engineRef.current;
    if (engine && (engine.pack.truncated || Date.now() >= Date.parse(engine.pack.dayEnd))) void refreshPack(true);
  }, [view, online, refreshPack, custom]);

  const record = useCallback(
    (op: StudyOp, next: "advance" | "stay") => {
      const engine = engineRef.current;
      if (!engine) return;
      opsRef.current = [...opsRef.current, op];
      applyOp(engine, op);
      setPendingOps((count) => count + 1);
      void addOp(op).then(scheduleSync);
      if (next === "advance") advance();
      else advance(op.cardId);
    },
    [advance, scheduleSync],
  );

  const card = view?.card ?? null;

  const reveal = useCallback(() => {
    setTyped(typedRef.current);
    setRevealed(true);
    if (shouldShowSwipeHint()) setSwipeHint(true);
  }, []);

  const endSwipeHint = useCallback(() => {
    markSwipeHintSeen();
    setSwipeHint(false);
  }, []);

  const onTyped = useCallback((value: string) => {
    typedRef.current = value;
  }, []);

  const rate = useCallback(
    (rating: Rating) => {
      if (!card || undoing) return;
      const durationMs = Date.now() - shownAt.current;
      record({ id: uuid(), userId, cardId: card.id, at: new Date().toISOString(), kind: "review", rating, durationMs }, "advance");
    },
    [card, undoing, record, userId],
  );

  const onSwipe = useCallback(
    (direction: SwipeDirection) => {
      endSwipeHint();
      rate(direction === "right" ? 3 : 1);
    },
    [endSwipeHint, rate],
  );

  const swipe = useSwipe(revealed && !undoing && Boolean(card) && !onBreak, onSwipe);

  const undo = useCallback(() => {
    if (!view?.canUndo || undoing) return;
    const last = lastReviewOp(opsRef.current);
    if (last && !last.syncedAt) {
      opsRef.current = opsRef.current.filter((op) => op.id !== last.id);
      void deleteOps([last.id]);
      const engine = engineRef.current;
      if (engine) engineRef.current = createEngine(nextPackRef.current ?? engine.pack, opsRef.current);
      nextPackRef.current = null;
      setPendingOps((count) => Math.max(0, count - 1));
      advance(last.cardId);
      return;
    }
    if (!navigator.onLine) return;
    startUndo(async () => {
      await flushOps(userId);
      const result = await undoLatestReview(deckId, custom);
      if (result.undoneId) {
        opsRef.current = opsRef.current.filter((op) => op.id !== result.undoneId);
        await deleteOps([result.undoneId]);
      }
      if (result.pack) {
        if (!custom) await savePack(result.pack);
        nextPackRef.current = result.pack;
      }
      advance(result.cardId);
    });
  }, [view, undoing, userId, deckId, advance, custom]);

  const editNote = useCallback(() => {
    if (!card || !navigator.onLine) return;
    void flushOps(userId);
    const back = `/decks/${deckId}/study?${custom ? `${customStudyQuery(custom)}&` : ""}card=${card.id}`;
    router.push(`/notes/${card.noteId}/edit?from=${encodeURIComponent(back)}`);
  }, [card, userId, deckId, router, custom]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (onBreak) return;
      const target = (event.composedPath()[0] ?? event.target) as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (target?.closest?.("[data-translator]")) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
        return;
      }
      if (!card || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (!revealed) reveal();
        else rate(3);
        return;
      }
      if (event.key.toLowerCase() === "e") {
        event.preventDefault();
        editNote();
        return;
      }
      if (revealed && ["1", "2", "3", "4"].includes(event.key)) {
        event.preventDefault();
        rate(Number(event.key) as Rating);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed, reveal, rate, undo, editNote, onBreak]);

  const counts = view?.counts ?? { fresh: 0, learning: 0, review: 0 };
  const statusLabel = !online ? `${t.study.offline} · ${t.study.offlineHint}` : syncFailed && pendingOps > 0 ? t.study.pendingSync(pendingOps) : null;

  return (
    <div className={cn("relative -mb-24 flex h-[calc(100dvh_-_1rem_-_var(--safe-top))] flex-col md:mb-0 md:h-auto", translating && card && "translator-docked")}>
      <TimerNotice timer={timer} onFinish={() => router.push(`/decks/${deckId}`)} />
      <header className="flex items-center justify-between gap-3 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={`/decks/${deckId}`} aria-label={t.study.exit} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-5" />
          </Link>
          <p className="truncate text-sm font-medium">{initialPack.deckName}</p>
          {custom ? <span className="hidden shrink-0 rounded-full border px-2 py-0.5 text-xs text-muted-foreground sm:inline">{t.custom.badge(custom)}</span> : null}
        </div>
        <div className="flex items-center gap-2">
          {statusLabel ? (
            <span title={statusLabel} aria-label={statusLabel} className="flex items-center gap-1 text-xs text-muted-foreground">
              {online ? <RefreshCw className="size-3.5" /> : <CloudOff className="size-3.5" />}
              {pendingOps > 0 ? <span className="tabular-nums">{pendingOps}</span> : null}
            </span>
          ) : null}
          <div className="flex items-center gap-2 text-sm tabular-nums" aria-label={t.study.remaining}>
            <span className={cn("text-info", card?.state === "NEW" && "underline underline-offset-4")}>{counts.fresh}</span>
            <span className={cn("text-danger", (card?.state === "LEARNING" || card?.state === "RELEARNING") && "underline underline-offset-4")}>
              {counts.learning}
            </span>
            <span className={cn("text-success", card?.state === "REVIEW" && "underline underline-offset-4")}>{counts.review}</span>
          </div>
          <StudyTimerButton timer={timer} />
          {card && online ? (
            <Button variant="ghost" size="icon" onClick={editNote} aria-label={t.study.editNote} title={t.study.editNote}>
              <Pencil className="size-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" onClick={undo} disabled={!view?.canUndo || undoing} aria-label={t.study.undo}>
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
              {online ? null : (
                <MenuItem icon={<Pencil />} onSelect={editNote}>
                  {t.study.editNeedsConnection}
                </MenuItem>
              )}
              <MenuItem
                icon={<Flag />}
                onSelect={() => record({ id: uuid(), userId, cardId: card.id, at: new Date().toISOString(), kind: "flag", flag: card.flag ? 0 : 1 }, "stay")}
              >
                {card.flag ? t.study.removeFlag : t.study.flag}
              </MenuItem>
              {online ? (
                <MenuItem icon={<Info />} onSelect={() => setInfoCard(card.id)}>
                  {t.cardInfo.open}
                </MenuItem>
              ) : null}
              <MenuSeparator />
              <MenuItem icon={<EyeOff />} onSelect={() => record({ id: uuid(), userId, cardId: card.id, at: new Date().toISOString(), kind: "bury" }, "advance")}>
                {t.study.buryUntilTomorrow}
              </MenuItem>
              <MenuItem
                icon={<PauseCircle />}
                tone="danger"
                onSelect={() => record({ id: uuid(), userId, cardId: card.id, at: new Date().toISOString(), kind: "suspend" }, "advance")}
              >
                {t.study.suspend}
              </MenuItem>
            </Menu>
          ) : null}
        </div>
      </header>

      {!view ? (
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="min-h-0 flex-1 rounded-2xl md:min-h-96" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : onBreak ? (
        <TimerBreak timer={timer} />
      ) : card ? (
        <>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <section
              ref={sectionRef}
              className={cn(
                "relative flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border bg-card shadow-sm transition-opacity md:min-h-96",
                undoing && "opacity-60",
              )}
              style={swipe.style}
              {...swipe.handlers}
              onClick={() => {
                if (!revealed) reveal();
              }}
            >
              <SwipeTint direction={swipe.direction} progress={swipe.progress} rightLabel={t.study.good} leftLabel={t.study.again} />
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
                typed={revealed ? typed : undefined}
                onTyped={onTyped}
                onSubmitTyped={reveal}
              />
            </section>
            {swipeHint && revealed ? <SwipeHint target={sectionRef} text={t.study.swipeHint} onDone={endSwipeHint} /> : null}
            <StudyTranslator cardHtml={revealed ? card.answer : card.question} cardRef={sectionRef} deckId={deckId} open={translating} onOpenChange={setTranslating} />
          </div>

          <footer className="safe-bottom pt-3">
            {revealed ? (
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 3, 4] as Rating[]).map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    disabled={undoing}
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
                disabled={undoing}
              >
                <Eye className="size-5" aria-hidden />
                {t.study.showAnswer}
                <kbd className="ml-1 hidden rounded-md border border-current/25 px-1.5 py-0.5 font-sans text-xs font-medium opacity-60 md:inline">
                  {t.study.spaceKey}
                </kbd>
              </Button>
            )}
            <p className="mt-2 hidden text-center text-xs text-muted-foreground md:block">{t.study.shortcutsHint}</p>
            {revealed ? <p className="mt-2 text-center text-xs text-muted-foreground md:hidden">{t.study.swipeShortHint}</p> : null}
          </footer>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-10 text-center animate-in">
          <CheckCircle2 className="size-12 text-success" />
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">{custom ? t.custom.finished : t.study.finishedTitle}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {view.learnAheadAt
                ? t.study.learnAheadAt(view.learnAheadAt.toLocaleTimeString(intlLocale(locale), { hour: "2-digit", minute: "2-digit" }))
                : t.study.noMoreCards}
            </p>
            {pendingOps > 0 ? <p className="text-xs text-muted-foreground">{t.study.pendingSync(pendingOps)}</p> : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/decks/${deckId}`)}>
              {t.study.backToDeck}
            </Button>
            {view.canUndo ? (
              <Button variant="ghost" onClick={undo} disabled={undoing}>
                <Undo2 className="size-4" />
                {t.study.undo}
              </Button>
            ) : null}
          </div>
        </div>
      )}
      <CardInfoDialog cardId={infoCard} onClose={() => setInfoCard(null)} />
    </div>
  );
}
