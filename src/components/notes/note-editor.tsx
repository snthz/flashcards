"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Music, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/dialog";
import { CardFrame } from "@/components/study/card-frame";
import { createNote, deleteNoteAndRedirect, updateNote, type NoteActionState } from "@/lib/notes/actions";
import { clozeOrdinals, fieldMap, plainText, renderCard } from "@/lib/anki/render";
import { fieldMedia, mediaSnippet, mediaUrl, uploadMedia } from "@/lib/notes/media-client";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface NoteTypeOption {
  id: string;
  name: string;
  kind: "STANDARD" | "CLOZE";
  fields: Array<{ name: string }>;
  templates: Array<{ name: string; qfmt: string; afmt: string }>;
  css: string;
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

const NO_AUDIO: string[] = [];
const ACCEPTED = /^(?:image|audio)\//;

function MediaStrip({ value, onRemove, removeLabel }: { value: string; onRemove: (tag: string) => void; removeLabel: string }) {
  const items = fieldMedia(value);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <div key={`${item.tag}-${index}`} className="group relative flex items-center gap-2 rounded-lg border bg-muted/50 p-1 pr-2 text-xs">
          {item.kind === "image" ? (
            <span
              role="img"
              aria-label={item.name}
              className="size-12 rounded-md bg-muted bg-cover bg-center"
              style={{ backgroundImage: `url("${mediaUrl(item.name).replace(/"/g, "%22")}")` }}
            />
          ) : (
            <span className="flex size-12 items-center justify-center rounded-md bg-card text-muted-foreground">
              <Music className="size-5" />
            </span>
          )}
          <span className="max-w-32 truncate text-muted-foreground">{item.name}</span>
          <button
            type="button"
            onClick={() => onRemove(item.tag)}
            aria-label={`${removeLabel} ${item.name}`}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
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
  const t = useMessages();
  const [noteTypeId, setNoteTypeId] = useState(initialNoteTypeId ?? noteTypes[0]?.id ?? "");
  const noteType = noteTypes.find((t) => t.id === noteTypeId) ?? noteTypes[0];
  const [state, action, pending] = useActionState<NoteActionState, FormData>(mode === "create" ? createNote : updateNote, {});
  const [values, setValues] = useState<string[]>(() => (noteType?.fields ?? []).map((_, i) => initialFields[i] ?? ""));
  const [tags, setTags] = useState(initialTags.join(" "));
  const [uploading, setUploading] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [side, setSide] = useState<"question" | "answer">("question");
  const [templateIndex, setTemplateIndex] = useState(0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fieldRefs = useRef<Array<HTMLTextAreaElement | null>>([]);
  const fileInputs = useRef<Array<HTMLInputElement | null>>([]);
  const lastSuccess = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (mode === "create" && state.success && state.noteId && state.noteId !== lastSuccess.current) {
      lastSuccess.current = state.noteId;
      setValues((noteType?.fields ?? []).map(() => ""));
      fieldRefs.current[0]?.focus();
    }
    if (mode === "edit" && state.success && returnTo) {
      router.push(returnTo);
    }
  }, [state.success, state.noteId, mode, noteType, returnTo, router]);

  const preview = useMemo(() => {
    if (!noteType) return null;
    const fields = fieldMap(
      noteType.fields.map((field) => field.name),
      values,
    );
    const cloze = noteType.kind === "CLOZE";
    const ord = cloze ? (clozeOrdinals(values.join("\n"))[0] ?? 0) : Math.min(templateIndex, noteType.templates.length - 1);
    const template = cloze ? noteType.templates[0] : noteType.templates[ord];
    if (!template) return null;
    const rendered = renderCard({
      fields,
      template,
      css: noteType.css,
      ord,
      kind: noteType.kind,
      tags: tags.split(/\s+/).filter(Boolean),
      deckName: decks.find((deck) => deck.id === initialDeckId)?.name ?? "",
      noteTypeName: noteType.name,
      mediaBase: "/api/media/",
      typeAnswerPlaceholder: t.study.typeAnswer,
    });
    return { ...rendered, ord };
  }, [noteType, values, templateIndex, tags, decks, initialDeckId, t.study.typeAnswer]);

  const changeNoteType = (id: string) => {
    setNoteTypeId(id);
    setTemplateIndex(0);
    const next = noteTypes.find((t) => t.id === id);
    setValues((next?.fields ?? []).map((_, i) => values[i] ?? ""));
  };

  const setField = (index: number, value: string) => setValues((prev) => prev.map((v, i) => (i === index ? value : v)));

  const insertAtCursor = (index: number, snippet: string) => {
    const textarea = fieldRefs.current[index];
    const current = values[index] ?? "";
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${snippet}${current.slice(end)}`;
    setField(index, next);
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  };

  const addFiles = async (index: number, files: File[]) => {
    const accepted = files.filter((file) => ACCEPTED.test(file.type));
    if (accepted.length === 0) return;
    setUploadError(null);
    setUploading(index);
    const snippets: string[] = [];
    for (const file of accepted) {
      const result = await uploadMedia(file);
      if ("error" in result) {
        setUploadError(
          result.error === "too_large" ? t.notes.uploadTooLarge(file.name) : result.error === "unsupported" ? t.notes.uploadUnsupported(file.name) : t.notes.uploadFailed(file.name),
        );
        continue;
      }
      snippets.push(mediaSnippet(result.kind, result.name));
    }
    if (snippets.length > 0) insertAtCursor(index, snippets.join(" "));
    setUploading(null);
  };

  const onPaste = (index: number) => (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = [...event.clipboardData.files];
    if (!files.some((file) => ACCEPTED.test(file.type))) return;
    event.preventDefault();
    void addFiles(index, files);
  };

  const onDrop = (index: number) => (event: DragEvent<HTMLTextAreaElement>) => {
    const files = [...event.dataTransfer.files];
    if (files.length === 0) return;
    event.preventDefault();
    void addFiles(index, files);
  };

  if (!noteType) return <p className="text-sm text-muted-foreground">{t.notes.noNoteTypes}</p>;

  const hasContent = values.some((value) => plainText(value).length > 0 || /<img|\[sound:/i.test(value));

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormError message={state.error ?? uploadError} />
      {state.success ? <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{state.success}</p> : null}
      {mode === "edit" ? <input type="hidden" name="noteId" value={noteId} /> : null}
      {mode === "create" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.notes.deck} htmlFor="deckId">
            <Select id="deckId" name="deckId" defaultValue={initialDeckId ?? decks[0]?.id ?? ""} required>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.notes.noteType} htmlFor="noteTypeId">
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
            hint={noteType.kind === "CLOZE" && index === 0 ? t.notes.clozeHint : undefined}
          >
            <div className="flex flex-col gap-2">
              <Textarea
                id={`field-${index}`}
                name={`field-${index}`}
                ref={(element) => {
                  fieldRefs.current[index] = element;
                }}
                value={values[index] ?? ""}
                onChange={(e) => setField(index, e.target.value)}
                onPaste={onPaste(index)}
                onDragOver={(event) => {
                  if (event.dataTransfer.types.includes("Files")) event.preventDefault();
                }}
                onDrop={onDrop(index)}
                rows={index === 0 ? 4 : 3}
                className={cn("font-sans", uploading === index && "opacity-60")}
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  ref={(element) => {
                    fileInputs.current[index] = element;
                  }}
                  type="file"
                  accept="image/*,audio/*"
                  multiple
                  hidden
                  onChange={(event) => {
                    void addFiles(index, [...(event.target.files ?? [])]);
                    event.target.value = "";
                  }}
                />
                <Button type="button" variant="ghost" size="sm" disabled={uploading !== null} onClick={() => fileInputs.current[index]?.click()}>
                  {uploading === index ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
                  {uploading === index ? t.notes.uploading : `${t.notes.addImage} / ${t.notes.addAudio}`}
                </Button>
              </div>
              <MediaStrip value={values[index] ?? ""} removeLabel={t.notes.removeMedia} onRemove={(tag) => setField(index, (values[index] ?? "").replace(tag, ""))} />
            </div>
          </Field>
        ))}
        <p className="-mt-2 text-xs text-muted-foreground">{t.notes.mediaHint}</p>
        <Field label={t.notes.tags} htmlFor="tags" hint={t.notes.tagsHint}>
          <Input id="tags" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} autoComplete="off" />
        </Field>
      </div>

      <section className="flex flex-col gap-2" aria-label={t.notes.preview}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">{t.notes.preview}</p>
          <div className="flex items-center gap-2">
            {noteType.kind === "STANDARD" && noteType.templates.length > 1 ? (
              <Select value={String(templateIndex)} onChange={(event) => setTemplateIndex(Number(event.target.value))} className="h-8 w-auto text-xs" aria-label={t.notes.noteType}>
                {noteType.templates.map((template, index) => (
                  <option key={template.name + index} value={index}>
                    {template.name}
                  </option>
                ))}
              </Select>
            ) : null}
            <div className="flex rounded-lg border bg-muted/60 p-0.5 text-xs">
              {(["question", "answer"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSide(value)}
                  aria-pressed={side === value}
                  className={cn("rounded-md px-2.5 py-1 font-medium transition-colors", side === value ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  {value === "question" ? t.notes.previewFront : t.notes.previewBack}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex max-h-[28rem] min-h-40 flex-col overflow-y-auto rounded-xl border bg-card">
          {preview && hasContent ? (
            <CardFrame
              key={`${side}-${preview.ord}`}
              html={side === "question" ? preview.question : preview.answer}
              css={preview.css}
              ord={preview.ord}
              side={side}
              autoplay={NO_AUDIO}
            />
          ) : (
            <p className="m-auto p-6 text-sm text-muted-foreground">{t.notes.previewEmpty}</p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {mode === "edit" && noteId ? (
          <Button
            type="button"
            variant="ghost"
            className="text-danger"
            onClick={() => setConfirmingDelete(true)}
          >
            {t.notes.deleteNote}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {returnTo ? (
            <Button type="button" variant="ghost" onClick={() => router.push(returnTo)}>
              {t.common.cancel}
            </Button>
          ) : null}
          <Button type="submit" loading={pending} disabled={uploading !== null}>
            {mode === "create" ? t.notes.add : t.common.save}
          </Button>
        </div>
      </div>
      {mode === "edit" && noteId ? (
        <ConfirmDialog
          open={confirmingDelete}
          onClose={() => setConfirmingDelete(false)}
          onConfirm={() => deleteNoteAndRedirect(noteId, returnTo ?? "/browse")}
          title={t.notes.deleteTitle}
          description={t.notes.deleteDescription}
          confirmLabel={t.notes.deleteNote}
        />
      ) : null}
    </form>
  );
}
