"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/user";
import { clozeOrdinals, fieldMap, isQuestionEmpty, plainText } from "@/lib/anki/render";
import { ankiGuid } from "@/lib/anki/guid";
import type { NoteTypeField, NoteTypeTemplate } from "@/lib/anki/types";
import { noteInputSchema, noteUpdateSchema } from "@/lib/validation/note";
import { getI18n } from "@/lib/i18n/server";
import { issueMessage, parseOptions } from "@/lib/i18n/validation";

export type NoteActionState = { error?: string; success?: string; noteId?: string };

interface NoteTypeShape {
  kind: "STANDARD" | "CLOZE";
  name: string;
  css: string;
  fields: NoteTypeField[];
  templates: NoteTypeTemplate[];
}

function requiredOrdinals(noteType: NoteTypeShape, fields: string[], tags: string[]): number[] {
  const names = noteType.fields.map((f) => f.name);
  if (noteType.kind === "CLOZE") {
    const text = fields.join("\n");
    const ords = clozeOrdinals(text);
    return ords.length > 0 ? ords : [0];
  }
  const map = fieldMap(names, fields);
  const ords: number[] = [];
  noteType.templates.forEach((template, ord) => {
    const empty = isQuestionEmpty({
      fields: map,
      template,
      css: noteType.css,
      ord,
      kind: noteType.kind,
      tags,
      deckName: "",
      noteTypeName: noteType.name,
      mediaBase: "/api/media/",
    });
    if (!empty) ords.push(ord);
  });
  return ords.length > 0 ? ords : [0];
}

function readFields(formData: FormData) {
  const fields: string[] = [];
  let index = 0;
  while (formData.has(`field-${index}`)) {
    fields.push(String(formData.get(`field-${index}`) ?? ""));
    index += 1;
  }
  return fields;
}

