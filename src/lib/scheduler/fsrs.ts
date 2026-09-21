import { createEmptyCard, fsrs, generatorParameters, Rating as FsrsRating, State, type Card as FsrsCard, type Grade, type FSRSParameters, type StepUnit } from "ts-fsrs";
import { addDays } from "./day";
import type { CardState, Rating, SchedulableCard, SchedulerConfig, SchedulerContext, ScheduleResult } from "./types";

const stateToFsrs: Record<CardState, State> = {
  NEW: State.New,
  LEARNING: State.Learning,
  REVIEW: State.Review,
  RELEARNING: State.Relearning,
};

const stateFromFsrs: Record<State, CardState> = {
  [State.New]: "NEW",
  [State.Learning]: "LEARNING",
  [State.Review]: "REVIEW",
  [State.Relearning]: "RELEARNING",
};

const ratingToGrade: Record<Rating, Grade> = {
  1: FsrsRating.Again,
  2: FsrsRating.Hard,
  3: FsrsRating.Good,
  4: FsrsRating.Easy,
};

function toSteps(minutes: number[]): StepUnit[] {
  return minutes.map((m) => (m >= 1440 && m % 1440 === 0 ? `${m / 1440}d` : m >= 60 && m % 60 === 0 ? `${m / 60}h` : `${Math.max(1, Math.round(m))}m`) as StepUnit);
}

function buildParameters(config: SchedulerConfig): FSRSParameters {
  const weights = config.fsrsWeights.length >= 17 ? config.fsrsWeights : undefined;
  return generatorParameters({
    request_retention: config.desiredRetention,
    maximum_interval: config.maxInterval,
    w: weights,
    enable_fuzz: true,
    enable_short_term: true,
    learning_steps: toSteps(config.learningSteps),
    relearning_steps: toSteps(config.relearningSteps),
  });
}

function approximateDifficulty(ease: number) {
  const normalized = (ease - 1300) / (2500 - 1300);
  return Math.min(10, Math.max(1, 11 - normalized * 6.5));
}

export function toFsrsCard(card: SchedulableCard, now: Date): FsrsCard {
  const base = createEmptyCard(now);
  const hasMemory = card.stability != null && card.difficulty != null && card.stability > 0;
  const stability = hasMemory ? card.stability! : Math.max(card.interval, 0.1);
  const difficulty = hasMemory ? card.difficulty! : approximateDifficulty(card.ease);
  const elapsed = card.lastReview ? Math.max(0, Math.round((now.getTime() - card.lastReview.getTime()) / 86_400_000)) : 0;
  if (card.state === "NEW") return { ...base, reps: card.reps, lapses: card.lapses };
  return {
    ...base,
    due: card.due,
    stability,
    difficulty,
    elapsed_days: elapsed,
    scheduled_days: Math.round(card.interval),
    learning_steps: card.step,
    reps: card.reps,
    lapses: card.lapses,
    state: stateToFsrs[card.state],
    last_review: card.lastReview ?? undefined,
  };
}

function fromFsrsCard(next: FsrsCard, previous: SchedulableCard, ctx: SchedulerContext, config: SchedulerConfig): SchedulableCard {
  const state = stateFromFsrs[next.state];
  const isReview = state === "REVIEW";
  const scheduled = Math.max(1, Math.min(config.maxInterval, next.scheduled_days));
  return {
    state,
    due: isReview ? addDays(ctx.dayStart, scheduled) : next.due,
    interval: isReview ? scheduled : previous.interval,
    ease: previous.ease,
    reps: next.reps,
    lapses: next.lapses,
    step: next.learning_steps,
    stability: next.stability,
    difficulty: next.difficulty,
    lastReview: new Date(ctx.now),
  };
}

export function scheduleFsrs(
  input: SchedulableCard,
  rating: Rating,
  config: SchedulerConfig,
  ctx: SchedulerContext,
): ScheduleResult {
  const scheduler = fsrs(buildParameters(config));
  const current = toFsrsCard(input, ctx.now);
  const { card: next } = scheduler.next(current, ctx.now, ratingToGrade[rating]);
  const card = fromFsrsCard(next, input, ctx, config);
  let leech = false;
  if (rating === 1 && input.state === "REVIEW" && config.leechThreshold > 0 && card.lapses >= config.leechThreshold) {
    const halfway = Math.max(1, Math.floor(config.leechThreshold / 2));
    leech = (card.lapses - config.leechThreshold) % halfway === 0;
  }
  return { card, leech };
}

export function fsrsRetrievability(card: SchedulableCard, config: SchedulerConfig, now: Date) {
  if (card.state === "NEW") return null;
  const scheduler = fsrs(buildParameters(config));
  return scheduler.get_retrievability(toFsrsCard(card, now), now, false);
}
