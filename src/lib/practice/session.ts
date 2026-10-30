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

function generated(item: PracticeItem, reverse: boolean) {
  return (reverse ? item.distractors?.terms : item.distractors?.meanings) ?? [];
}

function options(item: PracticeItem, pool: PracticeItem[], reverse: boolean, random: Random) {
  const label = (entry: PracticeItem) => (reverse ? entry.term : entry.meaning);
  const right = label(item).toLowerCase();
  const own = generated(item, reverse).filter((value) => value.toLowerCase() !== right);
  const others = distinctBy(
    pool.filter((entry) => entry.id !== item.id && label(entry).toLowerCase() !== right),
    label,
  );
  const sameLanguage = others.filter((entry) => entry.language === item.language);
  const fromPool = shuffle(sameLanguage.length >= 3 ? sameLanguage : others, random).map(label);
  const useOwn = own.length >= 3 && (fromPool.length < 3 || random() < 0.5);
  const picked = (useOwn ? own : fromPool).slice(0, 3);
  if (picked.length < 3) return null;
  return shuffle([label(item), ...picked], random);
}

function distinctMeanings(item: PracticeItem, pool: PracticeItem[]) {
  return new Set(pool.filter((entry) => entry.id !== item.id).map((entry) => entry.meaning.toLowerCase())).size;
}

export function applicableKinds(item: PracticeItem, pool: PracticeItem[], options: SessionOptions): ExerciseKind[] {
  const others = distinctMeanings(item, pool);
  const ownChoices = generated(item, false).length >= 3 || generated(item, true).length >= 3;
  return options.kinds.filter((kind) => {
    if (kind === "choice") return others >= 3 || ownChoices;
    if (kind === "match") return others >= 3;
    if (kind === "cloze") return itemCloze(item) !== null;
    if (kind === "listen") return options.canSpeak && item.language !== null && item.term.length <= 60;
    if (kind === "forms") return Boolean(item.past && item.participle);
    return true;
  });
}

export function buildSession(pool: PracticeItem[], settings: SessionOptions, random: Random = Math.random, order: PracticeItem[] = shuffle(pool, random)): Exercise[] {
  if (pool.length === 0 || order.length === 0 || settings.kinds.length === 0) return [];
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
      const first = random() < 0.5;
      const reverse = options(item, pool, first, random) ? first : !first;
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

export type Unavailable = "few-words" | "no-examples" | "no-language" | "no-speech" | "no-verbs";

export function kindAvailability(pool: PracticeItem[], canSpeak: boolean, enrichable = false): Record<ExerciseKind, Unavailable | null> {
  const settings = (kind: ExerciseKind): SessionOptions => ({ kinds: [kind], length: 1, canSpeak });
  const fits = (kind: ExerciseKind) => pool.some((item) => applicableKinds(item, pool, settings(kind)).length > 0);
  const preparable = (kind: ExerciseKind) => (enrichable && pool.length > 0) || fits(kind);
  return {
    choice: preparable("choice") ? null : "few-words",
    type: pool.length > 0 ? null : "few-words",
    cloze: preparable("cloze") ? null : "no-examples",
    listen: !canSpeak ? "no-speech" : preparable("listen") ? null : "no-language",
    sentence: pool.length > 0 ? null : "few-words",
    forms: fits("forms") ? null : "no-verbs",
    match: fits("match") ? null : "few-words",
  };
}
