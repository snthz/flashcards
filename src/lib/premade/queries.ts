import { prisma } from "@/lib/db";
import { PREMADE_DECKS } from "./catalog";

// Maps each catalog slug the user already added to the id of their copy of the top deck.
export async function getInstalledPremade(userId: string) {
  const rows = await prisma.deck.findMany({
    where: { userId, ankiId: { in: PREMADE_DECKS.map((deck) => deck.rootAnkiId) } },
    select: { id: true, ankiId: true },
  });
  const installed = new Map<string, string>();
  for (const deck of PREMADE_DECKS) {
    const row = rows.find((r) => r.ankiId === deck.rootAnkiId);
    if (row) installed.set(deck.slug, row.id);
  }
  return installed;
}
