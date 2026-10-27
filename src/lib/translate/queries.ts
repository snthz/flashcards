import { prisma } from "@/lib/db";
import { open } from "@/lib/crypto/secret-box";
import { DEFAULT_CLAUDE_MODEL, isClaudeModel } from "./types";

export async function translatorStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { anthropicKey: true, anthropicModel: true } });
  const key = user?.anthropicKey ? open(user.anthropicKey) : null;
  return {
    keyHint: key ? `…${key.slice(-4)}` : null,
    model: isClaudeModel(user?.anthropicModel) ? user.anthropicModel : DEFAULT_CLAUDE_MODEL,
  };
}
