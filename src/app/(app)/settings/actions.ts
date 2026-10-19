"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { destroyAllSessions } from "@/lib/auth/session";
import { changePasswordSchema, profileSchema } from "@/lib/validation/auth";
import { isValidTimeZone } from "@/lib/scheduler";
import { getI18n } from "@/lib/i18n/server";
import { issueMessage, parseOptions } from "@/lib/i18n/validation";

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
