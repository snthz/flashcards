"use client";

import { useRef, useState, useTransition, type DragEvent } from "react";
import Image from "next/image";
import { ImagePlus, Link2, Loader2, PlaySquare, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { useMessages } from "@/lib/i18n/client";
import { saveAgendaNote } from "@/lib/agenda/actions";
import { normalizeLink, youtubeId } from "@/lib/agenda/media";
import { MAX_IMAGES, MAX_LINKS, type AgendaNoteData } from "@/lib/agenda/types";
import { mediaUrl, uploadMedia } from "@/lib/notes/media-client";
import { cn } from "@/lib/utils";

export interface NoteDraft {
  id: string | null;
  day: string;
  title: string;
  body: string;
  links: string[];
  images: string[];
}

export function emptyNote(day: string): NoteDraft {
  return { id: null, day, title: "", body: "", links: [], images: [] };
}

export function NoteDialog({ draft, dayLabel, onClose, onSaved }: { draft: NoteDraft | null; dayLabel: string; onClose: () => void; onSaved: (note: AgendaNoteData) => void }) {
  const t = useMessages().agenda;
  return (
    <Dialog open={draft !== null} onClose={onClose} title={draft?.id ? t.note.editTitle : t.note.newTitle} description={dayLabel} className="max-h-[92dvh] max-w-lg overflow-y-auto">
      {draft ? <NoteForm key={draft.id ?? `new-${draft.day}`} draft={draft} onClose={onClose} onSaved={onSaved} /> : null}
    </Dialog>
  );
}

function NoteForm({ draft, onClose, onSaved }: { draft: NoteDraft; onClose: () => void; onSaved: (note: AgendaNoteData) => void }) {
  const messages = useMessages();
  const t = messages.agenda;
  const [title, setTitle] = useState(draft.title);
  const [body, setBody] = useState(draft.body);
  const [links, setLinks] = useState(draft.links);
  const [images, setImages] = useState(draft.images);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const addLink = () => {
    const normalized = normalizeLink(link);
    if (!normalized) {
      setLinkError(Boolean(link.trim()));
      return;
    }
    setLinks((current) => (current.includes(normalized) ? current : [...current, normalized].slice(0, MAX_LINKS)));
    setLink("");
    setLinkError(false);
  };

  const upload = async (files: File[]) => {
    const accepted = files.filter((file) => file.type.startsWith("image/")).slice(0, MAX_IMAGES - images.length);
    if (accepted.length === 0) return;
    setUploading((value) => value + accepted.length);
    setError(null);
    await Promise.all(
      accepted.map(async (file) => {
        const result = await uploadMedia(file);
        setUploading((value) => value - 1);
        if ("error" in result || result.kind !== "image") {
          setError(t.note.uploadFailed);
          return;
        }
        setImages((current) => (current.includes(result.name) ? current : [...current, result.name].slice(0, MAX_IMAGES)));
      }),
    );
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void upload(Array.from(event.dataTransfer.files));
  };

  const save = () =>
    startTransition(async () => {
      setError(null);
      const pendingLink = normalizeLink(link);
      const result = await saveAgendaNote({
        id: draft.id,
        day: draft.day,
        title: title.trim(),
        body,
        links: pendingLink && !links.includes(pendingLink) ? [...links, pendingLink] : links,
        images,
      }).catch(() => null);
      if (!result) return setError(t.saveFailed);
      if (!result.ok) return setError(result.error === "empty" ? t.note.empty : t.saveFailed);
      onSaved(result.data);
    });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Field label={t.note.name} htmlFor="agenda-note-title">
        <Input id="agenda-note-title" value={title} maxLength={120} placeholder={t.note.namePlaceholder} onChange={(event) => setTitle(event.target.value)} autoFocus />
      </Field>
      <Field label={t.note.body} htmlFor="agenda-note-body">
        <Textarea id="agenda-note-body" value={body} rows={6} maxLength={20_000} placeholder={t.note.bodyPlaceholder} onChange={(event) => setBody(event.target.value)} className="resize-y" />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t.note.links}</span>
        <div className="flex gap-2">
          <Input
            value={link}
            inputMode="url"
            placeholder={t.note.linkPlaceholder}
            aria-label={t.note.links}
            onChange={(event) => {
              setLink(event.target.value);
              setLinkError(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addLink();
              }
            }}
            className="min-w-0 flex-1"
          />
          <Button variant="outline" onClick={addLink} disabled={!link.trim() || links.length >= MAX_LINKS}>
            {t.note.addLink}
          </Button>
        </div>
        {linkError ? <p className="text-xs text-danger">{t.note.invalidLink}</p> : null}
        {links.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {links.map((value) => {
              const video = youtubeId(value);
              return (
                <li key={value} className="flex items-center gap-2 rounded-lg border bg-muted/40 px-2.5 py-1.5 text-sm">
                  {video ? <PlaySquare className="size-4 shrink-0 text-danger" /> : <Link2 className="size-4 shrink-0 text-muted-foreground" />}
                  <span className="min-w-0 flex-1 truncate">{value}</span>
                  <button type="button" onClick={() => setLinks((current) => current.filter((item) => item !== value))} aria-label={t.note.remove} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t.note.images}</span>
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn("flex flex-col gap-3 rounded-xl border border-dashed p-3 transition-colors", dragging && "border-foreground/40 bg-muted/60")}
        >
          {images.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {images.map((name) => (
                <div key={name} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  <Image src={mediaUrl(name)} alt="" fill unoptimized sizes="6rem" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((current) => current.filter((item) => item !== name))}
                    aria-label={t.note.remove}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-100 transition-opacity hover:bg-black/80 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={images.length >= MAX_IMAGES}>
              {uploading > 0 ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
              {uploading > 0 ? t.note.uploading : t.note.addImages}
            </Button>
            <span className="hidden sm:inline">{t.note.dropImages}</span>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              void upload(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
        </div>
      </div>

      <FormError message={error} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          {messages.common.cancel}
        </Button>
        <Button type="submit" loading={pending} disabled={uploading > 0}>
          {t.note.save}
        </Button>
      </div>
    </form>
  );
}
