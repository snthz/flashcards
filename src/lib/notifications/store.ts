import { prisma } from "@/lib/db";

const KEEP = 60;

export type NotificationKind = "task" | "study";

export interface NotificationData {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  url: string;
  createdAt: string;
  read: boolean;
}

export async function createNotification(userId: string, input: { kind: NotificationKind; title: string; body: string; url: string }) {
  await prisma.notification.create({ data: { userId, ...input } });
  const stale = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, skip: KEEP, select: { id: true } });
  if (stale.length > 0) await prisma.notification.deleteMany({ where: { id: { in: stale.map((row) => row.id) } } });
}

export async function notificationFeed(userId: string, take = 20) {
  const [rows, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take, select: { id: true, kind: true, title: true, body: true, url: true, createdAt: true, readAt: true } }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  const items: NotificationData[] = rows.map((row) => ({
    id: row.id,
    kind: row.kind === "study" ? "study" : "task",
    title: row.title,
    body: row.body,
    url: row.url,
    createdAt: row.createdAt.toISOString(),
    read: row.readAt !== null,
  }));
  return { items, unread };
}
