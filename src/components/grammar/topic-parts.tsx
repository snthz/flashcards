"use client";

import { useState } from "react";
import { Check, CheckCircle2, RotateCcw, Volume2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import type { GrammarQuestion } from "@/lib/grammar/types";
import { cn } from "@/lib/utils";
import { saveTopicProgress, useGrammarProgress } from "./progress";
import { InlineMarkdown } from "./rich-text";
import { speakText } from "@/components/study/speech-clip";

function speak(text: string) {
  speakText(text, "en-US");
}

export function ListenButton({ text }: { text: string }) {
  const t = useI18n().t.grammar;
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label={t.listen}
      title={t.listen}
      className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Volume2 className="size-4" />
    </button>
  );
}

function Blanked({ prompt }: { prompt: string }) {
  const parts = prompt.split("___");
  if (parts.length === 1) return <InlineMarkdown text={prompt} />;
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 ? <span className="mx-0.5 inline-block w-14 border-b-2 border-foreground/40 align-baseline" aria-label="___" /> : null}
        </span>
      ))}
    </>
  );
}

export function GrammarQuiz({ slug, questions }: { slug: string; questions: GrammarQuestion[] }) {
  const t = useI18n().t.grammar;
  const [answers, setAnswers] = useState<Array<number | null>>(() => questions.map(() => null));
  const [round, setRound] = useState(0);
  const answered = answers.filter((value) => value !== null).length;
  const right = answers.filter((value, index) => value === questions[index].answer).length;
  const finished = answered === questions.length;

  const choose = (question: number, option: number) => {
    if (answers[question] !== null) return;
    const next = answers.map((value, index) => (index === question ? option : value));
    setAnswers(next);
    if (next.every((value) => value !== null)) {
      const score = next.filter((value, index) => value === questions[index].answer).length;
      saveTopicProgress(slug, { done: true, score, total: questions.length });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ol key={round} className="flex flex-col gap-3">
        {questions.map((question, index) => {
          const chosen = answers[index];
          const isRight = chosen === question.answer;
          return (
            <li key={index} className="flex flex-col gap-3 rounded-xl border bg-card p-4 animate-in">
              <p className="flex gap-2 text-[15px] font-medium leading-relaxed">
                <span className="tabular-nums text-muted-foreground">{index + 1}.</span>
                <span lang={question.prompt.includes("___") ? "en" : undefined}>
                  <Blanked prompt={question.prompt} />
                </span>
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => {
                  const correct = chosen !== null && optionIndex === question.answer;
                  const wrong = chosen === optionIndex && !isRight;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={chosen !== null}
                      onClick={() => choose(index, optionIndex)}
                      className={cn(
                        "flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3.5 py-2 text-left text-sm transition-colors",
                        chosen === null && "hover:border-foreground/30 hover:bg-muted/50",
                        correct && "border-success bg-success-soft text-success",
                        wrong && "border-danger bg-danger-soft text-danger",
                        chosen !== null && !correct && !wrong && "opacity-50",
                      )}
                    >
                      <span lang="en">{option}</span>
                      {correct ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
              {chosen !== null ? (
                <p className={cn("flex items-start gap-2 text-sm animate-in", isRight ? "text-success" : "text-danger")}>
                  {isRight ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
                  <span>
                    <span className="font-medium">{isRight ? t.correct : t.wrong}.</span> <span className="text-muted-foreground">
                      <InlineMarkdown text={question.explanation} />
                    </span>
                  </span>
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
      {finished ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-5 text-center animate-in sm:flex-row sm:justify-between sm:text-left">
          <p className="text-base font-semibold tabular-nums">{t.quizScore(right, questions.length)}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAnswers(questions.map(() => null));
              setRound((value) => value + 1);
            }}
          >
            <RotateCcw className="size-4" />
            {t.retry}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{t.quizHint}</p>
      )}
    </div>
  );
}

export function DoneToggle({ slug }: { slug: string }) {
  const t = useI18n().t.grammar;
  const progress = useGrammarProgress();
  const done = Boolean(progress[slug]?.done);
  return (
    <Button variant={done ? "secondary" : "outline"} size="sm" onClick={() => saveTopicProgress(slug, { done: !done })} aria-pressed={done}>
      {done ? <CheckCircle2 className="size-4" /> : <Check className="size-4" />}
      {done ? t.markedDone : t.markDone}
    </Button>
  );
}
