import { headers } from "next/headers";
import { prisma } from "@/lib/db";

const RETENTION_MS = 24 * 3_600_000;

export interface Limit {
  key: string;
  max: number;
  windowMs: number;
}

export const LOGIN_EMAIL = { max: 5, windowMs: 15 * 60_000 };
export const LOGIN_IP = { max: 20, windowMs: 15 * 60_000 };
export const REGISTER_IP = { max: 10, windowMs: 60 * 60_000 };
export const RESET_IP = { max: 10, windowMs: 60 * 60_000 };

export async function clientIp() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headerStore.get("x-real-ip")?.trim() || "unknown";
}

export function retryAfterMs(attempts: Date[], limit: Pick<Limit, "max" | "windowMs">, now = Date.now()) {
  const recent = attempts.map((date) => date.getTime()).filter((time) => time > now - limit.windowMs).sort((a, b) => a - b);
  if (recent.length < limit.max) return 0;
  return recent[recent.length - limit.max] + limit.windowMs - now;
}

export async function blockedFor(limits: Limit[]) {
  const now = Date.now();
  let wait = 0;
  for (const limit of limits) {
    const rows = await prisma.authAttempt.findMany({
      where: { key: limit.key, createdAt: { gt: new Date(now - limit.windowMs) } },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit.max,
    });
    wait = Math.max(wait, retryAfterMs(rows.map((row) => row.createdAt), limit, now));
  }
  return wait;
}

export async function recordAttempt(keys: string[]) {
  await prisma.authAttempt.createMany({ data: keys.map((key) => ({ key })) });
  if (Math.random() < 0.02) await prisma.authAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - RETENTION_MS) } } });
}

export async function clearAttempts(key: string) {
  await prisma.authAttempt.deleteMany({ where: { key } });
}
