import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Play, Plus, Search, Settings2 } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { findNode, getDeckTree, subtreeIds } from "@/lib/decks/queries";
import { prisma } from "@/lib/db";
import { CustomStudyButton } from "@/components/decks/custom-study-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreateDeckButton } from "@/components/decks/deck-dialogs";
import { ExportButton } from "@/components/export/export-dialog";
import { ExpandableText } from "@/components/ui/expandable-text";
import { formatNumber } from "@/lib/utils";
import { getI18n, getMessages } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.decks.deckTitle };
}

function CountTile({ label, value, tone, locale }: { label: string; value: number; tone: string; locale: Locale }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border bg-card px-4 py-5">
      <span className={`text-3xl font-semibold tabular-nums ${tone}`}>{formatNumber(value, locale)}</span>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}

export default async function DeckPage({ params }: PageProps<"/decks/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const { locale, t } = await getI18n();
  const tree = await getDeckTree(user);
  const deck = findNode(tree, id);
  if (!deck) notFound();
  const pending = deck.counts.fresh + deck.counts.learning + deck.counts.review;
  const deckIds = subtreeIds(deck);
  const [taggedNotes, flagged] = await Promise.all([
    prisma.note.findMany({
      where: { userId: user.id, tags: { isEmpty: false }, cards: { some: { deckId: { in: deckIds } } } },
      select: { tags: true },
      take: 5000,
    }),
    prisma.card.groupBy({ by: ["flag"], where: { userId: user.id, deckId: { in: deckIds }, flag: { gt: 0 } } }),
  ]);
  const tags = [...new Set(taggedNotes.flatMap((note) => note.tags))].sort((a, b) => a.localeCompare(b)).slice(0, 200);
  const flags = flagged.map((row) => row.flag).sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={deck.fullName}
        description={deck.description ? <ExpandableText text={deck.description} /> : undefined}
        backHref={deck.parentId ? `/decks/${deck.parentId}` : "/decks"}
        actions={
          <>
            <Link href={`/browse?deck=${deck.id}`} className={buttonStyles("outline", "md")}>
              <Search className="size-4" />
              {t.decks.browse}
            </Link>
            <Link href={`/decks/${deck.id}/options`} className={buttonStyles("outline", "md")}>
              <Settings2 className="size-4" />
              {t.common.options}
            </Link>
            <ExportButton target={{ id: deck.id, name: deck.fullName }}>
              <Download className="size-4" />
              {t.exporter.export}
            </ExportButton>
          </>
        }
      />
      <div className="grid grid-cols-3 gap-3">
        <CountTile label={t.decks.new} value={deck.counts.fresh} tone="text-info" locale={locale} />
        <CountTile label={t.decks.learning} value={deck.counts.learning} tone="text-danger" locale={locale} />
        <CountTile label={t.decks.review} value={deck.counts.review} tone="text-success" locale={locale} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/decks/${deck.id}/study`}
          className={buttonStyles("primary", "lg", `h-14 sm:flex-1 ${pending === 0 ? "pointer-events-none opacity-50" : ""}`)}
          aria-disabled={pending === 0}
        >
          <Play className="size-5" />
          {pending > 0 ? t.decks.studyNow : t.decks.nothingDue}
        </Link>
        <Link href={`/notes/new?deck=${deck.id}`} className={buttonStyles("outline", "lg", "h-14")}>
          <Plus className="size-5" />
          {t.decks.addCard}
        </Link>
        <CustomStudyButton deckId={deck.id} tags={tags} flags={flags} />
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 p-6 pb-4">
          <p className="text-sm font-medium">{t.decks.subdecks}</p>
          <CreateDeckButton parentId={deck.id} variant="outline" size="sm">
            <Plus className="size-3.5" />
            {t.decks.subdeck}
          </CreateDeckButton>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-6 pt-0">
          {deck.children.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.decks.noSubdecks}</p>
          ) : (
            <ul className="divide-y">
              {deck.children.map((child) => (
                <li key={child.id}>
                  <Link href={`/decks/${child.id}`} className="flex items-center justify-between py-2.5 text-sm hover:text-accent">
                    <span className="truncate font-medium">{child.name}</span>
                    <span className="flex gap-3 tabular-nums text-muted-foreground">
                      <span className="text-info">{formatNumber(child.counts.fresh, locale)}</span>
                      <span className="text-danger">{formatNumber(child.counts.learning, locale)}</span>
                      <span className="text-success">{formatNumber(child.counts.review, locale)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">{t.decks.totalCards(deck.counts.total, formatNumber(deck.counts.total, locale))}</p>
        </CardContent>
      </Card>
    </div>
  );
}
