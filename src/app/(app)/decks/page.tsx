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
import { DeckListSkeleton } from "./loading";

export const metadata: Metadata = { title: "Mazos" };

async function Decks() {
  const user = await requireUser();
  const tree = await getDeckTree(user);
  return <DeckList tree={tree} />;
}

export default function DecksPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Mazos"
        actions={
          <>
            <Link href="/import" className={buttonStyles("outline", "md")}>
              <Upload className="size-4" />
              Importar
            </Link>
            <CreateDeckButton>
              <Plus className="size-4" />
              Nuevo mazo
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
