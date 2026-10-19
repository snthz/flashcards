"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/user";
import { isLocale } from "./config";
import { setLocaleCookie } from "./server";

export async function changeLocale(locale: string) {
  if (!isLocale(locale)) return;
  await setLocaleCookie(locale);
  const user = await getCurrentUser();
  if (user) await prisma.user.update({ where: { id: user.id }, data: { locale } });
  revalidatePath("/", "layout");
}
