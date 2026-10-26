import { irregularVerbsDeck } from "./irregular-verbs";
import { phrasalVerbsDeck } from "./phrasal-verbs";
import type { PremadeDeck } from "./types";

export const PREMADE_DECKS: PremadeDeck[] = [phrasalVerbsDeck, irregularVerbsDeck];

export function getPremadeDeck(slug: string) {
  return PREMADE_DECKS.find((deck) => deck.slug === slug) ?? null;
}
