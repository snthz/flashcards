"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { Turtle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import { makeCloze } from "@/lib/practice/extract";
import { grade } from "@/lib/practice/grade";
import { shuffle } from "@/lib/practice/session";
import type { Exercise, Grade, PendingGrade, PracticeItem, SentenceAttempt } from "@/lib/practice/types";
import { speechLocale } from "@/lib/translate/vocabulary";
import { speakText, type SpeechClip } from "@/components/study/speech-clip";
import { cn } from "@/lib/utils";

export interface Outcome {
  grade: PendingGrade;
  detail?: ReactNode;
  attempt?: SentenceAttempt;
}

export interface ExerciseProps<K extends Exercise["kind"]> {
  exercise: Extract<Exercise, { kind: K }>;
  done: boolean;
  hasKey: boolean;
  onDone: (outcome: Outcome) => void;
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let speaking: SpeechClip | null = null;

export function say(text: string, language: PracticeItem["language"], rate = 1) {
  if (!canSpeak() || !language) return;
  speaking = speakText(text, speechLocale(language), rate);
}

export function stopSaying() {
  speaking?.pause();
  speaking = null;
}

function useLanguageLabel() {
  const { locale } = useI18n();
  return useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([intlLocale(locale)], { type: "language" });
    } catch {
      names = null;
    }
    return (code: string | null) => (code ? (names?.of(code) ?? code) : "");
  }, [locale]);
}

function Prompt({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function SpeakButton({ item, text = item.term, size = "md" }: { item: PracticeItem; text?: string; size?: "md" | "lg" }) {
  const t = useI18n().t.practice;
  if (!item.language || !canSpeak()) return null;
  return (
    <button
      type="button"
      onClick={() => say(text, item.language)}
      aria-label={t.play}
      title={t.play}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-muted active:scale-95",
        size === "lg" ? "size-14" : "size-9",
      )}
    >
      <Volume2 className={size === "lg" ? "size-6" : "size-4"} />
    </button>
  );
}

function AnswerForm({
  done,
  onSubmit,
  onSkip,
  children,
  canSubmit,
}: {
  done: boolean;
  onSubmit: () => void;
  onSkip: () => void;
  children: ReactNode;
  canSubmit: boolean;
}) {
  const t = useI18n().t.practice;
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        if (!done && canSubmit) onSubmit();
      }}
    >
      {children}
      {done ? null : (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={onSkip}>
            {t.skip}
          </Button>
          <Button type="submit" disabled={!canSubmit} className="sm:min-w-36">
            {t.check}
          </Button>
        </div>
      )}
    </form>
  );
}

function AnswerInput({ value, onChange, done, result, language, placeholder, autoFocus = true }: { value: string; onChange: (value: string) => void; done: boolean; result: Grade | null; language?: string | null; placeholder?: string; autoFocus?: boolean }) {
  const t = useI18n().t.practice;
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      readOnly={done}
      autoFocus={autoFocus}
      autoCapitalize="none"
      autoCorrect="off"
      autoComplete="off"
      spellCheck={false}
      lang={language ?? undefined}
      placeholder={placeholder ?? t.placeholder}
      aria-label={placeholder ?? t.placeholder}
      className={cn(
        "h-12 text-center text-lg sm:text-lg",
        result === "correct" && "border-success text-success",
        result === "almost" && "border-warning",
        result === "wrong" && "border-danger text-danger line-through decoration-1",
      )}
    />
  );
}

export function ExampleLine({ item }: { item: PracticeItem }) {
  if (!item.example) return null;
  return (
    <span className="mt-1 block text-muted-foreground">
      <span lang={item.language ?? undefined}>{item.example}</span>
      {item.exampleTranslation ? <span className="block">{item.exampleTranslation}</span> : null}
    </span>
  );
}

