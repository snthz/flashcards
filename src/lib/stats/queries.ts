import { Prisma } from "@/generated/prisma/client";
import { dbSchema, prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/user";
import { dayWindow, getDeckSubtreeIds } from "@/lib/decks/queries";
import { DAY_MS, dayKey } from "@/lib/scheduler";

export type StatsPeriod = "month" | "quarter" | "year" | "all";

export interface DailyReviews {
  day: string;
  fresh: number;
  learning: number;
  review: number;
  total: number;
  durationMs: number;
}

export interface StatsData {
  period: StatsPeriod;
  today: { reviews: number; durationMs: number };
  retention: number | null;
  streak: number;
  totals: { cards: number; notes: number; due: number; dueTomorrow: number };
  reviewsByDay: DailyReviews[];
  heatmap: Array<{ day: string; count: number }>;
  forecast: Array<{ day: string; count: number }>;
  cardStates: { fresh: number; learning: number; young: number; mature: number; suspended: number };
  answerButtons: { learning: number[]; review: number[] };
  intervals: Array<{ label: string; count: number }>;
}

const PERIOD_DAYS: Record<StatsPeriod, number | null> = { month: 30, quarter: 90, year: 365, all: null };

function shiftKey(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function countStreak(days: Set<string>, todayKey: string) {
  let streak = 0;
  let cursor = days.has(todayKey) ? todayKey : shiftKey(todayKey, -1);
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftKey(cursor, -1);
  }
  return streak;
}

export interface Streak {
  days: number;
  activeToday: boolean;
}

export async function getStreak(user: CurrentUser): Promise<Streak> {
  // Same day boundaries as dayKey: the user's timezone, shifted back by the hour the day starts.
  const rows = await prisma.$queryRaw<Array<{ day: string }>>`
    SELECT DISTINCT to_char(
      (("reviewedAt" AT TIME ZONE 'UTC') AT TIME ZONE ${user.timezone}) - make_interval(hours => ${user.dayStartHour}::int),
      'YYYY-MM-DD'
    ) AS day
    FROM ${Prisma.raw(`"${dbSchema.replace(/"/g, '""')}"."ReviewLog"`)}
    WHERE "userId" = ${user.id}
  `;
  const days = new Set(rows.map((row) => row.day));
  const todayKey = dayKey(new Date(), user.timezone, user.dayStartHour);
  return { days: countStreak(days, todayKey), activeToday: days.has(todayKey) };
}

export async function getStats(user: CurrentUser, options: { deckId?: string; period: StatsPeriod }): Promise<StatsData> {
  const window = dayWindow(user);
  const days = PERIOD_DAYS[options.period];
  const periodStart = days ? new Date(window.start.getTime() - (days - 1) * DAY_MS) : null;
  const heatmapStart = new Date(window.start.getTime() - 364 * DAY_MS);
  const logsStart = periodStart && periodStart < heatmapStart ? periodStart : periodStart ? heatmapStart : null;
  const deckIds = options.deckId ? await getDeckSubtreeIds(user.id, options.deckId) : null;
  const deckFilter = deckIds ? { deckId: { in: deckIds } } : {};

  const [logs, cards, noteCount] = await Promise.all([
    prisma.reviewLog.findMany({
      where: { userId: user.id, ...deckFilter, ...(logsStart ? { reviewedAt: { gte: logsStart } } : {}) },
      select: { reviewedAt: true, prevState: true, rating: true, durationMs: true },
      orderBy: { reviewedAt: "asc" },
    }),
    prisma.card.findMany({
      where: { userId: user.id, ...deckFilter },
      select: { state: true, interval: true, due: true, suspended: true },
    }),
    prisma.note.count({ where: { userId: user.id, ...(deckIds ? { cards: { some: { deckId: { in: deckIds } } } } : {}) } }),
  ]);

  const tz = user.timezone;
  const hour = user.dayStartHour;
  const todayKey = dayKey(window.now, tz, hour);
  const byDay = new Map<string, DailyReviews>();
  const heat = new Map<string, number>();
  let retentionHits = 0;
  let retentionTotal = 0;
  const answerButtons = { learning: [0, 0, 0, 0], review: [0, 0, 0, 0] };
  const inPeriod = (date: Date) => !periodStart || date >= periodStart;

  for (const log of logs) {
    const key = dayKey(log.reviewedAt, tz, hour);
    if (log.reviewedAt >= heatmapStart) heat.set(key, (heat.get(key) ?? 0) + 1);
    if (!inPeriod(log.reviewedAt)) continue;
    const entry = byDay.get(key) ?? { day: key, fresh: 0, learning: 0, review: 0, total: 0, durationMs: 0 };
    if (log.prevState === "NEW") entry.fresh += 1;
    else if (log.prevState === "REVIEW") entry.review += 1;
    else entry.learning += 1;
    entry.total += 1;
    entry.durationMs += log.durationMs;
    byDay.set(key, entry);
    if (log.prevState === "REVIEW") {
      retentionTotal += 1;
      if (log.rating > 1) retentionHits += 1;
      answerButtons.review[log.rating - 1] += 1;
    } else {
      answerButtons.learning[log.rating - 1] += 1;
    }
  }

  const today = byDay.get(todayKey) ?? { reviews: 0, durationMs: 0, total: 0 };
  const streak = countStreak(new Set(heat.keys()), todayKey);

  const reviewsByDay: DailyReviews[] = [];
  const spanDays = days ?? Math.max(1, Math.round((window.start.getTime() - (logs[0]?.reviewedAt.getTime() ?? window.start.getTime())) / DAY_MS) + 1);
  for (let i = spanDays - 1; i >= 0; i -= 1) {
    const key = shiftKey(todayKey, -i);
    reviewsByDay.push(byDay.get(key) ?? { day: key, fresh: 0, learning: 0, review: 0, total: 0, durationMs: 0 });
  }

  const heatmap: Array<{ day: string; count: number }> = [];
  for (let i = 364; i >= 0; i -= 1) {
    const key = shiftKey(todayKey, -i);
    heatmap.push({ day: key, count: heat.get(key) ?? 0 });
  }

  const forecastMap = new Map<string, number>();
  const cardStates = { fresh: 0, learning: 0, young: 0, mature: 0, suspended: 0 };
  const intervalBuckets = [
    { label: "1d", max: 1 },
    { label: "2–7d", max: 7 },
    { label: "8–30d", max: 30 },
    { label: "1–3m", max: 90 },
    { label: "3–12m", max: 365 },
    { label: "+1a", max: Number.POSITIVE_INFINITY },
  ].map((b) => ({ ...b, count: 0 }));
  let due = 0;
  let dueTomorrow = 0;
  const tomorrowEnd = new Date(window.end.getTime() + DAY_MS);
  for (const card of cards) {
    if (card.suspended) {
      cardStates.suspended += 1;
      continue;
    }
    if (card.state === "NEW") cardStates.fresh += 1;
    else if (card.state === "LEARNING" || card.state === "RELEARNING") cardStates.learning += 1;
    else if (card.interval < 21) cardStates.young += 1;
    else cardStates.mature += 1;
    if (card.state !== "NEW") {
      const bucket = intervalBuckets.find((b) => card.interval <= b.max);
      if (bucket) bucket.count += 1;
      if (card.due < window.end) due += 1;
      else if (card.due < tomorrowEnd) dueTomorrow += 1;
      if (card.state === "REVIEW" && card.due >= window.start && card.due < new Date(window.start.getTime() + 30 * DAY_MS)) {
        const key = dayKey(card.due, tz, hour);
        forecastMap.set(key, (forecastMap.get(key) ?? 0) + 1);
      }
    }
  }
  const forecast: Array<{ day: string; count: number }> = [];
  for (let i = 0; i < 30; i += 1) {
    const key = shiftKey(todayKey, i);
    forecast.push({ day: key, count: forecastMap.get(key) ?? 0 });
  }

  return {
    period: options.period,
    today: { reviews: today.total, durationMs: today.durationMs },
    retention: retentionTotal > 0 ? retentionHits / retentionTotal : null,
    streak,
    totals: { cards: cards.length, notes: noteCount, due, dueTomorrow },
    reviewsByDay,
    heatmap,
    forecast,
    cardStates,
    answerButtons,
    intervals: intervalBuckets.map((b) => ({ label: b.label, count: b.count })),
  };
}
