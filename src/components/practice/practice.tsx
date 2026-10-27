"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ComponentType } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Dumbbell,
  Headphones,
  Link2,
  ListChecks,
  MessageSquareText,
  PenLine,
  RotateCcw,
  Rows3,
  Settings2,
  TextCursorInput,
  Trophy,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/client";
import { loadPracticeItems } from "@/lib/practice/actions";
import { applicableKinds, buildSession } from "@/lib/practice/session";
import { EXERCISE_KINDS, PRACTICE_PERIODS, type Exercise, type ExerciseKind, type Grade, type PracticeItem, type PracticePeriod } from "@/lib/practice/types";
import { cn, formatNumber } from "@/lib/utils";
import {
  canSpeak,
  ChoiceExercise,
  ClozeExercise,
  FormsExercise,
  ListenExercise,
  MatchExercise,
  SentenceExercise,
  TypeExercise,
  type ExerciseProps,
  type Outcome,
} from "./exercises";

const PREFS_KEY = "fc-practice";
const LENGTHS = [5, 10, 20] as const;

const KIND_ICONS: Record<ExerciseKind, LucideIcon> = {
  choice: ListChecks,
  type: PenLine,
  cloze: TextCursorInput,
  listen: Headphones,
  sentence: MessageSquareText,
  forms: Rows3,
  match: Link2,
};

const VIEWS: { [K in ExerciseKind]: ComponentType<ExerciseProps<K>> } = {
  choice: ChoiceExercise,
  type: TypeExercise,
  cloze: ClozeExercise,
  listen: ListenExercise,
  sentence: SentenceExercise,
  forms: FormsExercise,
  match: MatchExercise,
};

interface Prefs {
  deckId: string | null;
  period: PracticePeriod;
  kinds: ExerciseKind[];
  length: number;
}

const DEFAULT_PREFS: Prefs = { deckId: null, period: "all", kinds: ["choice", "type", "cloze", "listen", "sentence", "forms", "match"], length: 10 };

function loadPrefs(decks: Array<{ id: string }>, initialDeck: string | null): Prefs {
  let saved: Partial<Prefs> = {};
  try {
    saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") as Partial<Prefs>;
  } catch {
    saved = {};
  }
  const deckId = [initialDeck, saved.deckId].find((id) => id && decks.some((deck) => deck.id === id)) ?? null;
  const kinds = Array.isArray(saved.kinds) ? saved.kinds.filter((kind): kind is ExerciseKind => EXERCISE_KINDS.includes(kind)) : DEFAULT_PREFS.kinds;
  return {
    deckId,
    period: PRACTICE_PERIODS.includes(saved.period as PracticePeriod) ? (saved.period as PracticePeriod) : DEFAULT_PREFS.period,
    kinds: kinds.length > 0 ? kinds : DEFAULT_PREFS.kinds,
    length: LENGTHS.includes(saved.length as (typeof LENGTHS)[number]) ? (saved.length as number) : DEFAULT_PREFS.length,
  };
}

function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    return;
  }
}

function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "min-h-8 rounded-md px-2 py-1 text-xs font-medium transition-colors sm:text-sm",
            value === option.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface Result {
  exercise: Exercise;
  grade: Grade;
}