export function ChoiceExercise({ exercise, done, onDone }: ExerciseProps<"choice">) {
  const t = useI18n().t.practice;
  const { item, reverse, options } = exercise;
  const answer = reverse ? item.term : item.meaning;
  const [chosen, setChosen] = useState<string | null>(null);

  const pick = (option: string) => {
    if (done) return;
    setChosen(option);
    onDone({ grade: option === answer ? "correct" : "wrong", detail: <ExampleLine item={item} /> });
  };

  useEffect(() => {
    if (done) return;
    const onKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < options.length && !(event.target instanceof HTMLInputElement)) pick(options[index]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col gap-6">
      <Prompt label={reverse ? t.choiceTerm : t.choiceMeaning}>
        <div className="flex items-center gap-3">
          <p className="text-3xl font-semibold tracking-tight" lang={reverse ? undefined : (item.language ?? undefined)}>
            {reverse ? item.meaning : item.term}
          </p>
          {reverse ? null : <SpeakButton item={item} />}
        </div>
      </Prompt>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option, index) => {
          const right = done && option === answer;
          const wrong = done && option === chosen && option !== answer;
          return (
            <button
              key={option}
              type="button"
              disabled={done}
              onClick={() => pick(option)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left text-sm font-medium transition-[border-color,background-color,transform] active:scale-[0.99]",
                !done && "hover:border-foreground/30 hover:bg-muted/50",
                right && "border-success bg-success-soft text-success",
                wrong && "border-danger bg-danger-soft text-danger",
                done && !right && !wrong && "opacity-50",
              )}
            >
              <kbd className="hidden size-6 shrink-0 items-center justify-center rounded-md border font-sans text-xs text-muted-foreground sm:flex">{index + 1}</kbd>
              <span lang={reverse ? (item.language ?? undefined) : undefined}>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TypeExercise({ exercise, done, onDone }: ExerciseProps<"type">) {
  const t = useI18n().t.practice;
  const languageLabel = useLanguageLabel();
  const { item } = exercise;
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Grade | null>(null);

  const finish = (graded: Grade) => {
    setResult(graded);
    onDone({
      grade: graded,
      detail: (
        <>
          <span className="flex items-center gap-2 font-semibold text-foreground" lang={item.language ?? undefined}>
            {item.term}
            <SpeakButton item={item} />
          </span>
          <ExampleLine item={item} />
        </>
      ),
    });
  };

  return (
    <AnswerForm done={done} canSubmit={Boolean(value.trim())} onSubmit={() => finish(grade(value, item.term))} onSkip={() => finish("wrong")}>
      <Prompt label={t.typePrompt}>
        <p className="text-3xl font-semibold tracking-tight">{item.meaning}</p>
        {item.language ? <p className="text-sm text-muted-foreground">{t.typeHint(languageLabel(item.language))}</p> : null}
      </Prompt>
      <AnswerInput value={value} onChange={setValue} done={done} result={result} language={item.language} />
    </AnswerForm>
  );
}

export function ClozeExercise({ exercise, done, onDone }: ExerciseProps<"cloze">) {
  const t = useI18n().t.practice;
  const { item, cloze } = exercise;
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Grade | null>(null);
  const width = Math.max(cloze.answer.length + 2, 6);

  const finish = (graded: Grade) => {
    setResult(graded);
    onDone({
      grade: graded,
      detail: (
        <>
          <span className="font-semibold text-foreground" lang={item.language ?? undefined}>
            {cloze.before}
            <span className="underline decoration-2 underline-offset-4">{cloze.answer}</span>
            {cloze.after}
          </span>
          {item.exampleTranslation ? <span className="mt-1 block text-muted-foreground">{item.exampleTranslation}</span> : null}
        </>
      ),
    });
  };

  return (
    <AnswerForm done={done} canSubmit={Boolean(value.trim())} onSubmit={() => finish(grade(value, [cloze.answer]))} onSkip={() => finish("wrong")}>
      <Prompt label={t.clozePrompt}>
        <p className="max-w-lg text-xl leading-loose sm:text-2xl" lang={item.language ?? undefined}>
          {cloze.before}
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            readOnly={done}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-label={t.placeholder}
            style={{ width: `${width}ch` }}
            className={cn(
              "mx-1 inline-block border-b-2 border-foreground/40 bg-transparent px-1 text-center font-semibold outline-none transition-colors focus:border-foreground",
              result === "correct" && "border-success text-success",
              result === "almost" && "border-warning",
              result === "wrong" && "border-danger text-danger line-through decoration-1",
            )}
          />
          {cloze.after}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t.hint}:</span> {item.meaning}
        </p>
      </Prompt>
    </AnswerForm>
  );
}

export function ListenExercise({ exercise, done, onDone }: ExerciseProps<"listen">) {
  const t = useI18n().t.practice;
  const { item, sentence } = exercise;
  const text = sentence ? item.example : item.term;
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Grade | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => say(text, item.language), 250);
    return () => {
      window.clearTimeout(timer);
      stopSaying();
    };
  }, [text, item.language]);

  const finish = (graded: Grade) => {
    setResult(graded);
    onDone({
      grade: graded,
      detail: (
        <>
          <span className="font-semibold text-foreground" lang={item.language ?? undefined}>
            {text}
          </span>
          <span className="mt-1 block text-muted-foreground">{sentence ? item.exampleTranslation : item.meaning}</span>
        </>
      ),
    });
  };

  return (
    <AnswerForm done={done} canSubmit={Boolean(value.trim())} onSubmit={() => finish(grade(value, text))} onSkip={() => finish("wrong")}>
      <Prompt label={sentence ? t.listenSentence : t.listenPrompt}>
        {canSpeak() ? (
          <div className="flex items-center gap-3">
            <SpeakButton item={item} text={text} size="lg" />
            <button
              type="button"
              onClick={() => say(text, item.language, 0.6)}
              aria-label={t.playSlow}
              title={t.playSlow}
              className="flex size-10 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Turtle className="size-4" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.noAudio}</p>
        )}
      </Prompt>
      {sentence ? (
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          readOnly={done}
          autoFocus
          rows={2}
          lang={item.language ?? undefined}
          spellCheck={false}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          className={cn("resize-none text-center text-lg sm:text-lg", result === "correct" && "border-success", result === "wrong" && "border-danger")}
        />
      ) : (
        <AnswerInput value={value} onChange={setValue} done={done} result={result} language={item.language} />
      )}
    </AnswerForm>
  );
}

