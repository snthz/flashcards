"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { importCollection } from "@/lib/anki/import";
import { getPremadeDeck } from "./catalog";

export type InstallResult = { error?: string; deckId?: string };

// Adding a deck again refreshes its content and adds new cards without touching study progress.
export async function installPremadeDeck(slug: string): Promise<InstallResult> {
  const user = await requireUser();
  const deck = getPremadeDeck(slug);
  if (!deck) return { error: "Este mazo ya no está disponible" };
  try {
    await importCollection(user.id, deck.build());
  } catch {
    return { error: "No se pudo añadir el mazo. Inténtalo de nuevo." };
  }
  const root = await prisma.deck.findFirst({ where: { userId: user.id, ankiId: deck.rootAnkiId }, select: { id: true } });
  revalidatePath("/decks");
  revalidatePath("/discover");
  return { deckId: root?.id };
}
