import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/user";
import type { Locale } from "@/lib/i18n/config";
import { dayWindow, findNode, getDeckTree, subtreeIds } from "@/lib/decks/queries";
import { fieldMap, renderCard } from "@/lib/anki/render";
import { dictionaries } from "@/lib/i18n/messages";
import type { NoteTypeField, NoteTypeTemplate } from "@/lib/anki/types";
import type { SchedulableCard, SchedulerConfig } from "@/lib/scheduler";
import type { PackCard, PackConfig, StudyPack } from "./types";
import type { CustomStudy } from "./custom";

export const MEDIA_BASE = "/api/media/";
export const PACK_CARD_LIMIT = 400;
const UNDO_WINDOW_MS = 6 * 3_600_000;
const CUSTOM_CARD_LIMIT = 200;
const DAY_MS = 86_400_000;

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

function toPackCard(card: CardWithRelations, deckFullName: string, locale: Locale): PackCard {
  const noteType = card.note.noteType;
  const fields = noteType.fields as NoteTypeField[];
  const templates = noteType.templates as NoteTypeTemplate[];
  const template =
    noteType.kind === "CLOZE"
      ? (templates[0] ?? { name: "Cloze", qfmt: "", afmt: "" })
      : (templates[card.ord] ?? templates[0] ?? { name: "", qfmt: "", afmt: "" });
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
    configId: card.deck.configId,
    ord: card.ord,
    state: card.state,
    due: card.due.toISOString(),
    newPosition: card.newPosition,
    interval: card.interval,
    ease: card.ease,
    reps: card.reps,
    lapses: card.lapses,
    step: card.step,
    stability: card.stability,
    difficulty: card.difficulty,
    lastReview: card.lastReview?.toISOString() ?? null,
    suspended: card.suspended,
    buriedUntil: card.buriedUntil?.toISOString() ?? null,
    flag: card.flag,
    question: rendered.question,
    answer: rendered.answer,
    styleId: noteType.id,
    audio: rendered.audio,
  };
}

type CardBase = {
  userId: string;
  deckId: { in: string[] };
  suspended: false;
  OR: Array<{ buriedUntil: null } | { buriedUntil: { lt: Date } }>;
};

async function customCards(user: CurrentUser, custom: CustomStudy, base: CardBase, windowEnd: Date, now: Date) {
  const take = CUSTOM_CARD_LIMIT;
  if (custom.mode === "forgotten") {
    const logs = await prisma.reviewLog.findMany({
      where: { userId: user.id, rating: 1, reviewedAt: { gte: new Date(now.getTime() - (custom.days ?? 1) * DAY_MS) }, card: base },
      orderBy: { reviewedAt: "desc" },
      select: { cardId: true },
      take: take * 5,
    });
    const ids = [...new Set(logs.map((log) => log.cardId))].slice(0, take);
    const cards = await prisma.card.findMany({ where: { ...base, id: { in: ids } }, include: cardInclude });
    const order = new Map(ids.map((id, index) => [id, index]));
    return cards.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }
  if (custom.mode === "ahead") {
    return prisma.card.findMany({
      where: { ...base, state: "REVIEW", due: { gte: windowEnd, lt: new Date(windowEnd.getTime() + (custom.days ?? 1) * DAY_MS) } },
      orderBy: [{ due: "asc" }, { id: "asc" }],
      take,
      include: cardInclude,
    });
  }
  if (custom.mode === "new") {
    return prisma.card.findMany({
      where: { ...base, state: "NEW" },
      orderBy: [{ newPosition: "asc" }, { createdAt: "asc" }],
      take: Math.min(take, custom.count ?? 10),
      include: cardInclude,
    });
  }
  const filter = custom.mode === "tag" ? { note: { tags: { has: custom.tag ?? "" } } } : { flag: custom.flag ?? 1 };
  return prisma.card.findMany({
    where: { ...base, ...filter },
    orderBy: [{ due: "asc" }, { id: "asc" }],
    take,
    include: cardInclude,
  });
}

export async function buildStudyPack(user: CurrentUser, deckId: string, locale: Locale, custom: CustomStudy | null = null): Promise<StudyPack | null> {
  const fetchedAt = new Date();
  const tree = await getDeckTree(user);
  const node = findNode(tree, deckId);
  if (!node) return null;
  const window = dayWindow(user, fetchedAt);
  const deckIds = subtreeIds(node);
  const base: CardBase = {
    userId: user.id,
    deckId: { in: deckIds },
    suspended: false,
    OR: [{ buriedUntil: null }, { buriedUntil: { lt: window.now } }],
  };
  const reviewTake = custom ? 0 : Math.min(node.counts.review, PACK_CARD_LIMIT);
  const freshTake = custom ? 0 : Math.min(node.counts.fresh, Math.max(0, PACK_CARD_LIMIT - reviewTake));

  const [config, learning, reviews, fresh, lastLog] = await Promise.all([
    prisma.deckConfig.findFirst({ where: { id: node.configId }, select: { newCardOrder: true } }),
    custom
      ? customCards(user, custom, base, window.end, fetchedAt)
      : prisma.card.findMany({
          where: { ...base, state: { in: ["LEARNING", "RELEARNING"] }, due: { lt: window.end } },
          orderBy: [{ due: "asc" }, { id: "asc" }],
          include: cardInclude,
        }),
    reviewTake > 0
      ? prisma.card.findMany({
          where: { ...base, state: "REVIEW", due: { lt: window.end } },
          orderBy: [{ due: "asc" }, { id: "asc" }],
          take: reviewTake,
          include: cardInclude,
        })
      : Promise.resolve([]),
    freshTake > 0
      ? prisma.card.findMany({
          where: { ...base, state: "NEW" },
          orderBy: [{ newPosition: "asc" }, { createdAt: "asc" }],
          take: freshTake,
          include: cardInclude,
        })
      : Promise.resolve([]),
    prisma.reviewLog.findFirst({
      where: { userId: user.id, reviewedAt: { gte: new Date(window.now.getTime() - UNDO_WINDOW_MS) } },
      orderBy: { reviewedAt: "desc" },
      select: { snapshot: true },
    }),
  ]);

  const cards = [...learning, ...reviews, ...fresh];
  const configs: Record<string, PackConfig> = {};
  const styles: Record<string, string> = {};
  for (const card of cards) {
    configs[card.deck.configId] ??= { ...toSchedulerConfig(card.deck.config), leechAction: card.deck.config.leechAction };
    styles[card.note.noteTypeId] ??= card.note.noteType.css;
  }

  return {
    version: 1,
    userId: user.id,
    deckId: node.id,
    deckName: node.fullName,
    fetchedAt: fetchedAt.toISOString(),
    timezone: user.timezone,
    dayStartHour: user.dayStartHour,
    dayStart: window.start.toISOString(),
    dayEnd: window.end.toISOString(),
    newLimit: custom ? cards.filter((card) => card.state === "NEW").length : fresh.length,
    reviewLimit: custom ? cards.filter((card) => card.state === "REVIEW").length : reviews.length,
    truncated: reviewTake < node.counts.review || freshTake < node.counts.fresh,
    newCardOrder: config?.newCardOrder ?? "SEQUENTIAL",
    serverUndo: Boolean((lastLog?.snapshot as { state?: string } | null)?.state),
    configs,
    styles,
    cards: cards.map((card) => toPackCard(card, node.fullName, locale)),
    custom,
  };
}

export { findCard };
export type { CardWithRelations };
