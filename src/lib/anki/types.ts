export interface NoteTypeField {
  name: string;
}

export interface NoteTypeTemplate {
  name: string;
  qfmt: string;
  afmt: string;
}

export interface ParsedNoteType {
  ankiId: bigint;
  name: string;
  kind: "STANDARD" | "CLOZE";
  css: string;
  fields: NoteTypeField[];
  templates: NoteTypeTemplate[];
  sortFieldIdx: number;
  latexPre: string;
  latexPost: string;
}

export interface ParsedDeck {
  ankiId: bigint;
  name: string;
  description: string;
  configAnkiId: bigint | null;
}

export interface ParsedDeckConfig {
  ankiId: bigint;
  name: string;
  newPerDay: number;
  reviewsPerDay: number;
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
  leechAction: "SUSPEND" | "TAG";
  desiredRetention: number;
  fsrsWeights: number[];
  algorithm: "SM2" | "FSRS";
}

export interface ParsedNote {
  ankiId: bigint;
  guid: string;
  noteTypeAnkiId: bigint;
  fields: string[];
  tags: string[];
}

export interface ParsedCard {
  ankiId: bigint;
  noteAnkiId: bigint;
  deckAnkiId: bigint;
  ord: number;
  state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  due: Date;
  newPosition: number;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  step: number;
  stability: number | null;
  difficulty: number | null;
  suspended: boolean;
  buried: boolean;
  flag: number;
}

export interface ParsedMedia {
  name: string;
  data: Uint8Array;
}

export interface ParsedCollection {
  noteTypes: ParsedNoteType[];
  decks: ParsedDeck[];
  deckConfigs: ParsedDeckConfig[];
  notes: ParsedNote[];
  cards: ParsedCard[];
  media: ParsedMedia[];
}
