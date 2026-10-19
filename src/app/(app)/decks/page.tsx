import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { getDeckTree } from "@/lib/decks/queries";
import { PageHeader } from "@/components/layout/page-header";
import { buttonStyles } from "@/components/ui/button";
import { DeckList } from "@/components/decks/deck-list";
import { CreateDeckButton } from "@/components/decks/deck-dialogs";
import { StreakBadge } from "@/components/stats/streak-badge";
import { getStreak } from "@/lib/stats/queries";
import { getMessages } from "@/lib/i18n/server";
import { DeckListSkeleton } from "./loading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.decks.title };
}

async function Decks() {
  const user = await requireUser();
  const tree = await getDeckTree(user);
  return <DeckList tree={tree} />;
}

async function Streak() {
  const user = await requireUser();
  const streak = await getStreak(user);
  return <StreakBadge streak={streak} className="mr-auto sm:mr-0" />;
}

export default async function DecksPage() {
  const t = await getMessages();
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t.decks.title}
        actions={
          <>
            <Suspense fallback={<span className="skeleton mr-auto h-10 w-16 rounded-full sm:mr-0" />}>
              <Streak />
            </Suspense>
            <Link href="/import" className={buttonStyles("outline", "md")}>
              <Upload className="size-4" />
              {t.decks.import}
            </Link>
            <CreateDeckButton>
              <Plus className="size-4" />
              {t.decks.newDeck}
            </CreateDeckButton>
          </>
        }
      />
      <Suspense fallback={<DeckListSkeleton />}>
        <Decks />
      </Suspense>
    </div>
  );
}
