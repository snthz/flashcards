import { prisma } from "@/lib/db";
import { loadDeckTree } from "@/lib/decks/queries";
import { getStreak } from "@/lib/stats/queries";
import { dayKey } from "@/lib/scheduler";
import { resolveLocale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/messages";
import { isPushConfigured, sendToUser } from "./push";
import { isReminderHour, localHour } from "./rules";

export async function sendDueReminders(now = new Date()) {
  if (!isPushConfigured()) return 0;
  const users = await prisma.user.findMany({
    where: { reminderHour: { not: null }, pushSubscriptions: { some: {} } },
    select: { id: true, email: true, name: true, timezone: true, dayStartHour: true, locale: true, reminderHour: true, reminderSentOn: true },
  });
  let notified = 0;
  for (const user of users) {
    if (user.reminderHour == null || !isReminderHour(localHour(now, user.timezone), user.reminderHour)) continue;
    const today = dayKey(now, user.timezone, user.dayStartHour);
    if (user.reminderSentOn === today) continue;
    const claimed = await prisma.user.updateMany({
      where: { id: user.id, OR: [{ reminderSentOn: null }, { reminderSentOn: { not: today } }] },
      data: { reminderSentOn: today },
    });
    if (claimed.count === 0) continue;
    const locale = resolveLocale(user.locale);
    const tree = await loadDeckTree(user, locale);
    const due = tree.reduce((sum, node) => sum + node.counts.fresh + node.counts.learning + node.counts.review, 0);
    if (due === 0) continue;
    const streak = await getStreak(user);
    const t = dictionaries[locale].reminders;
    const body = streak.days > 0 && !streak.activeToday ? t.bodyStreak(due, streak.days) : t.body(due);
    const result = await sendToUser(user.id, { title: t.title, body, url: "/decks", tag: "daily-reminder" });
    if (result.sent > 0) notified += 1;
  }
  return notified;
}