function Setup({
  decks,
  prefs,
  onPrefs,
  items,
  loading,
  onStart,
}: {
  decks: Array<{ id: string; name: string }>;
  prefs: Prefs;
  onPrefs: (patch: Partial<Prefs>) => void;
  items: PracticeItem[] | null;
  loading: boolean;
  onStart: () => void;
}) {
  const { locale, t } = useI18n();
  const p = t.practice;
  const speech = canSpeak();
  const fits = useMemo(() => {
    const map = new Map<ExerciseKind, boolean>();
    for (const kind of EXERCISE_KINDS) {
      map.set(kind, Boolean(items?.some((item) => applicableKinds(item, items, { kinds: [kind], length: 1, canSpeak: speech }).length > 0)));
    }
    return map;
  }, [items, speech]);
  const ready = prefs.kinds.some((kind) => fits.get(kind));
  const terms = useMemo(() => [...new Map((items ?? []).map((item) => [item.term.toLowerCase(), item.term])).values()], [items]);
  const count = items?.length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">{p.words}</h2>
          {loading ? <Skeleton className="h-5 w-28" /> : <span className="text-sm text-muted-foreground">{p.available(count, formatNumber(count, locale))}</span>}
        </div>
        <div className="grid gap-3">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            {p.source}
            <Select
              label={p.source}
              value={prefs.deckId ?? ""}
              onChange={(deckId) => onPrefs({ deckId: deckId || null })}
              options={[{ value: "", label: p.allDecks }, ...decks.map((deck) => ({ value: deck.id, label: deck.name }))]}
            />
          </label>
          <div className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            {p.period}
            <Segmented label={p.period} value={prefs.period} onChange={(period) => onPrefs({ period })} options={PRACTICE_PERIODS.map((value) => ({ value, label: p.periods[value] }))} />
          </div>
        </div>
        {terms.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {terms.slice(0, 12).map((term) => (
              <span key={term} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                {term}
              </span>
            ))}
            {terms.length > 12 ? <span className="px-1 py-0.5 text-xs text-muted-foreground">+{formatNumber(terms.length - 12, locale)}</span> : null}
          </div>
        ) : null}
        {items && items.length > 0 && items.length < 4 ? <p className="text-xs text-muted-foreground">{p.tooFew}</p> : null}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
        <h2 className="text-sm font-semibold">{p.exercises}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXERCISE_KINDS.map((kind) => {
            const Icon = KIND_ICONS[kind];
            const on = prefs.kinds.includes(kind);
            const available = loading || fits.get(kind);
            return (
              <button
                key={kind}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => onPrefs({ kinds: on ? prefs.kinds.filter((value) => value !== kind) : [...prefs.kinds, kind] })}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                  on ? "border-foreground/40 bg-muted/60" : "hover:border-foreground/20",
                  !available && "opacity-60",
                )}
              >
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors", on ? "border-transparent bg-accent text-accent-foreground" : "bg-background text-muted-foreground")}>
                  <Icon className="size-[18px]" strokeWidth={1.9} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium">{p.kinds[kind].label}</span>
                  <span className="text-xs text-muted-foreground">{available ? p.kinds[kind].hint : p.unavailable}</span>
                </span>
                <span aria-hidden className={cn("mt-1 flex size-4 shrink-0 items-center justify-center rounded border", on && "border-foreground bg-foreground text-background")}>
                  {on ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground sm:max-w-xs">
          {p.length}
          <Segmented label={p.length} value={prefs.length} onChange={(length) => onPrefs({ length })} options={LENGTHS.map((value) => ({ value, label: String(value) }))} />
        </div>
      </section>

      <div className="flex flex-col items-center gap-2">
        <Button size="lg" className="w-full sm:w-auto sm:min-w-56" disabled={loading || !ready || count === 0} onClick={onStart}>
          <Dumbbell className="size-4" />
          {p.start}
        </Button>
        {prefs.kinds.length === 0 ? <p className="text-xs text-danger">{p.noKinds}</p> : <p className="text-xs text-muted-foreground">{p.notScheduled}</p>}
      </div>
    </div>
  );
}

const TONES: Record<Grade, { icon: LucideIcon; box: string; text: string }> = {
  correct: { icon: CheckCircle2, box: "border-success/30 bg-success-soft", text: "text-success" },
  almost: { icon: AlertCircle, box: "border-warning/30 bg-warning-soft", text: "text-warning" },
  wrong: { icon: XCircle, box: "border-danger/30 bg-danger-soft", text: "text-danger" },
};

