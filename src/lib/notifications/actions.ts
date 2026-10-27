"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { notificationFeed } from "./store";

export async function loadNotifications() {
  const user = await requireUser();
  return notificationFeed(user.id);
}

export async function markNotificationsRead(raw: unknown) {
  const user = await requireUser();
  const ids = z.array(z.string().uuid()).max(100).nullable().safeParse(raw);
  if (!ids.success) return notificationFeed(user.id);
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null, ...(ids.data ? { id: { in: ids.data } } : {}) },
    data: { readAt: new Date() },
  });
  return notificationFeed(user.id);
}
