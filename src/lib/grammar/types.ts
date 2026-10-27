export const GRAMMAR_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
export type GrammarLevel = (typeof GRAMMAR_LEVELS)[number];

export interface GrammarSection {
  heading: string;
  body: string;
}

export interface GrammarTable {
  caption?: string;
  columns: string[];
  rows: string[][];
}

export interface GrammarQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface GrammarTopic {
  slug: string;
  level: GrammarLevel;
  title: string;
  english: string;
  summary: string;
  sections: GrammarSection[];
  tables: GrammarTable[];
  examples: Array<[english: string, spanish: string]>;
  mistakes: Array<[wrong: string, right: string, why: string]>;
  quiz: GrammarQuestion[];
}
