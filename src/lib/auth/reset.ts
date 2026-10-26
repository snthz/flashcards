import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { RESET_TOKEN_MINUTES } from "@/lib/validation/auth";
const MAX_REQUESTS = 3;
const REQUEST_WINDOW_MINUTES = 15;

function hashResetToken(token: string) {
  return createHash("sha256").update(`${process.env.SESSION_SECRET ?? ""}:reset:${token}`).digest("hex");
}

export async function issueResetToken(userId: string) {
  const since = new Date(Date.now() - REQUEST_WINDOW_MINUTES * 60_000);
  const recent = await prisma.passwordResetToken.count({ where: { userId, createdAt: { gte: since } } });
  if (recent >= MAX_REQUESTS) return null;
  const token = randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + RESET_TOKEN_MINUTES * 60_000) },
  });
  return token;
}

export async function findValidResetToken(token: string) {
  if (!token || token.length > 200) return null;
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) return null;
  return record;
}

export async function consumeResetToken(id: string, userId: string, passwordHash: string) {
  return prisma.$transaction(async (tx) => {
    const claimed = await tx.passwordResetToken.updateMany({ where: { id, userId, usedAt: null }, data: { usedAt: new Date() } });
    if (claimed.count === 0) return false;
    await tx.user.update({ where: { id: userId }, data: { passwordHash } });
    await tx.passwordResetToken.deleteMany({ where: { userId, id: { not: id } } });
    await tx.session.deleteMany({ where: { userId } });
    return true;
  });
}
