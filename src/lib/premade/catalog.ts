import { englishWordsDeck } from "./english-words";
import { falseFriendsDeck } from "./false-friends";
import { irregularVerbsDeck } from "./irregular-verbs";
import { phrasalVerbsDeck } from "./phrasal-verbs";
import type { PremadeDeck } from "./types";

export const PREMADE_DECKS: PremadeDeck[] = [englishWordsDeck, irregularVerbsDeck, falseFriendsDeck, phrasalVerbsDeck];

export function getPremadeDeck(slug: string) {
  return PREMADE_DECKS.find((deck) => deck.slug === slug) ?? null;
}
