import { Prisma } from "@/generated/prisma/client";
import { dbSchema, prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/user";
import { addDays, localDay, monthGrid, zonedToUtc } from "./time";
import type { AgendaMonth, AgendaNoteData, AgendaTaskData, StudyDay } from "./types";

export function weekStart(locale: string): 0 | 1 {
  return locale.startsWith("en") ? 0 : 1;
}

const noteSelect = { id: true, day: true, title: true, body: true, links: true, images: true, updatedAt: true } as const;
const taskSelect = { id: true, day: true, time: true, title: true, notes: true, remindMinutes: true, doneAt: true } as const;

export function toNote(row: { id: string; day: string; title: string; body: string; links: string[]; images: string[]; updatedAt: Date }): AgendaNoteData {
  return { ...row, updatedAt: row.updatedAt.toISOString() };
}

export function toTask(row: { id: string; day: string; time: string | null; title: string; notes: string; remindMinutes: number | null; doneAt: Date | null }): AgendaTaskData {
  const { doneAt, ...rest } = row;
  return { ...rest, done: doneAt !== null };
}

async function studyDays(user: CurrentUser, first: string, last: string): Promise<StudyDay[]> {
  const from = zonedToUtc(addDays(first, -1), "00:00", user.timezone);
  const to = zonedToUtc(addDays(last, 2), "00:00", user.timezone);
  const rows = await prisma.$queryRaw<Array<{ day: string; reviews: bigint; duration: bigint | null }>>`
    SELECT to_char(
      (("reviewedAt" AT TIME ZONE 'UTC') AT TIME ZONE ${user.timezone}) - make_interval(hours => ${user.dayStartHour}::int),
      'YYYY-MM-DD'
    ) AS day,
    COUNT(*) AS reviews,
    SUM("durationMs") AS duration
    FROM ${Prisma.raw(`"${dbSchema.replace(/"/g, '""')}"."ReviewLog"`)}
    WHERE "userId" = ${user.id} AND "reviewedAt" >= ${from} AND "reviewedAt" < ${to}
    GROUP BY 1
  `;
  return rows
    .filter((row) => row.day >= first && row.day <= last)
    .map((row) => ({ day: row.day, reviews: Number(row.reviews), minutes: Math.round(Number(row.duration ?? 0) / 60_000) }));
}

export async function agendaMonth(user: CurrentUser, month: string): Promise<AgendaMonth> {
  const grid = monthGrid(month, weekStart(user.locale));
  const first = grid[0].day;
  const last = grid[grid.length - 1].day;
  const [notes, tasks, study] = await Promise.all([
    prisma.agendaNote.findMany({ where: { userId: user.id, day: { gte: first, lte: last } }, orderBy: { createdAt: "asc" }, select: noteSelect }),
    prisma.agendaTask.findMany({ where: { userId: user.id, day: { gte: first, lte: last } }, orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }], select: taskSelect }),
    studyDays(user, first, last),
  ]);
  return { month, today: localDay(new Date(), user.timezone), notes: notes.map(toNote), tasks: tasks.map(toTask), study };
}

export async function upcomingTasks(user: CurrentUser): Promise<AgendaTaskData[]> {
  const today = localDay(new Date(), user.timezone);
  const rows = await prisma.agendaTask.findMany({
    where: { userId: user.id, doneAt: null, day: { gte: addDays(today, -30), lte: addDays(today, 14) } },
    orderBy: [{ dueAt: "asc" }],
    take: 8,
    select: taskSelect,
  });
  return rows.map(toTask);
}
