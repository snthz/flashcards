import { commonMistakesDeck } from "./common-mistakes";
import { englishWordsDeck } from "./english-words";
import { falseFriendsDeck } from "./false-friends";
import { getDeck } from "./get";
import { idiomsDeck } from "./idioms";
import { irregularVerbsDeck } from "./irregular-verbs";
import { makeDoDeck } from "./make-do";
import { phrasalVerbsDeck } from "./phrasal-verbs";
import { prepositionsDeck } from "./prepositions";
import { remoteWorkDeck } from "./remote-work";
import type { PremadeDeck } from "./types";

export const PREMADE_DECKS: PremadeDeck[] = [
  englishWordsDeck,
  irregularVerbsDeck,
  commonMistakesDeck,
  makeDoDeck,
  prepositionsDeck,
  falseFriendsDeck,
  getDeck,
  phrasalVerbsDeck,
  idiomsDeck,
  remoteWorkDeck,
];

export function getPremadeDeck(slug: string) {
  return PREMADE_DECKS.find((deck) => deck.slug === slug) ?? null;
}
