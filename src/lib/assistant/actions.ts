"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";

export async function assistantStatus() {
  const user = await requireUser();
  const settings = await prisma.user.findUnique({ where: { id: user.id }, select: { anthropicKey: true } });
  return { hasKey: Boolean(settings?.anthropicKey) };
}
