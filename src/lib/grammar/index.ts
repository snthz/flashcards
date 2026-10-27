import { A1 } from "./content/a1";
import { A2 } from "./content/a2";
import { B1 } from "./content/b1";
import { B2 } from "./content/b2";
import { C1 } from "./content/c1";
import { GRAMMAR_LEVELS, type GrammarLevel, type GrammarTopic } from "./types";

export const GRAMMAR_TOPICS: GrammarTopic[] = [...A1, ...A2, ...B1, ...B2, ...C1];

export function isGrammarLevel(value: unknown): value is GrammarLevel {
  return GRAMMAR_LEVELS.includes(value as GrammarLevel);
}

export function topicsByLevel(level: GrammarLevel) {
  return GRAMMAR_TOPICS.filter((topic) => topic.level === level);
}

export function findTopic(slug: string) {
  return GRAMMAR_TOPICS.find((topic) => topic.slug === slug) ?? null;
}

export function neighbors(slug: string) {
  const index = GRAMMAR_TOPICS.findIndex((topic) => topic.slug === slug);
  return { previous: index > 0 ? GRAMMAR_TOPICS[index - 1] : null, next: index >= 0 && index < GRAMMAR_TOPICS.length - 1 ? GRAMMAR_TOPICS[index + 1] : null };
}
