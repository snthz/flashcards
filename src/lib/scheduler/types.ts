export type CardState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";

export type Rating = 1 | 2 | 3 | 4;

export type Algorithm = "SM2" | "FSRS";

export interface SchedulableCard {
  state: CardState;
  due: Date;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  step: number;
  stability: number | null;
  difficulty: number | null;
  lastReview: Date | null;
}

export interface SchedulerConfig {
  algorithm: Algorithm;
  learningSteps: number[];
  relearningSteps: number[];
  graduatingInterval: number;
  easyInterval: number;
  startingEase: number;
  easyBonus: number;
  hardMultiplier: number;
  intervalModifier: number;
  lapseMultiplier: number;
  minLapseInterval: number;
  maxInterval: number;
  leechThreshold: number;
  desiredRetention: number;
  fsrsWeights: number[];
}

export interface SchedulerContext {
  now: Date;
  dayStart: Date;
  random?: () => number;
}

export interface ScheduleResult {
  card: SchedulableCard;
  leech: boolean;
}

export type SchedulePreview = Record<Rating, SchedulableCard>;