export function SentenceExercise({ exercise, done, onDone, hasKey }: ExerciseProps<"sentence">) {
  const { t } = useI18n();
  const p = t.practice;
  const { item } = exercise;
  const [value, setValue] = useState("");
  const [selfCheck, setSelfCheck] = useState(false);
  const usesTerm = makeCloze(value, [item.answer, item.term].filter(Boolean)) !== null;

  const submit = () => {
    if (hasKey) {
      onDone({
        grade: "pending",
        attempt: { id: exercise.id, term: item.term, meaning: item.meaning, language: item.language, sentence: value.trim() },
        detail: <span className="block text-muted-foreground">{p.savedForReviewHint}</span>,
      });
      return;
    }
    setSelfCheck(true);
  };

  const judge = (good: boolean) => {
    onDone({ grade: good ? "correct" : "wrong", detail: <ExampleLine item={item} /> });
  };

  return (
    <div className="flex flex-col gap-4">
      <Prompt label={p.kinds.sentence.hint}>
        <div className="flex items-center gap-3">
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl" lang={item.language ?? undefined}>
            {item.term}
          </p>
          <SpeakButton item={item} />
        </div>
        <p className="text-sm text-muted-foreground">{item.meaning}</p>
      </Prompt>
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        readOnly={done || selfCheck}
        autoFocus
        rows={3}
        maxLength={400}
        lang={item.language ?? undefined}
        placeholder={p.sentencePlaceholder}
        aria-label={p.sentencePrompt(item.term)}
        className="resize-none text-base sm:text-base"
      />
      {value.trim().length > 3 && !usesTerm && !done ? <p className="text-xs text-muted-foreground">{p.missingTerm(item.term)}</p> : null}
      {selfCheck && !done ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4 text-sm animate-in">
          <p className="text-muted-foreground">
            {p.selfCheckHint}{" "}
            <Link href="/settings?tab=translator" className="font-medium text-foreground underline underline-offset-2">
              {t.assistant.noKeyAction}
            </Link>
          </p>
          {item.example ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{p.selfCheck}</p>
              <p className="font-medium" lang={item.language ?? undefined}>
                {item.example}
              </p>
              {item.exampleTranslation ? <p className="text-muted-foreground">{item.exampleTranslation}</p> : null}
            </div>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => judge(false)}>
              {p.selfBad}
            </Button>
            <Button autoFocus onClick={() => judge(true)}>
              {p.selfGood}
            </Button>
          </div>
        </div>
      ) : null}
      {done || selfCheck ? null : (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={() => onDone({ grade: "wrong", detail: <ExampleLine item={item} /> })}>
            {p.skip}
          </Button>
          <Button onClick={submit} disabled={value.trim().length < 3} className="sm:min-w-36">
            {p.check}
          </Button>
        </div>
      )}
    </div>
  );
}

