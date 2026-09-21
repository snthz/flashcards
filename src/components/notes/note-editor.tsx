"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { createNote, deleteNoteAndRedirect, updateNote, type NoteActionState } from "@/lib/notes/actions";

interface NoteTypeOption {
  id: string;
  name: string;
  kind: "STANDARD" | "CLOZE";
  fields: Array<{ name: string }>;
}

interface EditorProps {
  mode: "create" | "edit";
  decks: Array<{ id: string; name: string }>;
  noteTypes: NoteTypeOption[];
  initialDeckId?: string;
  initialNoteTypeId?: string;
  noteId?: string;
  initialFields?: string[];
  initialTags?: string[];
  returnTo?: string;
}

export function NoteEditor({
  mode,
  decks,
  noteTypes,
  initialDeckId,
  initialNoteTypeId,
  noteId,
  initialFields = [],
  initialTags = [],
  returnTo,
}: EditorProps) {
  const router = useRouter();
  const [noteTypeId, setNoteTypeId] = useState(initialNoteTypeId ?? noteTypes[0]?.id ?? "");
  const noteType = noteTypes.find((t) => t.id === noteTypeId) ?? noteTypes[0];
  const [state, action, pending] = useActionState<NoteActionState, FormData>(mode === "create" ? createNote : updateNote, {});
  const [values, setValues] = useState<string[]>(() => (noteType?.fields ?? []).map((_, i) => initialFields[i] ?? ""));
  const [tags, setTags] = useState(initialTags.join(" "));
  const firstFieldRef = useRef<HTMLTextAreaElement>(null);
  const lastSuccess = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (mode === "create" && state.success && state.noteId && state.noteId !== lastSuccess.current) {
      lastSuccess.current = state.noteId;
      setValues((noteType?.fields ?? []).map(() => ""));
      firstFieldRef.current?.focus();
    }
    if (mode === "edit" && state.success && returnTo) {
      router.push(returnTo);
    }
  }, [state.success, state.noteId, mode, noteType, returnTo, router]);

  const changeNoteType = (id: string) => {
    setNoteTypeId(id);
    const next = noteTypes.find((t) => t.id === id);
    setValues((next?.fields ?? []).map((_, i) => values[i] ?? ""));
  };

  if (!noteType) return <p className="text-sm text-muted-foreground">No tienes tipos de nota.</p>;

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormError message={state.error} />
      {state.success ? <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{state.success}</p> : null}
      {mode === "edit" ? <input type="hidden" name="noteId" value={noteId} /> : null}
      {mode === "create" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mazo" htmlFor="deckId">
            <Select id="deckId" name="deckId" defaultValue={initialDeckId ?? decks[0]?.id ?? ""} required>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo de nota" htmlFor="noteTypeId">
            <Select id="noteTypeId" name="noteTypeId" value={noteTypeId} onChange={(e) => changeNoteType(e.target.value)}>
              {noteTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        {noteType.fields.map((field, index) => (
          <Field
            key={`${noteType.id}-${index}`}
            label={field.name}
            htmlFor={`field-${index}`}
            hint={noteType.kind === "CLOZE" && index === 0 ? "Usa {{c1::texto}} para crear huecos. Se admite HTML." : undefined}
          >
            <Textarea
              id={`field-${index}`}
              name={`field-${index}`}
              ref={index === 0 ? firstFieldRef : undefined}
              value={values[index] ?? ""}
              onChange={(e) => setValues((prev) => prev.map((v, i) => (i === index ? e.target.value : v)))}
              rows={index === 0 ? 4 : 3}
              className="font-sans"
            />
          </Field>
        ))}
        <Field label="Etiquetas" htmlFor="tags" hint="Separadas por espacios.">
          <Input id="tags" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} autoComplete="off" />
        </Field>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {mode === "edit" && noteId ? (
          <Button
            type="button"
            variant="ghost"
            className="text-danger"
            onClick={() => {
              if (window.confirm("¿Eliminar esta nota y todas sus tarjetas?")) {
                void deleteNoteAndRedirect(noteId, returnTo ?? "/browse");
              }
            }}
          >
            Eliminar nota
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {returnTo ? (
            <Button type="button" variant="ghost" onClick={() => router.push(returnTo)}>
              Cancelar
            </Button>
          ) : null}
          <Button type="submit" loading={pending}>
            {mode === "create" ? "Añadir" : "Guardar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
