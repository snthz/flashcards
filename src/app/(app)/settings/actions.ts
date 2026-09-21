"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { destroyAllSessions } from "@/lib/auth/session";
import { changePasswordSchema, profileSchema } from "@/lib/validation/auth";
import { isValidTimeZone } from "@/lib/scheduler";

export type SettingsState = { error?: string; success?: string; fieldErrors?: Record<string, string> };

export async function updateProfile(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone"),
    dayStartHour: formData.get("dayStartHour"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  if (!isValidTimeZone(parsed.data.timezone)) return { fieldErrors: { timezone: "Zona horaria inválida" } };
  await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/", "layout");
  return { success: "Perfil actualizado" };
}

export async function changePassword(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const valid = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
  if (!valid) return { fieldErrors: { currentPassword: "La contraseña actual no es correcta" } };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  return { success: "Contraseña actualizada" };
}

export async function deleteAccount(formData: FormData) {
  const user = await requireUser();
  const confirmation = formData.get("confirmation");
  if (confirmation !== user.email) return;
  await destroyAllSessions(user.id);
  await prisma.user.delete({ where: { id: user.id } });
  redirect("/register");
}
