import { scheduleFsrs } from "./fsrs";
import { scheduleSm2 } from "./sm2";
import type { Rating, SchedulableCard, SchedulerConfig, SchedulerContext, SchedulePreview, ScheduleResult } from "./types";

export const RATINGS: Rating[] = [1, 2, 3, 4];

export function schedule(
  card: SchedulableCard,
  rating: Rating,
  config: SchedulerConfig,
  ctx: SchedulerContext,
): ScheduleResult {
  if (config.algorithm === "FSRS") return scheduleFsrs(card, rating, config, ctx);
  return scheduleSm2(card, rating, config, ctx);
}

export function preview(card: SchedulableCard, config: SchedulerConfig, ctx: SchedulerContext): SchedulePreview {
  const deterministic: SchedulerContext = { ...ctx, random: () => 0.5 };
  const result = {} as SchedulePreview;
  for (const rating of RATINGS) {
    result[rating] = schedule(card, rating, config, deterministic).card;
  }
  return result;
}

export * from "./types";
export * from "./day";
export * from "./format";
