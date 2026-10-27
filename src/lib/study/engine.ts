import {
  dayStart,
  formatDueDistance,
  formatInterval,
  nextDayStart,
  preview,
  schedule,
  type CardState,
  type Rating,
  type SchedulableCard,
} from "@/lib/scheduler";
import type { Locale } from "@/lib/i18n/config";
import { seededRandom } from "./random";
import type { PackCard, PackConfig, StudyCounts, StudyOp, StudyPack } from "./types";

export const LEARN_AHEAD_MS = 20 * 60_000;

export interface EngineCard {
  id: string;
  noteId: string;
  configId: string;
  order: number;
  newPosition: number;
  state: CardState;
  due: number;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  step: number;
  stability: number | null;
  difficulty: number | null;
  lastReview: number | null;
  suspended: boolean;
  buriedUntil: number | null;
  flag: number;
}

export interface Engine {
  pack: StudyPack;
  cards: Map<string, EngineCard>;
  newLeft: number;
  reviewLeft: number;
}

export interface CardChoice {
  cardId: string | null;
  learnAheadAt: Date | null;
}

export function windowAt(pack: Pick<StudyPack, "timezone" | "dayStartHour">, date: Date) {
  return { now: date, start: dayStart(date, pack.timezone, pack.dayStartHour), end: nextDayStart(date, pack.timezone, pack.dayStartHour) };
}

function toEngineCard(card: PackCard, order: number): EngineCard {
  return {
    id: card.id,
    noteId: card.noteId,
    configId: card.configId,
    order,
    newPosition: card.newPosition,
    state: card.state,
    due: Date.parse(card.due),
    interval: card.interval,
    ease: card.ease,
    reps: card.reps,
    lapses: card.lapses,
    step: card.step,
    stability: card.stability,
    difficulty: card.difficulty,
    lastReview: card.lastReview ? Date.parse(card.lastReview) : null,
    suspended: card.suspended,
    buriedUntil: card.buriedUntil ? Date.parse(card.buriedUntil) : null,
    flag: card.flag,
  };
}

export function toSchedulableCard(card: EngineCard): SchedulableCard {
  return {
    state: card.state,
    due: new Date(card.due),
    interval: card.interval,
    ease: card.ease,
    reps: card.reps,
    lapses: card.lapses,
    step: card.step,
    stability: card.stability,
    difficulty: card.difficulty,
    lastReview: card.lastReview != null ? new Date(card.lastReview) : null,
  };
}

export function reviewOutcome(card: SchedulableCard, rating: Rating, config: PackConfig, at: Date, start: Date, opId: string) {
  return schedule(card, rating, config, { now: at, dayStart: start, random: seededRandom(opId) });
}

export function shouldReplay(op: StudyOp, pack: StudyPack) {
  return !(op.syncedAt && Date.parse(op.syncedAt) <= Date.parse(pack.fetchedAt));
}

export function createEngine(pack: StudyPack, ops: StudyOp[]): Engine {
  const engine: Engine = {
    pack,
    cards: new Map(pack.cards.map((card, index) => [card.id, toEngineCard(card, index)])),
    newLeft: pack.newLimit,
    reviewLeft: pack.reviewLimit,
  };
  const replay = ops.filter((op) => op.userId === pack.userId && shouldReplay(op, pack)).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  for (const op of replay) applyOp(engine, op);
  return engine;
}

function isBuried(card: EngineCard, now: number) {
  return card.buriedUntil != null && card.buriedUntil > now;
}

export function applyOp(engine: Engine, op: StudyOp) {
  const card = engine.cards.get(op.cardId);
  if (!card) return;
  const at = new Date(op.at);
  const window = windowAt(engine.pack, at);
  if (op.kind === "bury") {
    card.buriedUntil = window.end.getTime();
    return;
  }
  if (op.kind === "suspend") {
    card.suspended = true;
    return;
  }
  if (op.kind === "flag") {
    card.flag = Math.max(0, Math.min(7, Math.round(op.flag)));
    return;
  }
  const config = engine.pack.configs[card.configId];
  if (!config || card.suspended) return;
  const before = card.state;
  const { card: after, leech } = reviewOutcome(toSchedulableCard(card), op.rating, config, at, window.start, op.id);
  card.state = after.state;
  card.due = after.due.getTime();
  card.interval = after.interval;
  card.ease = after.ease;
  card.reps = after.reps;
  card.lapses = after.lapses;
  card.step = after.step;
  card.stability = after.stability;
  card.difficulty = after.difficulty;
  card.lastReview = after.lastReview ? after.lastReview.getTime() : null;
  if (leech && config.leechAction === "SUSPEND") card.suspended = true;
  const today = at.getTime() >= Date.parse(engine.pack.dayStart);
  if (today && before === "NEW") engine.newLeft = Math.max(0, engine.newLeft - 1);
  if (today && before === "REVIEW") engine.reviewLeft = Math.max(0, engine.reviewLeft - 1);
  if (before === "NEW" || before === "REVIEW") {
    for (const sibling of engine.cards.values()) {
      if (sibling.noteId !== card.noteId || sibling.id === card.id) continue;
      if ((sibling.state === "NEW" || sibling.state === "REVIEW") && !sibling.suspended && !isBuried(sibling, at.getTime())) {
        sibling.buriedUntil = window.end.getTime();
      }
    }
  }
}

function activeCards(engine: Engine, now: number) {
  return [...engine.cards.values()].filter((card) => !card.suspended && !isBuried(card, now));
}

function isLearning(card: EngineCard) {
  return card.state === "LEARNING" || card.state === "RELEARNING";
}

function answeredInSession(card: EngineCard, engine: Engine) {
  return card.lastReview != null && card.lastReview >= Date.parse(engine.pack.fetchedAt);
}

