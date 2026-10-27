import { prisma } from "@/lib/db";
import { intlLocale, resolveLocale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/messages";
import { isPushConfigured, sendToUser } from "@/lib/reminders/push";
import { addDays, localDay } from "./time";

const STALE_MS = 6 * 3600_000;

export function dueLabel(t: (typeof dictionaries)["en"]["agenda"], day: string, time: string | null, today: string, locale: string) {
  const when =
    day === today
      ? t.push.today
      : day === addDays(today, 1)
        ? t.push.tomorrow
        : new Intl.DateTimeFormat(intlLocale(resolveLocale(locale)), { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));
  return time ? t.push.dueAt(when, time) : t.push.due(when);
}

export async function sendTaskReminders(now = new Date()) {
  if (!isPushConfigured()) return 0;
  const tasks = await prisma.agendaTask.findMany({
    where: { remindAt: { lte: now }, remindedAt: null, doneAt: null },
    orderBy: { remindAt: "asc" },
    take: 200,
    select: { id: true, title: true, day: true, time: true, remindAt: true, user: { select: { id: true, locale: true, timezone: true } } },
  });
  let sent = 0;
  for (const task of tasks) {
    await prisma.agendaTask.update({ where: { id: task.id }, data: { remindedAt: now } });
    if (task.remindAt && now.getTime() - task.remindAt.getTime() > STALE_MS) continue;
    const t = dictionaries[resolveLocale(task.user.locale)].agenda;
    const today = localDay(now, task.user.timezone);
    const result = await sendToUser(task.user.id, {
      title: t.push.title(task.title),
      body: dueLabel(t, task.day, task.time, today, task.user.locale),
      url: `/agenda?day=${task.day}`,
      tag: `task-${task.id}`,
    });
    sent += result.sent;
  }
  return sent;
}
