import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/user";
import type { Locale } from "@/lib/i18n/config";
import { dayWindow, findNode, getDeckTree, subtreeIds, type DayWindow } from "@/lib/decks/queries";
import { fieldMap, renderCard } from "@/lib/anki/render";
import { dictionaries } from "@/lib/i18n/messages";
import type { NoteTypeField, NoteTypeTemplate } from "@/lib/anki/types";
import {
  formatDueDistance,
  formatInterval,
  preview,
  type Rating,
  type SchedulableCard,
  type SchedulerConfig,
} from "@/lib/scheduler";
import type { StudyCard, StudyState } from "./types";

export const LEARN_AHEAD_MINUTES = 20;
export const MEDIA_BASE = "/api/media/";

const cardInclude = {
  note: { include: { noteType: true } },
  deck: { include: { config: true } },
} as const;

type CardWithRelations = NonNullable<Awaited<ReturnType<typeof findCard>>>;

async function findCard(id: string, userId: string) {
  return prisma.card.findFirst({ where: { id, userId }, include: cardInclude });
}

export function toSchedulerConfig(config: CardWithRelations["deck"]["config"]): SchedulerConfig {
  return {
    algorithm: config.algorithm,
    learningSteps: config.learningSteps,
    relearningSteps: config.relearningSteps,
    graduatingInterval: config.graduatingInterval,
    easyInterval: config.easyInterval,
    startingEase: config.startingEase,
    easyBonus: config.easyBonus,
    hardMultiplier: config.hardMultiplier,
    intervalModifier: config.intervalModifier,
    lapseMultiplier: config.lapseMultiplier,
    minLapseInterval: config.minLapseInterval,
    maxInterval: config.maxInterval,
    leechThreshold: config.leechThreshold,
    desiredRetention: config.desiredRetention,
    fsrsWeights: config.fsrsWeights,
  };
}

export function toSchedulable(card: {
  state: SchedulableCard["state"];
  due: Date;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  step: number;
  stability: number | null;
  difficulty: number | null;
  lastReview: Date | null;
}): SchedulableCard {
  return {
    state: card.state,
    due: card.due,
    interval: card.interval,
    ease: card.ease,
    reps: card.reps,
    lapses: card.lapses,
    step: card.step,
    stability: card.stability,
    difficulty: card.difficulty,
    lastReview: card.lastReview,
  };
}

function intervalLabels(card: CardWithRelations, window: DayWindow, locale: Locale): Record<Rating, string> {
  const config = toSchedulerConfig(card.deck.config);
  const previews = preview(toSchedulable(card), config, { now: window.now, dayStart: window.start });
  const labels = {} as Record<Rating, string>;
  for (const rating of [1, 2, 3, 4] as Rating[]) {
    const next = previews[rating];
    labels[rating] = next.state === "REVIEW" ? formatInterval(next.interval, locale) : formatDueDistance(next.due, window.now, locale);
  }
  return labels;
}

export function buildStudyCard(card: CardWithRelations, deckFullName: string, window: DayWindow, locale: Locale): StudyCard {
  const noteType = card.note.noteType;
  const fields = noteType.fields as NoteTypeField[];
  const templates = noteType.templates as NoteTypeTemplate[];
  const template = noteType.kind === "CLOZE" ? (templates[0] ?? { name: "Cloze", qfmt: "", afmt: "" }) : (templates[card.ord] ?? templates[0] ?? { name: "", qfmt: "", afmt: "" });
  const rendered = renderCard({
    fields: fieldMap(
      fields.map((f) => f.name),
      card.note.fields,
    ),
    template,
    css: noteType.css,
    ord: card.ord,
    typeAnswerPlaceholder: dictionaries[locale].study.typeAnswer,
    kind: noteType.kind,
    tags: card.note.tags,
    deckName: deckFullName,
    noteTypeName: noteType.name,
    mediaBase: MEDIA_BASE,
  });
  return {
    id: card.id,
    noteId: card.noteId,
    ord: card.ord,
    state: card.state,
    question: rendered.question,
    answer: rendered.answer,
    css: rendered.css,
    audio: rendered.audio,
    intervals: intervalLabels(card, window, locale),
    flag: card.flag,
  };
}

