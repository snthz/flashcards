"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { createDeckSchema, deckConfigSchema, renameDeckSchema } from "@/lib/validation/deck";
import { getI18n } from "@/lib/i18n/server";
import { issueMessage, parseOptions } from "@/lib/i18n/validation";
import { optimizeParameters, type OptimizeResult } from "@/lib/fsrs/optimize";

export type ActionState = { error?: string; success?: string };

export async function createDeck(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const { locale, t } = await getI18n();
  const parsed = createDeckSchema.safeParse({ name: formData.get("name"), parentId: formData.get("parentId") ?? "" }, parseOptions(locale));
  if (!parsed.success) return { error: issueMessage(t, parsed.error.issues[0]) };
  const parentId = parsed.data.parentId || null;
  if (parentId) {
    const parent = await prisma.deck.findFirst({ where: { id: parentId, userId: user.id }, select: { id: true } });
    if (!parent) return { error: t.decks.parentNotFound };
  }
  const duplicate = await prisma.deck.findFirst({ where: { userId: user.id, parentId, name: parsed.data.name } });
  if (duplicate) return { error: t.decks.duplicateName };
  const config = await prisma.deckConfig.findFirstOrThrow({ where: { userId: user.id, isDefault: true }, select: { id: true } });
  const deck = await prisma.deck.create({
    data: { userId: user.id, name: parsed.data.name, parentId, configId: config.id },
    select: { id: true },
  });
  revalidatePath("/decks");
  redirect(`/decks/${deck.id}`);
}

export async function renameDeck(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const { locale, t } = await getI18n();
  const description = formData.get("description");
  const parsed = renameDeckSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: typeof description === "string" ? description.replace(/\r\n?/g, "\n") : undefined,
  }, parseOptions(locale));
  if (!parsed.success) return { error: issueMessage(t, parsed.error.issues[0]) };
  const deck = await prisma.deck.findFirst({ where: { id: parsed.data.id, userId: user.id }, select: { id: true, parentId: true } });
  if (!deck) return { error: t.decks.deckNotFound };
  const duplicate = await prisma.deck.findFirst({
    where: { userId: user.id, parentId: deck.parentId, name: parsed.data.name, NOT: { id: deck.id } },
  });
  if (duplicate) return { error: t.decks.duplicateName };
  await prisma.deck.update({
    where: { id: deck.id },
    data: { name: parsed.data.name, description: parsed.data.description ?? undefined },
  });
  revalidatePath("/decks");
  revalidatePath(`/decks/${deck.id}`);
  return { success: t.decks.updated };
}

export async function deleteDeck(deckId: string) {
  const user = await requireUser();
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId: user.id }, select: { id: true } });
  if (!deck) return;
  await prisma.deck.delete({ where: { id: deck.id } });
  await prisma.note.deleteMany({ where: { userId: user.id, cards: { none: {} } } });
  revalidatePath("/decks");
  redirect("/decks");
}

export async function setDeckConfig(deckId: string, configId: string) {
  const user = await requireUser();
  const [deck, config] = await Promise.all([
    prisma.deck.findFirst({ where: { id: deckId, userId: user.id }, select: { id: true } }),
    prisma.deckConfig.findFirst({ where: { id: configId, userId: user.id }, select: { id: true } }),
  ]);
  if (!deck || !config) return;
  await prisma.deck.update({ where: { id: deck.id }, data: { configId: config.id } });
  revalidatePath("/decks");
  revalidatePath(`/decks/${deck.id}`);
}