function Feedback({ outcome, last, onContinue }: { outcome: Outcome; last: boolean; onContinue: () => void }) {
  const t = useI18n().t.practice;
  const tone = TONES[outcome.grade];
  const Icon = tone.icon;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);
  return (
    <div ref={ref} role="status" className={cn("flex flex-col gap-3 rounded-2xl border p-4 animate-in sm:flex-row sm:items-center sm:gap-4", tone.box)}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Icon className={cn("mt-0.5 size-5 shrink-0", tone.text)} />
        <div className="flex min-w-0 flex-col gap-1 text-sm">
          <p className={cn("font-semibold", tone.text)}>{outcome.grade === "correct" ? t.correct : outcome.grade === "almost" ? t.almost : t.wrong}</p>
          {outcome.grade === "almost" && !outcome.detail ? <p className="text-muted-foreground">{t.almostHint}</p> : null}
          {outcome.detail ? <div className="text-sm">{outcome.detail}</div> : null}
        </div>
      </div>
      <Button autoFocus onClick={onContinue} className="shrink-0 sm:min-w-32">
        {last ? t.results : t.continue}
      </Button>
    </div>
  );
}

function ExerciseView({ exercise, done, onDone }: { exercise: Exercise; done: boolean; onDone: (outcome: Outcome) => void }) {
  const View = VIEWS[exercise.kind] as ComponentType<ExerciseProps<Exercise["kind"]>>;
  return <View exercise={exercise as never} done={done} onDone={onDone} />;
}

function Session({ exercises, onExit, onFinish }: { exercises: Exercise[]; onExit: () => void; onFinish: (results: Result[]) => void }) {
  const t = useI18n().t.practice;
  const [index, setIndex] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const results = useRef<Result[]>([]);
  const exercise = exercises[index];
  const Icon = KIND_ICONS[exercise.kind];

  const done = (value: Outcome) => {
    if (outcome) return;
    results.current = [...results.current, { exercise, grade: value.grade }];
    setOutcome(value);
  };

  const next = () => {
    if (index + 1 >= exercises.length) {
      onFinish(results.current);
      return;
    }
    setOutcome(null);
    setIndex(index + 1);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onExit} aria-label={t.exit} title={t.exit} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="size-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={exercises.length} aria-valuenow={index + (outcome ? 1 : 0)}>
          <div className="h-full rounded-full bg-foreground transition-[width] duration-500 ease-out" style={{ width: `${((index + (outcome ? 1 : 0)) / exercises.length) * 100}%` }} />
        </div>
        <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">{t.progress(index + 1, exercises.length)}</span>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 font-medium">
          <Icon className="size-3.5" />
          {t.kinds[exercise.kind].label}
        </span>
        <span className="truncate">{exercise.item.deckName}</span>
      </div>
      <section key={exercise.id} className="rounded-2xl border bg-card p-5 shadow-sm animate-in sm:p-8">
        <ExerciseView exercise={exercise} done={Boolean(outcome)} onDone={done} />
      </section>
      {outcome ? <Feedback outcome={outcome} last={index + 1 >= exercises.length} onContinue={next} /> : <p className="hidden text-center text-xs text-muted-foreground md:block">{t.keyboardHint}</p>}
    </div>
  );
}

