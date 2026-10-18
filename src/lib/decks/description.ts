import { htmlToText } from "@/lib/anki/render";
import { DECK_DESCRIPTION_MAX } from "@/lib/validation/deck";

const HTML_TAG_RE = /<\/?[a-z][a-z0-9-]*\b[^>]*>/i;

// Anki stores deck descriptions as HTML; decks keep them as plain text that fits the edit form.
export function toDeckDescription(value: string) {
  const text = HTML_TAG_RE.test(value) ? htmlToText(value) : value.trim();
  return text.length > DECK_DESCRIPTION_MAX ? `${text.slice(0, DECK_DESCRIPTION_MAX - 1).trimEnd()}…` : text;
}
