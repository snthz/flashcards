import type { ParsedCollection } from "@/lib/anki/types";
import type { Locale } from "@/lib/i18n/config";

export interface PremadeSample {
  front: string;
  back: string;
}

export interface PremadeDeckText {
  summary: string;
  description: string;
  languages: string;
  level: string;
  tags: string[];
}

export interface PremadeDeck {
  slug: string;
  title: string;
  text: Record<Locale, PremadeDeckText>;
  cardCount: number;
  subdecks: Array<{ name: string; count: number }>;
  samples: PremadeSample[];
  // Anki id of the top deck, used to tell whether a user already added it.
  rootAnkiId: bigint;
  build: (locale: Locale) => ParsedCollection;
}
