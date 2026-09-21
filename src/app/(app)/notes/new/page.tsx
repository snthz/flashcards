import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/user";
import { getDeckOptions, getNoteTypeOptions } from "@/lib/notes/queries";
import { PageHeader } from "@/components/layout/page-header";
import { NoteEditor } from "@/components/notes/note-editor";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Añadir nota" };

export default async function NewNotePage({ searchParams }: PageProps<"/notes/new">) {
  const { deck } = await searchParams;
  const user = await requireUser();
  const [decks, noteTypes] = await Promise.all([getDeckOptions(user), getNoteTypeOptions(user.id)]);
  const deckId = typeof deck === "string" && decks.some((d) => d.id === deck) ? deck : decks[0]?.id;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title="Añadir nota" backHref={deckId ? `/decks/${deckId}` : "/decks"} />
      {decks.length === 0 ? (
        <EmptyState title="Crea un mazo primero" description="Necesitas al menos un mazo para añadir tarjetas." />
      ) : (
        <NoteEditor
          mode="create"
          decks={decks}
          noteTypes={noteTypes.map((t) => ({ id: t.id, name: t.name, kind: t.kind, fields: t.fields as Array<{ name: string }> }))}
          initialDeckId={deckId}
        />
      )}
    </div>
  );
}
