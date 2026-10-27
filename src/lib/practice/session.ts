import { itemCloze } from "./extract";
import type { Exercise, ExerciseKind, PracticeItem } from "./types";

export interface SessionOptions {
  kinds: ExerciseKind[];
  length: number;
  canSpeak: boolean;
}

type Random = () => number;

export function shuffle<T>(list: T[], random: Random = Math.random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function distinctBy(items: PracticeItem[], key: (item: PracticeItem) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item).toLowerCase();
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function options(item: PracticeItem, pool: PracticeItem[], reverse: boolean, random: Random) {
  const label = (entry: PracticeItem) => (reverse ? entry.term : entry.meaning);
  const others = distinctBy(
    pool.filter((entry) => entry.id !== item.id && label(entry).toLowerCase() !== label(item).toLowerCase()),
    label,
  );
  const sameLanguage = others.filter((entry) => entry.language === item.language);
  const picked = shuffle(sameLanguage.length >= 3 ? sameLanguage : others, random).slice(0, 3);
  if (picked.length < 3) return null;
  return shuffle([label(item), ...picked.map(label)], random);
}

export function applicableKinds(item: PracticeItem, pool: PracticeItem[], options: SessionOptions): ExerciseKind[] {
  const others = new Set(pool.filter((entry) => entry.id !== item.id).map((entry) => entry.meaning.toLowerCase())).size;
  return options.kinds.filter((kind) => {
    if (kind === "choice" || kind === "match") return others >= 3;
    if (kind === "cloze") return itemCloze(item) !== null;
    if (kind === "listen") return options.canSpeak && item.language !== null && item.term.length <= 60;
    if (kind === "forms") return Boolean(item.past && item.participle);
    return true;
  });
}

export function buildSession(pool: PracticeItem[], settings: SessionOptions, random: Random = Math.random, focus?: PracticeItem[]): Exercise[] {
  if (pool.length === 0 || settings.kinds.length === 0) return [];
  const order = shuffle(focus && focus.length > 0 ? focus : pool, random);
  const exercises: Exercise[] = [];
  const used = new Map<ExerciseKind, number>();
  let cursor = 0;
  let attempts = 0;
  while (exercises.length < settings.length && attempts < settings.length * 6) {
    attempts += 1;
    const item = order[cursor % order.length];
    cursor += 1;
    const kinds = applicableKinds(item, pool, settings);
    if (kinds.length === 0) continue;
    const last = exercises.at(-1)?.kind;
    const ranked = shuffle(kinds, random).sort((a, b) => (used.get(a) ?? 0) - (used.get(b) ?? 0) || Number(a === last) - Number(b === last));
    const kind = ranked[0];
    const id = `${exercises.length}-${item.id}-${kind}`;
    let exercise: Exercise | null = null;
    if (kind === "choice") {
      const reverse = random() < 0.5;
      const choices = options(item, pool, reverse, random);
      if (choices) exercise = { id, kind, item, reverse, options: choices };
    } else if (kind === "cloze") {
      const cloze = itemCloze(item);
      if (cloze) exercise = { id, kind, item, cloze };
    } else if (kind === "listen") {
      const sentence = Boolean(item.example) && item.example.length <= 90 && random() < 0.4;
      exercise = { id, kind, item, sentence };
    } else if (kind === "match") {
      const partners = shuffle(
        distinctBy(
          pool.filter((entry) => entry.id !== item.id),
          (entry) => entry.meaning,
        ).filter((entry) => entry.term.toLowerCase() !== item.term.toLowerCase()),
        random,
      ).slice(0, 3);
      if (partners.length === 3) exercise = { id, kind, item, items: shuffle([item, ...partners], random) };
    } else {
      exercise = { id, kind, item } as Exercise;
    }
    if (!exercise) continue;
    used.set(kind, (used.get(kind) ?? 0) + 1);
    exercises.push(exercise);
  }
  return exercises;
}
