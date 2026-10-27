"use client";

import { useEffect, useLayoutEffect, useRef, useState, type DragEvent, type KeyboardEvent, type RefObject } from "react";
import Image from "next/image";
import { ChevronLeft, ImagePlus, Link2, List, Loader2, PlaySquare, Trash2, X } from "lucide-react";
import { ConfirmDialog, Modal, SheetHandle } from "@/components/ui/dialog";
import { useMessages } from "@/lib/i18n/client";
import { deleteAgendaNote, saveAgendaNote } from "@/lib/agenda/actions";
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

function useAutosize(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }, [ref, value]);
}

function hostname(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}

export function NoteDialog({
  draft,
  dayLabel,
  onClose,
  onSaved,
}: {
  draft: NoteDraft | null;
  dayLabel: string;
  onClose: () => void;
  onSaved: (note: AgendaNoteData | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const finish = useRef<() => void>(() => onClose());
  return (
    <Modal
      open={draft !== null}
      onClose={onClose}
      onDismiss={() => finish.current()}
      locked={busy}
      sheet
      className="modal-full h-[min(780px,90dvh)] max-w-2xl flex-col overflow-hidden bg-card open:flex"
    >
      {draft ? <NoteEditor key={draft.id ?? `new-${draft.day}`} draft={draft} dayLabel={dayLabel} finishRef={finish} onBusy={setBusy} onClose={onClose} onSaved={onSaved} /> : null}
    </Modal>
  );
}

function NoteEditor({
  draft,
  dayLabel,
  finishRef,
  onBusy,
  onClose,
  onSaved,
}: {
  draft: NoteDraft;
  dayLabel: string;
  finishRef: { current: () => void };
  onBusy: (busy: boolean) => void;
  onClose: () => void;
  onSaved: (note: AgendaNoteData | null) => void;
}) {
  const t = useMessages().agenda;
  const [title, setTitle] = useState(draft.title);
  const [body, setBody] = useState(draft.body);
  const [links, setLinks] = useState(draft.links);
  const [images, setImages] = useState(draft.images);
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  useAutosize(titleRef, title);
  useAutosize(bodyRef, body);

  useLayoutEffect(() => {
    if (caret.current === null || !bodyRef.current) return;
    bodyRef.current.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [body]);

  const writeBody = (next: string, position: number) => {
    caret.current = position;
    setBody(next);
  };

  const empty = !title.trim() && !body.trim() && links.length === 0 && images.length === 0;
  const changed = title !== draft.title || body !== draft.body || links.join("\n") !== draft.links.join("\n") || images.join("\n") !== draft.images.join("\n");

  const finish = async () => {
    if (saving || uploading > 0) return;
    if (!changed) return onClose();
    setSaving(true);
    onBusy(true);
    setError(null);
    try {
      if (empty) {
        if (draft.id) await deleteAgendaNote(draft.id);
        onSaved(null);
        return;
      }
      const result = await saveAgendaNote({ id: draft.id, day: draft.day, title: title.trim(), body, links, images });
      if (!result.ok) {
        setError(t.saveFailed);
        return;
      }
      onSaved(result.data);
    } catch {
      setError(t.saveFailed);
    } finally {
      setSaving(false);
      onBusy(false);
    }
  };

  useEffect(() => {
    finishRef.current = () => void finish();
  });

  useEffect(() => {
    const timer = window.setTimeout(() => (draft.id ? bodyRef : titleRef).current?.focus({ preventScroll: true }), 120);
    return () => window.clearTimeout(timer);
  }, [draft.id]);

  const addLink = () => {
    const normalized = normalizeLink(link);
    if (!normalized) {
      setLinkError(Boolean(link.trim()));
      return;
    }
    setLinks((current) => (current.includes(normalized) ? current : [...current, normalized].slice(0, MAX_LINKS)));
    setLink("");
    setLinkError(false);
    setLinkOpen(false);
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

  const insertBullet = () => {
    const node = bodyRef.current;
    if (!node) return;
    const position = document.activeElement === node ? node.selectionStart : body.length;
    const lineStart = body.lastIndexOf("\n", position - 1) + 1;
    const next = body.startsWith("- ", lineStart) ? body.slice(0, lineStart) + body.slice(lineStart + 2) : `${body.slice(0, lineStart)}- ${body.slice(lineStart)}`;
    node.focus();
    writeBody(next, position + next.length - body.length);
  };

  const continueList = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    const node = event.currentTarget;
    const position = node.selectionStart;
    const lineStart = body.lastIndexOf("\n", position - 1) + 1;
    const line = body.slice(lineStart, position);
    const bullet = line.match(/^(\s*)([-*•]|\d+[.)])\s/);
    if (!bullet) return;
    event.preventDefault();
    if (line.trim() === bullet[0].trim()) {
      writeBody(body.slice(0, lineStart) + body.slice(position), lineStart);
      return;
    }
    const marker = /\d/.test(bullet[2]) ? `${Number.parseInt(bullet[2], 10) + 1}${bullet[2].slice(-1)}` : bullet[2];
    const insert = `\n${bullet[1]}${marker} `;
    writeBody(body.slice(0, position) + insert + body.slice(node.selectionEnd), position + insert.length);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void upload(Array.from(event.dataTransfer.files));
  };

  const toolButton = "flex size-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40";

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onClick={(event) => event.stopPropagation()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <SheetHandle />
      <header className="flex items-center justify-between gap-2 px-2 pb-1 pt-1 md:pt-3">
        <button type="button" onClick={() => void finish()} className="flex items-center gap-0.5 rounded-full px-2 py-1.5 text-[15px] font-medium text-foreground hover:bg-muted">
          <ChevronLeft className="size-5" />
          {t.notes}
        </button>
        <button
          type="button"
          onClick={() => void finish()}
          disabled={saving || uploading > 0}
          className="flex min-w-16 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[15px] font-semibold text-foreground hover:bg-muted disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          {t.note.done}
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 sm:px-10">
        <p className="pb-4 pt-1 text-center text-xs text-muted-foreground">{dayLabel}</p>
        <textarea
          ref={titleRef}
          value={title}
          rows={1}
          maxLength={120}
          placeholder={t.note.titlePlaceholder}
          aria-label={t.note.name}
          onChange={(event) => setTitle(event.target.value.replace(/\n/g, " "))}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              bodyRef.current?.focus();
              bodyRef.current?.setSelectionRange(0, 0);
            }
          }}
          className="w-full resize-none overflow-hidden bg-transparent text-[26px] font-bold leading-tight tracking-tight placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <textarea
          ref={bodyRef}
          value={body}
          maxLength={20_000}
          placeholder={t.note.writePlaceholder}
          aria-label={t.note.body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={continueList}
          className="mt-2 min-h-[30dvh] w-full resize-none overflow-hidden bg-transparent text-[17px] leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none"
        />

        {links.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {links.map((value) => {
              const video = youtubeId(value);
              return (
                <li key={value} className="group flex items-center gap-3 rounded-xl border bg-background/60 p-2 pr-3">
                  {video ? (
                    <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={`https://i.ytimg.com/vi/${video}/mqdefault.jpg`} alt="" fill unoptimized sizes="5rem" className="object-cover" />
                      <PlaySquare className="absolute bottom-1 right-1 size-4 text-white drop-shadow" />
                    </span>
                  ) : (
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Link2 className="size-5" />
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{video ? "YouTube" : hostname(value)}</span>
                    <span className="truncate text-xs text-muted-foreground">{value}</span>
                  </span>
                  <button type="button" onClick={() => setLinks((current) => current.filter((item) => item !== value))} aria-label={t.note.remove} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {images.length > 0 || uploading > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((name) => (
              <div key={name} className="group relative aspect-square overflow-hidden rounded-xl border bg-muted">
                <Image src={mediaUrl(name)} alt="" fill unoptimized sizes="10rem" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((current) => current.filter((item) => item !== name))}
                  aria-label={t.note.remove}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-opacity hover:bg-black/80 md:opacity-0 md:group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            {Array.from({ length: uploading }, (_, index) => (
              <div key={`uploading-${index}`} className="flex aspect-square items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ))}
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>

      {linkOpen ? (
        <div className="flex flex-col gap-1 border-t bg-card px-3 py-2 animate-in">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
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
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  setLinkOpen(false);
                }
              }}
              className="h-10 min-w-0 flex-1 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none sm:text-sm"
            />
            <button type="button" onClick={addLink} disabled={!link.trim()} className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-40">
              {t.note.addLink}
            </button>
            <button type="button" onClick={() => setLinkOpen(false)} aria-label={t.note.closeLink} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>
          {linkError ? <p className="pl-6 text-xs text-danger">{t.note.invalidLink}</p> : null}
        </div>
      ) : null}

      <footer className="flex items-center gap-1 border-t px-3 py-1.5">
        <button type="button" onPointerDown={(event) => event.preventDefault()} onClick={insertBullet} aria-label={t.note.list} title={t.note.list} className={toolButton}>
          <List className="size-5" />
        </button>
        <button type="button" onClick={() => fileInput.current?.click()} disabled={images.length >= MAX_IMAGES} aria-label={t.note.image} title={t.note.image} className={toolButton}>
          <ImagePlus className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => setLinkOpen((value) => !value)}
          disabled={links.length >= MAX_LINKS}
          aria-label={t.note.link}
          title={t.note.link}
          aria-pressed={linkOpen}
          className={cn(toolButton, linkOpen && "bg-muted")}
        >
          <Link2 className="size-5" />
        </button>
        <span className="flex-1" />
        {draft.id ? (
          <button type="button" onClick={() => setConfirming(true)} aria-label={t.delete} title={t.delete} className={cn(toolButton, "text-danger hover:text-danger")}>
            <Trash2 className="size-5" />
          </button>
        ) : null}
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
      </footer>

      {dragging ? (
        <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-2xl border-2 border-dashed border-foreground/40 bg-card/80 text-sm font-medium backdrop-blur-sm">
          {t.note.dropImages}
        </div>
      ) : null}

      {draft.id ? (
        <ConfirmDialog
          open={confirming}
          onClose={() => setConfirming(false)}
          onConfirm={async () => {
            if (!draft.id) return;
            await deleteAgendaNote(draft.id);
            setConfirming(false);
            onSaved(null);
          }}
          title={t.note.deleteTitle}
          description={t.note.deleteDescription}
          confirmLabel={t.delete}
        />
      ) : null}
    </div>
  );
}
