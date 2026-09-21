import { addDays, addMinutes, daysBetween } from "./day";
import type {
  Rating,
  SchedulableCard,
  SchedulerConfig,
  SchedulerContext,
  ScheduleResult,
} from "./types";

const MIN_EASE = 1300;

function clone(card: SchedulableCard): SchedulableCard {
  return { ...card, due: new Date(card.due), lastReview: card.lastReview ? new Date(card.lastReview) : null };
}

function fuzzInterval(interval: number, random: () => number) {
  if (interval < 2.5) return interval;
  let range: [number, number];
  if (interval < 7) range = [Math.max(1, interval * 0.25), 1];
  else if (interval < 30) range = [Math.max(2, interval * 0.15), 1];
  else range = [Math.max(4, interval * 0.05), 1];
  const fuzz = range[0];
  const min = Math.max(2, Math.round(interval - fuzz));
  const max = Math.round(interval + fuzz);
  return min + Math.floor(random() * (max - min + 1));
}

function constrainInterval(interval: number, config: SchedulerConfig, random: () => number) {
  const fuzzed = fuzzInterval(interval, random);
  return Math.max(1, Math.min(config.maxInterval, Math.round(fuzzed)));
}

function stepDelay(steps: number[], step: number, rating: Rating) {
  const current = steps[Math.min(step, steps.length - 1)] ?? 1;
  if (rating === 1) return steps[0] ?? 1;
  if (rating === 2) {
    if (steps.length === 1) return current * 1.5;
    if (step === 0 && steps.length > 1) return (steps[0] + steps[1]) / 2;
    return current;
  }
  return steps[step + 1] ?? current;
}

function graduate(
  card: SchedulableCard,
  interval: number,
  config: SchedulerConfig,
  ctx: SchedulerContext,
  random: () => number,
) {
  card.state = "REVIEW";
  card.step = 0;
  card.interval = constrainInterval(interval, config, random);
  card.due = addDays(ctx.dayStart, card.interval);
}

function scheduleLearning(
  card: SchedulableCard,
  rating: Rating,
  config: SchedulerConfig,
  ctx: SchedulerContext,
  random: () => number,
) {
  const relearning = card.state === "RELEARNING";
  const steps = relearning ? config.relearningSteps : config.learningSteps;
  if (card.state === "NEW") {
    card.state = "LEARNING";
    card.step = 0;
    card.ease = config.startingEase;
  }
  if (steps.length === 0) {
    const interval = relearning ? Math.max(card.interval, config.minLapseInterval) : config.graduatingInterval;
    graduate(card, rating === 4 ? interval + (relearning ? 1 : config.easyInterval - config.graduatingInterval) : interval, config, ctx, random);
    return;
  }
  if (rating === 4) {
    const interval = relearning ? Math.max(card.interval + 1, config.minLapseInterval) : config.easyInterval;
    graduate(card, interval, config, ctx, random);
    return;
  }
  if (rating === 1) {
    card.step = 0;
    card.due = addMinutes(ctx.now, stepDelay(steps, 0, 1));
    return;
  }
  if (rating === 2) {
    card.due = addMinutes(ctx.now, stepDelay(steps, card.step, 2));
    return;
  }
  const nextStep = card.step + 1;
  if (nextStep >= steps.length) {
    const interval = relearning ? Math.max(card.interval, config.minLapseInterval) : config.graduatingInterval;
    graduate(card, interval, config, ctx, random);
    return;
  }
  card.step = nextStep;
  card.due = addMinutes(ctx.now, stepDelay(steps, card.step - 1, 3));
}

function scheduleReview(
  card: SchedulableCard,
  rating: Rating,
  config: SchedulerConfig,
  ctx: SchedulerContext,
  random: () => number,
): boolean {
  const elapsed = card.lastReview ? Math.max(0, daysBetween(card.lastReview, ctx.now)) : card.interval;
  const delay = Math.max(0, elapsed - card.interval);
  const easeFactor = card.ease / 1000;
  const modifier = config.intervalModifier;
  let leech = false;

  if (rating === 1) {
    card.lapses += 1;
    card.ease = Math.max(MIN_EASE, card.ease - 200);
    card.interval = Math.max(config.minLapseInterval, Math.round(card.interval * config.lapseMultiplier));
    card.interval = Math.min(card.interval, config.maxInterval);
    if (config.leechThreshold > 0 && card.lapses >= config.leechThreshold) {
      const halfway = Math.max(1, Math.floor(config.leechThreshold / 2));
      if ((card.lapses - config.leechThreshold) % halfway === 0) leech = true;
    }
    if (config.relearningSteps.length === 0) {
      card.state = "REVIEW";
      card.step = 0;
      card.due = addDays(ctx.dayStart, card.interval);
    } else {
      card.state = "RELEARNING";
      card.step = 0;
      card.due = addMinutes(ctx.now, config.relearningSteps[0]);
    }
    return leech;
  }

  let interval: number;
  if (rating === 2) {
    interval = Math.max(card.interval + 1, card.interval * config.hardMultiplier * modifier);
    card.ease = Math.max(MIN_EASE, card.ease - 150);
  } else if (rating === 3) {
    interval = Math.max(card.interval + 1, (card.interval + delay / 2) * easeFactor * modifier);
  } else {
    interval = Math.max(card.interval + 1, (card.interval + delay) * easeFactor * config.easyBonus * modifier);
    card.ease = card.ease + 150;
  }
  card.state = "REVIEW";
  card.step = 0;
  card.interval = constrainInterval(interval, config, random);
  card.due = addDays(ctx.dayStart, card.interval);
  return false;
}

export function scheduleSm2(
  input: SchedulableCard,
  rating: Rating,
  config: SchedulerConfig,
  ctx: SchedulerContext,
): ScheduleResult {
  const random = ctx.random ?? Math.random;
  const card = clone(input);
  let leech = false;
  if (card.state === "REVIEW") {
    leech = scheduleReview(card, rating, config, ctx, random);
  } else {
    scheduleLearning(card, rating, config, ctx, random);
  }
  card.reps += 1;
  card.lastReview = new Date(ctx.now);
  return { card, leech };
}