export async function createNote(_prev: NoteActionState, formData: FormData): Promise<NoteActionState> {
  const [user, { locale, t }] = await Promise.all([requireUser(), getI18n()]);
  const parsed = noteInputSchema.safeParse(
    {
      deckId: formData.get("deckId"),
      noteTypeId: formData.get("noteTypeId"),
      fields: readFields(formData),
      tags: formData.get("tags") ?? "",
    },
    parseOptions(locale),
  );
  if (!parsed.success) return { error: issueMessage(t, parsed.error.issues[0]) };
  const [deck, noteType] = await Promise.all([
    prisma.deck.findFirst({ where: { id: parsed.data.deckId, userId: user.id }, select: { id: true } }),
    prisma.noteType.findFirst({ where: { id: parsed.data.noteTypeId, userId: user.id } }),
  ]);
  if (!deck || !noteType) return { error: t.notes.invalidDeckOrNoteType };
  const shape: NoteTypeShape = {
    kind: noteType.kind,
    name: noteType.name,
    css: noteType.css,
    fields: noteType.fields as NoteTypeField[],
    templates: noteType.templates as NoteTypeTemplate[],
  };
  const fields = shape.fields.map((_, i) => parsed.data.fields[i] ?? "");
  if (fields.every((f) => plainText(f).length === 0 && !/<img|\[sound:/i.test(f))) return { error: t.notes.fieldsEmpty };
  const ords = requiredOrdinals(shape, fields, parsed.data.tags);
  const lastPosition = await prisma.card.aggregate({ where: { userId: user.id }, _max: { newPosition: true } });
  const position = (lastPosition._max.newPosition ?? 0) + 1;
  const note = await prisma.note.create({
    data: {
      userId: user.id,
      noteTypeId: noteType.id,
      fields,
      tags: parsed.data.tags,
      sortField: plainText(fields[noteType.sortFieldIdx] ?? fields[0] ?? "", 200),
      ankiGuid: ankiGuid(),
      cards: {
        create: ords.map((ord) => ({ userId: user.id, deckId: deck.id, ord, newPosition: position })),
      },
    },
    select: { id: true },
  });
  revalidatePath("/decks");
  revalidatePath("/browse");
  return { success: t.notes.added(ords.length), noteId: note.id };
}

export async function updateNote(_prev: NoteActionState, formData: FormData): Promise<NoteActionState> {
  const [user, { locale, t }] = await Promise.all([requireUser(), getI18n()]);
  const parsed = noteUpdateSchema.safeParse(
    {
      noteId: formData.get("noteId"),
      fields: readFields(formData),
      tags: formData.get("tags") ?? "",
    },
    parseOptions(locale),
  );
  if (!parsed.success) return { error: issueMessage(t, parsed.error.issues[0]) };
  const note = await prisma.note.findFirst({
    where: { id: parsed.data.noteId, userId: user.id },
    include: { noteType: true, cards: { select: { id: true, ord: true, deckId: true, state: true } } },
  });
  if (!note) return { error: t.notes.noteNotFound };
  const shape: NoteTypeShape = {
    kind: note.noteType.kind,
    name: note.noteType.name,
    css: note.noteType.css,
    fields: note.noteType.fields as NoteTypeField[],
    templates: note.noteType.templates as NoteTypeTemplate[],
  };
  const fields = shape.fields.map((_, i) => parsed.data.fields[i] ?? "");
  const ords = requiredOrdinals(shape, fields, parsed.data.tags);
  const existingOrds = new Set(note.cards.map((c) => c.ord));
  const deckId = note.cards[0]?.deckId;
  const missing = deckId ? ords.filter((ord) => !existingOrds.has(ord)) : [];
  const removable = note.cards.filter((c) => !ords.includes(c.ord) && c.state === "NEW").map((c) => c.id);

  await prisma.$transaction(async (tx) => {
    await tx.note.update({
      where: { id: note.id },
      data: {
        fields,
        tags: parsed.data.tags,
        sortField: plainText(fields[note.noteType.sortFieldIdx] ?? fields[0] ?? "", 200),
      },
    });
    if (missing.length > 0 && deckId) {
      await tx.card.createMany({ data: missing.map((ord) => ({ userId: user.id, noteId: note.id, deckId, ord })) });
    }
    if (removable.length > 0 && removable.length < note.cards.length + missing.length) {
      await tx.card.deleteMany({ where: { id: { in: removable } } });
    }
  });
  revalidatePath("/decks");
  revalidatePath("/browse");
  return { success: t.notes.saved };
}

export async function deleteNotes(noteIds: string[]) {
  const user = await requireUser();
  await prisma.note.deleteMany({ where: { userId: user.id, id: { in: noteIds } } });
  revalidatePath("/decks");
  revalidatePath("/browse");
}

export async function deleteNoteAndRedirect(noteId: string, redirectTo: string) {
  await deleteNotes([noteId]);
  redirect(redirectTo || "/browse");
}

export async function setCardsSuspended(cardIds: string[], suspended: boolean) {
  const user = await requireUser();
  await prisma.card.updateMany({ where: { userId: user.id, id: { in: cardIds } }, data: { suspended, buriedUntil: null } });
  revalidatePath("/decks");
  revalidatePath("/browse");
}

export async function resetCards(cardIds: string[]) {
  const user = await requireUser();
  await prisma.card.updateMany({
    where: { userId: user.id, id: { in: cardIds } },
    data: {
      state: "NEW",
      due: new Date(),
      interval: 0,
      ease: 2500,
      step: 0,
      stability: null,
      difficulty: null,
      lastReview: null,
      buriedUntil: null,
    },
  });
  revalidatePath("/decks");
  revalidatePath("/browse");
}

export async function moveCards(cardIds: string[], deckId: string) {
  const user = await requireUser();
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId: user.id }, select: { id: true } });
  if (!deck) return;
  await prisma.card.updateMany({ where: { userId: user.id, id: { in: cardIds } }, data: { deckId: deck.id } });
  revalidatePath("/decks");
  revalidatePath("/browse");
}
