import { prisma } from "@/lib/db";
import { loadDeckTree } from "@/lib/decks/queries";
import { getStreak } from "@/lib/stats/queries";
import { dayKey } from "@/lib/scheduler";
import { resolveLocale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/messages";
import { isPushConfigured, sendToUser } from "./push";
import { dueStage, localHour, studyMinutes } from "./rules";
import { reminderMessage, shouldNotify } from "./messages";

const PACE_SAMPLE = 200;

async function averageReviewMs(userId: string) {
  const recent = await prisma.reviewLog.findMany({
    where: { userId, durationMs: { gt: 0 } },
    orderBy: { reviewedAt: "desc" },
    take: PACE_SAMPLE,
    select: { durationMs: true },
  });
  if (recent.length === 0) return null;
  return recent.reduce((sum, log) => sum + log.durationMs, 0) / recent.length;
}

export async function sendDueReminders(now = new Date()) {
  if (!isPushConfigured()) return 0;
  const users = await prisma.user.findMany({
    where: { reminderHour: { not: null }, pushSubscriptions: { some: {} } },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      timezone: true,
      dayStartHour: true,
      locale: true,
      reminderHour: true,
      reminderSentOn: true,
      reminderStage: true,
      reminderNudges: true,
    },
  });
  let notified = 0;
  for (const user of users) {
    if (user.reminderHour == null) continue;
    const stage = dueStage(localHour(now, user.timezone), user.reminderHour, user.reminderNudges);
    if (!stage) continue;
    const today = dayKey(now, user.timezone, user.dayStartHour);
    const sentToday = user.reminderSentOn === today ? user.reminderStage : 0;
    if (sentToday >= stage) continue;

    const locale = resolveLocale(user.locale);
    const [tree, streak] = await Promise.all([loadDeckTree(user, locale), getStreak(user)]);
    const due = tree.reduce((sum, node) => sum + node.counts.fresh + node.counts.learning + node.counts.review, 0);

    const claimed = await prisma.user.updateMany({
      where: {
        id: user.id,
        OR: [{ reminderSentOn: null }, { reminderSentOn: { not: today } }, { reminderSentOn: today, reminderStage: { lt: stage } }],
      },
      data: { reminderSentOn: today, reminderStage: stage },
    });
    if (claimed.count === 0 || !shouldNotify(stage, due, streak)) continue;

    const minutes = studyMinutes(due, stage === 2 ? await averageReviewMs(user.id) : null);
    const message = reminderMessage(dictionaries[locale].reminders, stage, due, streak, minutes, `${today}:${stage}`);
    const result = await sendToUser(user.id, { ...message, url: "/decks", tag: "daily-reminder" });
    if (result.sent > 0) notified += 1;
  }
  return notified;
}
