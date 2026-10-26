import webpush, { WebPushError } from "web-push";
import { prisma } from "@/lib/db";
import { isPushEndpoint } from "./rules";
const TTL_SECONDS = 6 * 3600;

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
}

export function vapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export function isPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export { isPushEndpoint };

function vapidSubject() {
  if (process.env.VAPID_SUBJECT) return process.env.VAPID_SUBJECT;
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  return appUrl.startsWith("https://") ? appUrl : "mailto:reminders@flashcards.invalid";
}

export async function sendToUser(userId: string, payload: PushPayload) {
  if (!isPushConfigured()) return { sent: 0, removed: 0 };
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  const vapidDetails = { subject: vapidSubject(), publicKey: process.env.VAPID_PUBLIC_KEY!, privateKey: process.env.VAPID_PRIVATE_KEY! };
  let sent = 0;
  const expired: string[] = [];
  for (const subscription of subscriptions) {
    if (!isPushEndpoint(subscription.endpoint)) {
      expired.push(subscription.id);
      continue;
    }
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        JSON.stringify(payload),
        { vapidDetails, TTL: TTL_SECONDS, urgency: "normal" },
      );
      sent += 1;
    } catch (error) {
      if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) expired.push(subscription.id);
      else console.error("[push] delivery failed", error instanceof WebPushError ? `${error.statusCode} ${error.body}` : error);
    }
  }
  if (expired.length > 0) await prisma.pushSubscription.deleteMany({ where: { id: { in: expired } } });
  return { sent, removed: expired.length };
}
