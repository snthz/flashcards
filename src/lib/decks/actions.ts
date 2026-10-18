"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { createDeckSchema, deckConfigSchema, renameDeckSchema } from "@/lib/validation/deck";

export type ActionState = { error?: string; success?: string };

const CONFIG_LABELS: Record<string, string> = {
  name: "Nombre del preajuste",
  algorithm: "Algoritmo",
  newPerDay: "Tarjetas nuevas por día",
  reviewsPerDay: "Repasos máximos por día",
  learningSteps: "Pasos de aprendizaje",
  relearningSteps: "Pasos de reaprendizaje",
  graduatingInterval: "Intervalo de graduación",
  easyInterval: "Intervalo fácil",
  startingEase: "Facilidad inicial",
  easyBonus: "Bonificación fácil",
  hardMultiplier: "Multiplicador difícil",
  intervalModifier: "Modificador de intervalo",
  lapseMultiplier: "Nuevo intervalo tras olvido",
  minLapseInterval: "Intervalo mínimo tras olvido",
  maxInterval: "Intervalo máximo",
  leechThreshold: "Umbral de sanguijuela",
  leechAction: "Acción con sanguijuelas",
  newCardOrder: "Orden de tarjetas nuevas",
  desiredRetention: "Retención deseada",
  fsrsWeights: "Parámetros FSRS",
};

export async function createDeck(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = createDeckSchema.safeParse({ name: formData.get("name"), parentId: formData.get("parentId") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const parentId = parsed.data.parentId || null;
  if (parentId) {
    const parent = await prisma.deck.findFirst({ where: { id: parentId, userId: user.id }, select: { id: true } });
    if (!parent) return { error: "El mazo padre no existe" };
  }
  const duplicate = await prisma.deck.findFirst({ where: { userId: user.id, parentId, name: parsed.data.name } });
  if (duplicate) return { error: "Ya existe un mazo con ese nombre" };
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
  const description = formData.get("description");
  const parsed = renameDeckSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: typeof description === "string" ? description.replace(/\r\n?/g, "\n") : undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const deck = await prisma.deck.findFirst({ where: { id: parsed.data.id, userId: user.id }, select: { id: true, parentId: true } });
  if (!deck) return { error: "Mazo no encontrado" };
  const duplicate = await prisma.deck.findFirst({
    where: { userId: user.id, parentId: deck.parentId, name: parsed.data.name, NOT: { id: deck.id } },
  });
  if (duplicate) return { error: "Ya existe un mazo con ese nombre" };
  await prisma.deck.update({
    where: { id: deck.id },
    data: { name: parsed.data.name, description: parsed.data.description ?? undefined },
  });
  revalidatePath("/decks");
  revalidatePath(`/decks/${deck.id}`);
  return { success: "Mazo actualizado" };
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
  const config = await prisma.deckConfig.findFirst({ where: { id: configId, userId: user.id }, select: { id: true } });
  if (!config) return { error: "Configuración no encontrada" };
  const raw = Object.fromEntries(formData.entries());
  const parsed = deckConfigSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = String(issue?.path[0] ?? "");
    return { error: issue ? `${CONFIG_LABELS[field] ?? field}: ${issue.message}` : "Datos inválidos" };
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
  return { success: "Opciones guardadas" };
}

export async function createDeckConfig(deckId: string, name: string) {
  const user = await requireUser();
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId: user.id }, select: { id: true, config: true } });
  if (!deck) return;
  const base = deck.config;
  const created = await prisma.deckConfig.create({
    data: {
      userId: user.id,
      name: name.trim().slice(0, 80) || "Nueva configuración",
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
