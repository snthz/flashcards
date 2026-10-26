import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { getDeckOptions, getNoteTypeOptions } from "@/lib/notes/queries";
import { PageHeader } from "@/components/layout/page-header";
import { NoteEditor } from "@/components/notes/note-editor";
import { getMessages } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.notes.editTitle };
}

export default async function EditNotePage({ params, searchParams }: PageProps<"/notes/[id]/edit">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [user, t] = await Promise.all([requireUser(), getMessages()]);
  const [note, decks, noteTypes] = await Promise.all([
    prisma.note.findFirst({ where: { id, userId: user.id }, select: { id: true, noteTypeId: true, fields: true, tags: true } }),
    getDeckOptions(user),
    getNoteTypeOptions(user.id),
  ]);
  if (!note) notFound();
  const from = typeof query.from === "string" && query.from.startsWith("/") ? query.from : "/browse";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title={t.notes.editTitle} backHref={from} />
      <NoteEditor
        mode="edit"
        decks={decks}
        noteTypes={noteTypes.map((t) => ({
          id: t.id,
          name: t.name,
          kind: t.kind,
          fields: t.fields as Array<{ name: string }>,
          templates: t.templates as Array<{ name: string; qfmt: string; afmt: string }>,
          css: t.css,
        }))}
        initialNoteTypeId={note.noteTypeId}
        noteId={note.id}
        initialFields={note.fields}
        initialTags={note.tags}
        returnTo={from}
      />
    </div>
  );
}