export async function saveDeckConfig(configId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const { locale, t } = await getI18n();
  const config = await prisma.deckConfig.findFirst({ where: { id: configId, userId: user.id }, select: { id: true } });
  if (!config) return { error: t.deckOptions.presetNotFound };
  const raw = Object.fromEntries(formData.entries());
  const parsed = deckConfigSchema.safeParse(raw, parseOptions(locale));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (!issue) return { error: t.common.invalidData };
    const field = String(issue.path[0] ?? "");
    const labels: Record<string, string> = t.deckOptions.fieldNames;
    return { error: `${labels[field] ?? field}: ${issueMessage(t, issue)}` };
  }
  const data = parsed.data;
  await prisma.deckConfig.update({
    where: { id: config.id },
    data: {
      name: data.name,
      algorithm: data.algorithm,
      newPerDay: data.newPerDay,
      reviewsPerDay: data.reviewsPerDay,
      learningSteps: data.learningSteps,
      relearningSteps: data.relearningSteps,
      graduatingInterval: data.graduatingInterval,
      easyInterval: data.easyInterval,
      startingEase: Math.round(data.startingEase * 10),
      easyBonus: data.easyBonus,
      hardMultiplier: data.hardMultiplier,
      intervalModifier: data.intervalModifier,
      lapseMultiplier: data.lapseMultiplier,
      minLapseInterval: data.minLapseInterval,
      maxInterval: data.maxInterval,
      leechThreshold: data.leechThreshold,
      leechAction: data.leechAction,
      newCardOrder: data.newCardOrder,
      desiredRetention: data.desiredRetention,
      fsrsWeights: data.fsrsWeights,
    },
  });
  revalidatePath("/decks");
  return { success: t.deckOptions.saved };
}

export async function createDeckConfig(deckId: string, name: string) {
  const user = await requireUser();
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId: user.id }, select: { id: true, config: true } });
  if (!deck) return;
  const { t } = await getI18n();
  const base = deck.config;
  const created = await prisma.deckConfig.create({
    data: {
      userId: user.id,
      name: name.trim().slice(0, 80) || t.deckOptions.newPresetName,
      isDefault: false,
      algorithm: base.algorithm,
      newPerDay: base.newPerDay,
      reviewsPerDay: base.reviewsPerDay,
      learningSteps: base.learningSteps,
      relearningSteps: base.relearningSteps,
      graduatingInterval: base.graduatingInterval,
      easyInterval: base.easyInterval,
      startingEase: base.startingEase,
      easyBonus: base.easyBonus,
      hardMultiplier: base.hardMultiplier,
      intervalModifier: base.intervalModifier,
      lapseMultiplier: base.lapseMultiplier,
      minLapseInterval: base.minLapseInterval,
      maxInterval: base.maxInterval,
      leechThreshold: base.leechThreshold,
      leechAction: base.leechAction,
      newCardOrder: base.newCardOrder,
      desiredRetention: base.desiredRetention,
      fsrsWeights: base.fsrsWeights,
    },
    select: { id: true },
  });
  await prisma.deck.update({ where: { id: deck.id }, data: { configId: created.id } });
  revalidatePath(`/decks/${deck.id}/options`);
}

export async function deleteDeckConfig(deckId: string, configId: string) {
  const user = await requireUser();
  const config = await prisma.deckConfig.findFirst({ where: { id: configId, userId: user.id }, select: { id: true, isDefault: true } });
  if (!config || config.isDefault) return;
  const fallback = await prisma.deckConfig.findFirstOrThrow({ where: { userId: user.id, isDefault: true }, select: { id: true } });
  await prisma.deck.updateMany({ where: { userId: user.id, configId: config.id }, data: { configId: fallback.id } });
  await prisma.deckConfig.delete({ where: { id: config.id } });
  revalidatePath(`/decks/${deckId}/options`);
}

export async function optimizeFsrs(deckId: string): Promise<OptimizeResult | { status: "failed" }> {
  const user = await requireUser();
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId: user.id }, select: { configId: true } });
  if (!deck) return { status: "failed" };
  try {
    const result = await optimizeParameters(user, deck.configId);
    if (!result) return { status: "failed" };
    if (result.status === "updated") revalidatePath(`/decks/${deckId}/options`);
    return result;
  } catch (error) {
    console.error("[fsrs] optimization failed", error);
    return { status: "failed" };
  }
}
