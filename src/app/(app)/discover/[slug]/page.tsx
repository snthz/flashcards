import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/user";
import { getPremadeDeck } from "@/lib/premade/catalog";
import { getInstalledPremade } from "@/lib/premade/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstallButton } from "@/components/discover/install-button";
import { formatNumber } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/discover/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getPremadeDeck(slug)?.title ?? "Descubrir" };
}

export default async function PremadeDeckPage({ params }: PageProps<"/discover/[slug]">) {
  const { slug } = await params;
  const deck = getPremadeDeck(slug);
  if (!deck) notFound();
  const user = await requireUser();
  const installed = await getInstalledPremade(user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title={deck.title} description={deck.summary} backHref="/discover" />

      <div className="flex flex-wrap gap-1.5">
        <Badge tone="accent">{formatNumber(deck.cardCount)} tarjetas</Badge>
        <Badge>{deck.languages}</Badge>
        <Badge>{deck.level}</Badge>
        {deck.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <InstallButton slug={deck.slug} installedDeckId={installed.get(deck.slug) ?? null} />

      <p className="text-sm leading-relaxed text-muted-foreground">{deck.description}</p>

      <Card>
        <CardHeader>
          <CardTitle>Algunas tarjetas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {deck.samples.map((sample) => (
            <div key={sample.front} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <span className="font-semibold">{sample.front}</span>
              <span className="text-right text-sm text-muted-foreground">{sample.back}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submazos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {deck.subdecks.map((subdeck) => (
            <Badge key={subdeck.name}>
              {subdeck.name} · {subdeck.count}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