function notBuried(now: Date) {
  return { OR: [{ buriedUntil: null }, { buriedUntil: { lt: now } }] };
}

async function pickNext(userId: string, deckIds: string[], window: DayWindow, counts: { fresh: number; review: number }, randomNew: boolean) {
  const base = { userId, deckId: { in: deckIds }, suspended: false, ...notBuried(window.now) };

  const learning = await prisma.card.findFirst({
    where: { ...base, state: { in: ["LEARNING", "RELEARNING"] }, due: { lte: window.now } },
    orderBy: { due: "asc" },
    include: cardInclude,
  });
  if (learning) return learning;

  const wantReview = counts.review > 0;
  const wantNew = counts.fresh > 0;
  const total = counts.review + counts.fresh;
  const preferNew = wantNew && (!wantReview || Math.random() < counts.fresh / total);

  const findReview = () =>
    prisma.card.findFirst({
      where: { ...base, state: "REVIEW", due: { lt: window.end } },
      orderBy: [{ due: "asc" }, { id: "asc" }],
      include: cardInclude,
    });
  const findNew = async () => {
    if (!randomNew) {
      return prisma.card.findFirst({
        where: { ...base, state: "NEW" },
        orderBy: [{ newPosition: "asc" }, { createdAt: "asc" }],
        include: cardInclude,
      });
    }
    const candidates = await prisma.card.findMany({
      where: { ...base, state: "NEW" },
      orderBy: [{ newPosition: "asc" }],
      take: 50,
      include: cardInclude,
    });
    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
  };

  if (preferNew) {
    const fresh = await findNew();
    if (fresh) return fresh;
    if (wantReview) return findReview();
    return null;
  }
  if (wantReview) {
    const review = await findReview();
    if (review) return review;
  }
  if (wantNew) return findNew();
  return null;
}

export async function getStudyState(user: CurrentUser, deckId: string, locale: Locale): Promise<StudyState | null> {
  const tree = await getDeckTree(user);
  const node = findNode(tree, deckId);
  if (!node) return null;
  const window = dayWindow(user);
  const deckIds = subtreeIds(node);
  const config = await prisma.deckConfig.findFirst({ where: { id: node.configId }, select: { newCardOrder: true } });

  const [next, lastLog] = await Promise.all([
    pickNext(user.id, deckIds, window, node.counts, config?.newCardOrder === "RANDOM"),
    prisma.reviewLog.findFirst({
      where: { userId: user.id, reviewedAt: { gte: new Date(window.now.getTime() - 6 * 3_600_000) } },
      orderBy: { reviewedAt: "desc" },
      select: { id: true },
    }),
  ]);

  let card = next;
  let learnAheadAt: string | null = null;
  if (!card) {
    const ahead = await prisma.card.findFirst({
      where: {
        userId: user.id,
        deckId: { in: deckIds },
        suspended: false,
        ...notBuried(window.now),
        state: { in: ["LEARNING", "RELEARNING"] },
        due: { lt: window.end },
      },
      orderBy: { due: "asc" },
      include: cardInclude,
    });
    if (ahead && ahead.due.getTime() - window.now.getTime() <= LEARN_AHEAD_MINUTES * 60_000) card = ahead;
    else if (ahead) learnAheadAt = ahead.due.toISOString();
  }

  return {
    deckId: node.id,
    deckName: node.fullName,
    counts: { fresh: node.counts.fresh, learning: node.counts.learning, review: node.counts.review },
    card: card ? buildStudyCard(card, node.fullName, window, locale) : null,
    canUndo: Boolean(lastLog),
    learnAheadAt,
  };
}

export { findCard };
export type { CardWithRelations };