function Results({ results, onRetry, onAgain, onSettings }: { results: Result[]; onRetry: () => void; onAgain: () => void; onSettings: () => void }) {
  const t = useI18n().t.practice;
  const right = results.filter((result) => result.grade !== "wrong").length;
  const total = results.length;
  const ratio = total ? right / total : 0;
  const missed = results.filter((result) => result.grade === "wrong");
  const nailed = results.filter((result) => result.grade !== "wrong");
  const circumference = 2 * Math.PI * 44;
  const unique = (list: Result[]) => [...new Map(list.map((result) => [result.exercise.item.term.toLowerCase(), result])).values()];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 animate-in">
      <section className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-8 text-center">
        <div className="relative size-28">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" strokeWidth="8" className="stroke-muted" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn(ratio >= 0.8 ? "stroke-success" : ratio >= 0.5 ? "stroke-warning" : "stroke-danger")}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ratio)}
              style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center">
            <Trophy className="size-8" />
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{t.doneTitle}</h2>
          <p className="text-2xl font-semibold tabular-nums">{t.score(right, total)}</p>
          <p className="text-sm text-muted-foreground">{missed.length === 0 ? t.perfect : ratio >= 0.6 ? t.good : t.keepGoing}</p>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { title: t.toReview, list: unique(missed), icon: XCircle, tone: "text-danger" },
          { title: t.mastered, list: unique(nailed), icon: CheckCircle2, tone: "text-success" },
        ]
          .filter((group) => group.list.length > 0)
          .map((group) => (
            <section key={group.title} className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</h3>
              <ul className="flex flex-col">
                {group.list.map(({ exercise }) => (
                  <li key={exercise.item.term} className="flex items-start gap-2 py-1.5 text-sm">
                    <group.icon className={cn("mt-0.5 size-4 shrink-0", group.tone)} />
                    <span className="min-w-0">
                      <span className="font-medium" lang={exercise.item.language ?? undefined}>
                        {exercise.item.term}
                      </span>
                      <span className="text-muted-foreground"> · {exercise.item.meaning}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {missed.length > 0 ? (
          <Button onClick={onRetry}>
            <RotateCcw className="size-4" />
            {t.retryMissed}
          </Button>
        ) : null}
        <Button variant={missed.length > 0 ? "outline" : "primary"} onClick={onAgain}>
          <Dumbbell className="size-4" />
          {t.again}
        </Button>
        <Button variant="ghost" onClick={onSettings}>
          <Settings2 className="size-4" />
          {t.settings}
        </Button>
      </div>
    </div>
  );
}

export function Practice({ decks, initialDeck }: { decks: Array<{ id: string; name: string }>; initialDeck: string | null }) {
  const t = useI18n().t.practice;
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [items, setItems] = useState<PracticeItem[] | null>(null);
  const [loading, startLoading] = useTransition();
  const [stage, setStage] = useState<"setup" | "session" | "results">("setup");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setPrefs(loadPrefs(decks, initialDeck)), 0);
    return () => window.clearTimeout(timer);
  }, [decks, initialDeck]);

  const deckId = prefs?.deckId ?? null;
  const period = prefs?.period ?? null;
  useEffect(() => {
    if (!period) return;
    let cancelled = false;
    startLoading(async () => {
      const list = await loadPracticeItems({ deckId, period }).catch(() => []);
      if (!cancelled) setItems(list);
    });
    return () => {
      cancelled = true;
    };
  }, [deckId, period]);

  const updatePrefs = (patch: Partial<Prefs>) => {
    setPrefs((current) => {
      const next = { ...(current ?? DEFAULT_PREFS), ...patch };
      savePrefs(next);
      return next;
    });
  };

  const start = (focus?: PracticeItem[]) => {
    if (!prefs || !items) return;
    const length = focus ? Math.min(prefs.length, Math.max(focus.length, 3)) : prefs.length;
    const built = buildSession(items, { kinds: prefs.kinds, length, canSpeak: canSpeak() }, Math.random, focus);
    if (built.length === 0) return;
    setExercises(built);
    setRound((value) => value + 1);
    setStage("session");
    window.scrollTo({ top: 0 });
  };

  if (!prefs || (items === null && loading) || items === null) {
    return (
      <div className="flex flex-col gap-5" aria-busy>
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <span className="sr-only">{t.loading}</span>
      </div>
    );
  }

  if (stage === "session") {
    return (
      <Session
        key={round}
        exercises={exercises}
        onExit={() => setStage("setup")}
        onFinish={(list) => {
          setResults(list);
          setStage("results");
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  if (stage === "results") {
    const missed = [...new Map(results.filter((result) => result.grade === "wrong").map((result) => [result.exercise.item.id, result.exercise.item])).values()];
    return <Results results={results} onRetry={() => start(missed)} onAgain={() => start()} onSettings={() => setStage("setup")} />;
  }

  if (items.length === 0 && !loading && !prefs.deckId && prefs.period === "all") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Dumbbell className="size-5" />
        </span>
        <div className="flex max-w-sm flex-col gap-1">
          <p className="font-medium">{t.emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{t.emptyDescription}</p>
        </div>
        <Link href="/decks" className={buttonStyles("primary", "md", "mt-2")}>
          {t.emptyAction}
        </Link>
      </div>
    );
  }

  return <Setup decks={decks} prefs={prefs} onPrefs={updatePrefs} items={items} loading={loading} onStart={() => start()} />;
}