function customCounts(engine: Engine, now: Date): StudyCounts {
  const end = windowAt(engine.pack, now).end.getTime();
  let fresh = 0;
  let learning = 0;
  let review = 0;
  for (const card of activeCards(engine, now.getTime())) {
    if (answeredInSession(card, engine)) {
      if (isLearning(card) && card.due < end) learning += 1;
    } else if (card.state === "NEW") fresh += 1;
    else if (isLearning(card)) learning += 1;
    else review += 1;
  }
  return { fresh, learning, review };
}

function pickCustom(engine: Engine, now: Date, preferId: string | null | undefined): CardChoice {
  const nowMs = now.getTime();
  const end = windowAt(engine.pack, now).end.getTime();
  const cards = activeCards(engine, nowMs);
  const pending = (card: EngineCard) => !answeredInSession(card, engine);
  if (preferId) {
    const preferred = cards.find((card) => card.id === preferId);
    if (preferred && (pending(preferred) || (isLearning(preferred) && preferred.due < end))) return { cardId: preferred.id, learnAheadAt: null };
  }
  const relearn = cards.filter((card) => !pending(card) && isLearning(card));
  const due = relearn.filter((card) => card.due <= nowMs).sort(byDue)[0];
  if (due) return { cardId: due.id, learnAheadAt: null };
  const next = cards.filter(pending).sort((a, b) => a.order - b.order)[0];
  if (next) return { cardId: next.id, learnAheadAt: null };
  const ahead = relearn.filter((card) => card.due < end).sort(byDue)[0];
  if (ahead && ahead.due - nowMs <= LEARN_AHEAD_MS) return { cardId: ahead.id, learnAheadAt: null };
  return { cardId: null, learnAheadAt: ahead ? new Date(ahead.due) : null };
}

export function engineCounts(engine: Engine, now: Date): StudyCounts {
  if (engine.pack.custom) return customCounts(engine, now);
  const end = windowAt(engine.pack, now).end.getTime();
  let fresh = 0;
  let learning = 0;
  let review = 0;
  for (const card of activeCards(engine, now.getTime())) {
    if (card.state === "NEW") fresh += 1;
    else if (isLearning(card) && card.due < end) learning += 1;
    else if (card.state === "REVIEW" && card.due < end) review += 1;
  }
  return { fresh: Math.min(fresh, engine.newLeft), learning, review: Math.min(review, engine.reviewLeft) };
}

function byDue(a: EngineCard, b: EngineCard) {
  return a.due - b.due || a.order - b.order;
}

function byPosition(a: EngineCard, b: EngineCard) {
  return a.newPosition - b.newPosition || a.order - b.order;
}

function studyable(card: EngineCard, engine: Engine, now: number, end: number) {
  if (card.suspended || isBuried(card, now)) return false;
  if (isLearning(card)) return card.due < end;
  if (card.state === "REVIEW") return card.due < end && engine.reviewLeft > 0;
  return engine.newLeft > 0;
}

export function pickCard(engine: Engine, now: Date, options: { random?: () => number; preferId?: string | null } = {}): CardChoice {
  if (engine.pack.custom) return pickCustom(engine, now, options.preferId);
  const random = options.random ?? Math.random;
  const nowMs = now.getTime();
  const end = windowAt(engine.pack, now).end.getTime();
  if (options.preferId) {
    const preferred = engine.cards.get(options.preferId);
    if (preferred && studyable(preferred, engine, nowMs, end)) return { cardId: preferred.id, learnAheadAt: null };
  }
  const cards = activeCards(engine, nowMs);
  const dueLearning = cards.filter((card) => isLearning(card) && card.due <= nowMs).sort(byDue);
  if (dueLearning[0]) return { cardId: dueLearning[0].id, learnAheadAt: null };

  const counts = engineCounts(engine, now);
  const reviews = counts.review > 0 ? cards.filter((card) => card.state === "REVIEW" && card.due < end).sort(byDue) : [];
  const fresh = counts.fresh > 0 ? cards.filter((card) => card.state === "NEW").sort(byPosition) : [];
  const nextNew = () => (engine.pack.newCardOrder === "RANDOM" ? fresh[Math.floor(random() * fresh.length)] : fresh[0]);
  const total = counts.review + counts.fresh;
  const preferNew = fresh.length > 0 && (reviews.length === 0 || random() < counts.fresh / total);
  const chosen = preferNew ? nextNew() : (reviews[0] ?? (fresh.length > 0 ? nextNew() : undefined));
  if (chosen) return { cardId: chosen.id, learnAheadAt: null };

  const ahead = cards.filter((card) => isLearning(card) && card.due < end).sort(byDue)[0];
  if (ahead && ahead.due - nowMs <= LEARN_AHEAD_MS) return { cardId: ahead.id, learnAheadAt: null };
  return { cardId: null, learnAheadAt: ahead ? new Date(ahead.due) : null };
}

export function intervalLabels(engine: Engine, cardId: string, now: Date, locale: Locale): Record<Rating, string> {
  const card = engine.cards.get(cardId);
  const config = card ? engine.pack.configs[card.configId] : undefined;
  const labels = { 1: "", 2: "", 3: "", 4: "" } as Record<Rating, string>;
  if (!card || !config) return labels;
  const previews = preview(toSchedulableCard(card), config, { now, dayStart: windowAt(engine.pack, now).start });
  for (const rating of [1, 2, 3, 4] as Rating[]) {
    const next = previews[rating];
    labels[rating] = next.state === "REVIEW" ? formatInterval(next.interval, locale) : formatDueDistance(next.due, now, locale);
  }
  return labels;
}

export function exhausted(engine: Engine, now: Date) {
  const counts = engineCounts(engine, now);
  return engine.pack.truncated && counts.fresh + counts.review < 5;
}
