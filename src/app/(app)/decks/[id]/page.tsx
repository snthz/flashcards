import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Plus, Search, Settings2 } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { findNode, getDeckTree } from "@/lib/decks/queries";
import { PageHeader } from "@/components/layout/page-header";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreateDeckButton } from "@/components/decks/deck-dialogs";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Mazo" };

function CountTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border bg-card px-4 py-5">
      <span className={`text-3xl font-semibold tabular-nums ${tone}`}>{formatNumber(value)}</span>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}

export default async function DeckPage({ params }: PageProps<"/decks/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const tree = await getDeckTree(user);
  const deck = findNode(tree, id);
  if (!deck) notFound();
  const pending = deck.counts.fresh + deck.counts.learning + deck.counts.review;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={deck.fullName}
        description={deck.description || undefined}
        backHref={deck.parentId ? `/decks/${deck.parentId}` : "/decks"}
        actions={
          <>
            <Link href={`/browse?deck=${deck.id}`} className={buttonStyles("outline", "md")}>
              <Search className="size-4" />
              Explorar
            </Link>
            <Link href={`/decks/${deck.id}/options`} className={buttonStyles("outline", "md")}>
              <Settings2 className="size-4" />
              Opciones
            </Link>
          </>
        }
      />
      <div className="grid grid-cols-3 gap-3">
        <CountTile label="Nuevas" value={deck.counts.fresh} tone="text-info" />
        <CountTile label="Aprendiendo" value={deck.counts.learning} tone="text-danger" />
        <CountTile label="Repaso" value={deck.counts.review} tone="text-success" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/decks/${deck.id}/study`}
          className={buttonStyles("primary", "lg", `h-14 sm:flex-1 ${pending === 0 ? "pointer-events-none opacity-50" : ""}`)}
          aria-disabled={pending === 0}
        >
          <Play className="size-5" />
          {pending > 0 ? "Estudiar ahora" : "Nada pendiente por hoy"}
        </Link>
        <Link href={`/notes/new?deck=${deck.id}`} className={buttonStyles("outline", "lg", "h-14")}>
          <Plus className="size-5" />
          Añadir tarjeta
        </Link>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 p-6 pb-4">
          <p className="text-sm font-medium">Submazos</p>
          <CreateDeckButton parentId={deck.id} variant="outline" size="sm">
            <Plus className="size-3.5" />
            Submazo
          </CreateDeckButton>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-6 pt-0">
          {deck.children.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este mazo no tiene submazos.</p>
          ) : (
            <ul className="divide-y">
              {deck.children.map((child) => (
                <li key={child.id}>
                  <Link href={`/decks/${child.id}`} className="flex items-center justify-between py-2.5 text-sm hover:text-accent">
                    <span className="truncate font-medium">{child.name}</span>
                    <span className="flex gap-3 tabular-nums text-muted-foreground">
                      <span className="text-info">{child.counts.fresh}</span>
                      <span className="text-danger">{child.counts.learning}</span>
                      <span className="text-success">{child.counts.review}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">{formatNumber(deck.counts.total)} tarjetas en total</p>
        </CardContent>
      </Card>
    </div>
  );
}
