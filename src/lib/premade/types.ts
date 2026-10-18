import type { ParsedCollection } from "@/lib/anki/types";

export interface PremadeSample {
  front: string;
  back: string;
}

export interface PremadeDeck {
  slug: string;
  title: string;
  summary: string;
  description: string;
  languages: string;
  level: string;
  tags: string[];
  cardCount: number;
  subdecks: Array<{ name: string; count: number }>;
  samples: PremadeSample[];
  // Anki id of the top deck, used to tell whether a user already added it.
  rootAnkiId: bigint;
  build: () => ParsedCollection;
}
