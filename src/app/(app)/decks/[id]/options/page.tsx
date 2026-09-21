import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { PageHeader } from "@/components/layout/page-header";
import { DeckOptionsForm } from "@/components/decks/deck-options-form";

export const metadata: Metadata = { title: "Opciones del mazo" };

export default async function DeckOptionsPage({ params }: PageProps<"/decks/[id]/options">) {
  const { id } = await params;
  const user = await requireUser();
  const [deck, configs] = await Promise.all([
    prisma.deck.findFirst({ where: { id, userId: user.id }, include: { config: true } }),
    prisma.deckConfig.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
  ]);
  if (!deck) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title="Opciones" description={deck.name} backHref={`/decks/${deck.id}`} />
      <DeckOptionsForm
        deckId={deck.id}
        config={{
          id: deck.config.id,
          name: deck.config.name,
          algorithm: deck.config.algorithm,
          newPerDay: deck.config.newPerDay,
          reviewsPerDay: deck.config.reviewsPerDay,
          learningSteps: deck.config.learningSteps,
          relearningSteps: deck.config.relearningSteps,
          graduatingInterval: deck.config.graduatingInterval,
          easyInterval: deck.config.easyInterval,
          startingEase: deck.config.startingEase,
          easyBonus: deck.config.easyBonus,
          hardMultiplier: deck.config.hardMultiplier,
          intervalModifier: deck.config.intervalModifier,
          lapseMultiplier: deck.config.lapseMultiplier,
          minLapseInterval: deck.config.minLapseInterval,
          maxInterval: deck.config.maxInterval,
          leechThreshold: deck.config.leechThreshold,
          leechAction: deck.config.leechAction,
          newCardOrder: deck.config.newCardOrder,
          desiredRetention: deck.config.desiredRetention,
          fsrsWeights: deck.config.fsrsWeights,
          isDefault: deck.config.isDefault,
        }}
        configs={configs.map((c) => ({ id: c.id, name: c.name, isDefault: c.isDefault }))}
      />
    </div>
  );
}
