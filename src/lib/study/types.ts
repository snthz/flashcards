import type { CardState, Rating, SchedulerConfig } from "@/lib/scheduler";
import type { CustomStudy } from "./custom";

export interface StudyCounts {
  fresh: number;
  learning: number;
  review: number;
}

export interface PackCard {
  id: string;
  noteId: string;
  configId: string;
  ord: number;
  state: CardState;
  due: string;
  newPosition: number;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  step: number;
  stability: number | null;
  difficulty: number | null;
  lastReview: string | null;
  suspended: boolean;
  buriedUntil: string | null;
  flag: number;
  question: string;
  answer: string;
  styleId: string;
  audio: { question: string[]; answer: string[] };
}

export type PackConfig = SchedulerConfig & { leechAction: "SUSPEND" | "TAG" };

export interface StudyPack {
  version: 1;
  userId: string;
  deckId: string;
  deckName: string;
  fetchedAt: string;
  timezone: string;
  dayStartHour: number;
  dayStart: string;
  dayEnd: string;
  newLimit: number;
  reviewLimit: number;
  truncated: boolean;
  newCardOrder: "SEQUENTIAL" | "RANDOM";
  serverUndo: boolean;
  configs: Record<string, PackConfig>;
  styles: Record<string, string>;
  cards: PackCard[];
  custom?: CustomStudy | null;
}

interface OpBase {
  id: string;
  userId: string;
  cardId: string;
  at: string;
  syncedAt?: string;
}

export type StudyOp =
  | (OpBase & { kind: "review"; rating: Rating; durationMs: number })
  | (OpBase & { kind: "bury" })
  | (OpBase & { kind: "suspend" })
  | (OpBase & { kind: "flag"; flag: number });

export type OpResult = "applied" | "duplicate" | "stale" | "missing" | "invalid" | "error";

export interface SyncResponse {
  serverTime: string;
  results: Array<{ id: string; status: OpResult }>;
}
