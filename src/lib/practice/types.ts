import type { LanguageCode } from "@/lib/translate/types";

export interface PracticeItem {
  id: string;
  term: string;
  meaning: string;
  language: LanguageCode | null;
  example: string;
  exampleTranslation: string;
  answer: string;
  past: string;
  participle: string;
  deckName: string;
  distractors: Distractors | null;
}

export interface Distractors {
  meanings: string[];
  terms: string[];
}

export interface Enrichment {
  language: string;
  example: string;
  exampleTranslation: string;
  answer: string;
  past: string;
  participle: string;
  wrongMeanings: string[];
  wrongTerms: string[];
}

export interface PracticeData {
  items: PracticeItem[];
  hasKey: boolean;
  pending: number;
}

export interface SentenceAttempt {
  id: string;
  term: string;
  meaning: string;
  language: string | null;
  sentence: string;
}

export const EXERCISE_KINDS = ["choice", "type", "cloze", "listen", "sentence", "forms", "match"] as const;
export type ExerciseKind = (typeof EXERCISE_KINDS)[number];

export const PRACTICE_PERIODS = ["week", "month", "all"] as const;
export type PracticePeriod = (typeof PRACTICE_PERIODS)[number];

export interface Cloze {
  before: string;
  answer: string;
  after: string;
}

export type Exercise =
  | { id: string; kind: "choice"; item: PracticeItem; reverse: boolean; options: string[] }
  | { id: string; kind: "type"; item: PracticeItem }
  | { id: string; kind: "cloze"; item: PracticeItem; cloze: Cloze }
  | { id: string; kind: "listen"; item: PracticeItem; sentence: boolean }
  | { id: string; kind: "sentence"; item: PracticeItem }
  | { id: string; kind: "forms"; item: PracticeItem }
  | { id: string; kind: "match"; item: PracticeItem; items: PracticeItem[] };

export type Grade = "correct" | "almost" | "wrong";

export type PendingGrade = Grade | "pending";

export interface SentenceReview {
  verdict: Grade;
  corrected: string;
  feedback: string;
}
