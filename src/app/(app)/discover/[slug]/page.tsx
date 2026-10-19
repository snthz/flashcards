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
import { getI18n, getMessages } from "@/lib/i18n/server";

export async function generateMetadata({ params }: PageProps<"/discover/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = await getMessages();
  return { title: getPremadeDeck(slug)?.title ?? t.discover.title };
}

export default async function PremadeDeckPage({ params }: PageProps<"/discover/[slug]">) {
  const { slug } = await params;
  const deck = getPremadeDeck(slug);
  if (!deck) notFound();
  const user = await requireUser();
  const { locale, t } = await getI18n();
  const installed = await getInstalledPremade(user.id);
  const text = deck.text[locale];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title={deck.title} description={text.summary} backHref="/discover" />

      <div className="flex flex-wrap gap-1.5">
        <Badge tone="accent">{t.discover.cardCount(deck.cardCount, formatNumber(deck.cardCount, locale))}</Badge>
        <Badge>{text.languages}</Badge>
        <Badge>{text.level}</Badge>
        {text.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <InstallButton slug={deck.slug} installedDeckId={installed.get(deck.slug) ?? null} />

      <p className="text-sm leading-relaxed text-muted-foreground">{text.description}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t.discover.sampleCards}</CardTitle>
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
          <CardTitle>{t.discover.subdecks}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {deck.subdecks.map((subdeck) => (
            <Badge key={subdeck.name}>
              {subdeck.name} · {formatNumber(subdeck.count, locale)}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
