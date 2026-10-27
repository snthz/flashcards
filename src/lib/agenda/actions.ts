"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { normalizeLink, IMAGE_NAME } from "./media";
import { agendaMonth, toNote, toTask, upcomingTasks } from "./queries";
import { DAY_RE, MONTH_RE, TIME_RE, dueInstant, reminderInstant } from "./time";
import { MAX_IMAGES, MAX_LINKS, MAX_REMIND_MINUTES, type AgendaMonth, type AgendaNoteData, type AgendaTaskData } from "./types";

const noteSchema = z.object({
  id: z.string().uuid().nullable(),
  day: z.string().regex(DAY_RE),
  title: z.string().trim().max(120),
  body: z.string().max(20_000),
  links: z.array(z.string().max(500)).max(MAX_LINKS),
  images: z.array(z.string().regex(IMAGE_NAME)).max(MAX_IMAGES),
});

const taskSchema = z.object({
  id: z.string().uuid().nullable(),
  title: z.string().trim().min(1).max(160),
  notes: z.string().max(4_000),
  day: z.string().regex(DAY_RE),
  time: z.string().regex(TIME_RE).nullable(),
  remindMinutes: z.number().int().min(0).max(MAX_REMIND_MINUTES).nullable(),
});

export type AgendaResult<T> = { ok: true; data: T } | { ok: false; error: "invalid" | "empty" | "not-found" };

export async function loadAgendaMonth(month: string): Promise<{ month: AgendaMonth; upcoming: AgendaTaskData[] } | null> {
  const user = await requireUser();
  if (!MONTH_RE.test(month)) return null;
  const [data, upcoming] = await Promise.all([agendaMonth(user, month), upcomingTasks(user)]);
  return { month: data, upcoming };
}

export async function saveAgendaNote(raw: unknown): Promise<AgendaResult<AgendaNoteData>> {
  const user = await requireUser();
  const parsed = noteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const input = parsed.data;
  const links = [...new Set(input.links.map(normalizeLink).filter((link): link is string => link !== null))];
  const owned = input.images.length
    ? new Set((await prisma.media.findMany({ where: { userId: user.id, name: { in: input.images } }, select: { name: true } })).map((media) => media.name))
    : new Set<string>();
  const images = [...new Set(input.images.filter((name) => owned.has(name)))];
  const body = input.body.trim();
  if (!input.title && !body && links.length === 0 && images.length === 0) return { ok: false, error: "empty" };
  const data = { day: input.day, title: input.title, body, links, images };
  const select = { id: true, day: true, title: true, body: true, links: true, images: true, updatedAt: true } as const;
  if (input.id) {
    const existing = await prisma.agendaNote.findFirst({ where: { id: input.id, userId: user.id }, select: { id: true } });
    if (!existing) return { ok: false, error: "not-found" };
    const note = await prisma.agendaNote.update({ where: { id: existing.id }, data, select });
    revalidatePath("/agenda");
    return { ok: true, data: toNote(note) };
  }
  const note = await prisma.agendaNote.create({ data: { ...data, userId: user.id }, select });
  revalidatePath("/agenda");
  return { ok: true, data: toNote(note) };
}

export async function deleteAgendaNote(id: string) {
  const user = await requireUser();
  await prisma.agendaNote.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/agenda");
}

export async function saveAgendaTask(raw: unknown): Promise<AgendaResult<AgendaTaskData>> {
  const user = await requireUser();
  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const input = parsed.data;
  const remindAt = reminderInstant(input.day, input.time, input.remindMinutes, user.timezone);
  const data = {
    title: input.title,
    notes: input.notes.trim(),
    day: input.day,
    time: input.time,
    dueAt: dueInstant(input.day, input.time, user.timezone),
    remindMinutes: input.remindMinutes,
    remindAt,
    remindedAt: remindAt && remindAt.getTime() <= Date.now() ? new Date() : null,
  };
  const select = { id: true, day: true, time: true, title: true, notes: true, remindMinutes: true, doneAt: true } as const;
  if (input.id) {
    const existing = await prisma.agendaTask.findFirst({ where: { id: input.id, userId: user.id }, select: { id: true } });
    if (!existing) return { ok: false, error: "not-found" };
    const task = await prisma.agendaTask.update({ where: { id: existing.id }, data, select });
    revalidatePath("/agenda");
    return { ok: true, data: toTask(task) };
  }
  const task = await prisma.agendaTask.create({ data: { ...data, userId: user.id }, select });
  revalidatePath("/agenda");
  return { ok: true, data: toTask(task) };
}

export async function setAgendaTaskDone(id: string, done: boolean) {
  const user = await requireUser();
  await prisma.agendaTask.updateMany({ where: { id, userId: user.id }, data: { doneAt: done ? new Date() : null } });
  revalidatePath("/agenda");
}

export async function deleteAgendaTask(id: string) {
  const user = await requireUser();
  await prisma.agendaTask.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/agenda");
}