export function FormsExercise({ exercise, done, onDone }: ExerciseProps<"forms">) {
  const t = useI18n().t.practice;
  const { item } = exercise;
  const [past, setPast] = useState("");
  const [participle, setParticiple] = useState("");
  const [results, setResults] = useState<[Grade, Grade] | null>(null);

  const finish = (graded: [Grade, Grade]) => {
    setResults(graded);
    const overall: Grade = graded.every((value) => value === "correct") ? "correct" : graded.includes("wrong") ? "wrong" : "almost";
    onDone({
      grade: overall,
      detail: (
        <span className="font-semibold text-foreground" lang={item.language ?? undefined}>
          {item.term} · {item.past} · {item.participle}
        </span>
      ),
    });
  };

  return (
    <AnswerForm
      done={done}
      canSubmit={Boolean(past.trim() && participle.trim())}
      onSubmit={() => finish([grade(past, item.past), grade(participle, item.participle)])}
      onSkip={() => finish(["wrong", "wrong"])}
    >
      <Prompt label={t.formsPrompt(item.term)}>
        <div className="flex items-center gap-3">
          <p className="text-3xl font-semibold tracking-tight" lang={item.language ?? undefined}>
            {item.term}
          </p>
          <SpeakButton item={item} />
        </div>
        <p className="text-sm text-muted-foreground">{item.meaning}</p>
      </Prompt>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {t.past}
          <AnswerInput value={past} onChange={setPast} done={done} result={results?.[0] ?? null} language={item.language} placeholder={t.past} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {t.participle}
          <AnswerInput value={participle} onChange={setParticiple} done={done} result={results?.[1] ?? null} language={item.language} placeholder={t.participle} autoFocus={false} />
        </label>
      </div>
    </AnswerForm>
  );
}

export function MatchExercise({ exercise, done, onDone }: ExerciseProps<"match">) {
  const t = useI18n().t.practice;
  const [meanings] = useState(() => shuffle(exercise.items));
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [miss, setMiss] = useState<string | null>(null);
  const mistakes = useRef(0);

  const choose = (meaningId: string) => {
    if (done || !selected || matched.has(meaningId)) return;
    if (meaningId === selected) {
      const next = new Set(matched).add(meaningId);
      setMatched(next);
      setSelected(null);
      if (next.size === exercise.items.length) {
        const count = mistakes.current;
        onDone({ grade: count === 0 ? "correct" : count === 1 ? "almost" : "wrong", detail: count > 0 ? <span>{t.mistakes(count)}</span> : undefined });
      }
      return;
    }
    mistakes.current += 1;
    setMiss(meaningId);
    window.setTimeout(() => setMiss(null), 450);
  };

  const tile = "flex min-h-12 items-center justify-center rounded-xl border bg-card px-3 py-2 text-center text-sm font-medium transition-[border-color,background-color,opacity,transform] active:scale-[0.98]";

  return (
    <div className="flex flex-col gap-6">
      <Prompt label={t.matchPrompt}>
        <span />
      </Prompt>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="flex flex-col gap-2">
          {exercise.items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={done || matched.has(item.id)}
              onClick={() => {
                setSelected(item.id);
                say(item.term, item.language);
              }}
              lang={item.language ?? undefined}
              className={cn(
                tile,
                matched.has(item.id) && "border-success/40 bg-success-soft text-success opacity-70",
                selected === item.id && "border-foreground ring-2 ring-ring",
                !matched.has(item.id) && selected !== item.id && "hover:border-foreground/30",
              )}
            >
              {item.term}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {meanings.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={done || matched.has(item.id)}
              onClick={() => choose(item.id)}
              className={cn(
                tile,
                matched.has(item.id) && "border-success/40 bg-success-soft text-success opacity-70",
                miss === item.id && "animate-shake border-danger bg-danger-soft text-danger",
                !matched.has(item.id) && selected && "hover:border-foreground/30",
                !selected && !matched.has(item.id) && "text-muted-foreground",
              )}
            >
              {item.meaning}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
