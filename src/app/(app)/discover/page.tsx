import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Languages } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { PREMADE_DECKS } from "@/lib/premade/catalog";
import { getInstalledPremade } from "@/lib/premade/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { getI18n, getMessages } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.discover.title };
}

export default async function DiscoverPage() {
  const user = await requireUser();
  const { locale, t } = await getI18n();
  const installed = await getInstalledPremade(user.id);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t.discover.title} description={t.discover.description} />
      <div className="grid gap-3 sm:grid-cols-2">
        {PREMADE_DECKS.map((deck) => (
          <Link
            key={deck.slug}
            href={`/discover/${deck.slug}`}
            className="group flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-muted/50"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Languages className="size-5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-semibold tracking-tight">{deck.title}</h2>
                  {installed.has(deck.slug) ? <Badge tone="success">{t.discover.added}</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{deck.text[locale].summary}</p>
              </div>
              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge>{t.discover.cardCount(deck.cardCount, formatNumber(deck.cardCount, locale))}</Badge>
              <Badge>{deck.text[locale].languages}</Badge>
              {deck.text[locale].tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </Link>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">{t.discover.comingSoon}</p>
    </div>
  );
}
