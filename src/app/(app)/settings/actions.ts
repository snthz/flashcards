"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { destroyAllSessions } from "@/lib/auth/session";
import { changePasswordSchema, profileSchema } from "@/lib/validation/auth";
import { isValidTimeZone } from "@/lib/scheduler";
import { getI18n } from "@/lib/i18n/server";
import { issueMessage, parseOptions } from "@/lib/i18n/validation";
import { isPushEndpoint, sendToUser } from "@/lib/reminders/push";
import { z } from "zod";

export type SettingsState = { error?: string; success?: string; fieldErrors?: Record<string, string> };

export async function updateProfile(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const user = await requireUser();
  const { locale, t } = await getI18n();
  const parsed = profileSchema.safeParse(
    {
      name: formData.get("name"),
      timezone: formData.get("timezone"),
      dayStartHour: formData.get("dayStartHour"),
    },
    parseOptions(locale),
  );
  if (!parsed.success) return { error: issueMessage(t, parsed.error.issues[0]) };
  if (!isValidTimeZone(parsed.data.timezone)) return { fieldErrors: { timezone: t.settings.invalidTimezone } };
  await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/", "layout");
  return { success: t.settings.profileUpdated };
}

export async function changePassword(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const user = await requireUser();
  const { locale, t } = await getI18n();
  const parsed = changePasswordSchema.safeParse(
    {
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
    },
    parseOptions(locale),
  );
  if (!parsed.success) return { error: issueMessage(t, parsed.error.issues[0]) };
  const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const valid = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
  if (!valid) return { fieldErrors: { currentPassword: t.settings.wrongCurrentPassword } };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  return { success: t.settings.passwordUpdated };
}

export async function deleteAccount(formData: FormData) {
  const user = await requireUser();
  const confirmation = formData.get("confirmation");
  if (confirmation !== user.email) return;
  await destroyAllSessions(user.id);
  await prisma.user.delete({ where: { id: user.id } });
  redirect("/register");
}

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({ p256dh: z.string().min(1).max(256), auth: z.string().min(1).max(256) }),
});

export async function saveReminderHour(hour: number | null) {
  const user = await requireUser();
  const value = hour == null ? null : Math.max(0, Math.min(23, Math.round(hour)));
  await prisma.user.update({ where: { id: user.id }, data: { reminderHour: value, reminderSentOn: null } });
}

export async function savePushSubscription(input: unknown) {
  const user = await requireUser();
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success || !isPushEndpoint(parsed.data.endpoint)) return { ok: false };
  const headerStore = await headers();
  const data = { userId: user.id, p256dh: parsed.data.keys.p256dh, auth: parsed.data.keys.auth, userAgent: headerStore.get("user-agent")?.slice(0, 255) ?? null };
  await prisma.pushSubscription.upsert({ where: { endpoint: parsed.data.endpoint }, create: { endpoint: parsed.data.endpoint, ...data }, update: data });
  return { ok: true };
}

export async function deletePushSubscription(endpoint: string) {
  const user = await requireUser();
  await prisma.pushSubscription.deleteMany({ where: { userId: user.id, endpoint } });
  const remaining = await prisma.pushSubscription.count({ where: { userId: user.id } });
  if (remaining === 0) await prisma.user.update({ where: { id: user.id }, data: { reminderHour: null } });
}

export async function sendTestReminder() {
  const user = await requireUser();
  const { t } = await getI18n();
  const result = await sendToUser(user.id, { title: t.reminders.testTitle, body: t.reminders.testBody, url: "/decks", tag: "test-reminder" });
  return { sent: result.sent };
}
