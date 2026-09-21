import type { CardState, Rating } from "@/lib/scheduler";

export interface StudyCard {
  id: string;
  noteId: string;
  ord: number;
  state: CardState;
  question: string;
  answer: string;
  css: string;
  audio: { question: string[]; answer: string[] };
  intervals: Record<Rating, string>;
  flag: number;
}

export interface StudyCounts {
  fresh: number;
  learning: number;
  review: number;
}

export interface StudyState {
  deckId: string;
  deckName: string;
  counts: StudyCounts;
  card: StudyCard | null;
  canUndo: boolean;
  learnAheadAt: string | null;
}
