"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, MoreHorizontal, Pencil, Play, Trash2, X } from "lucide-react";
import { Menu, MenuItem } from "@/components/ui/menu";
import { Modal } from "@/components/ui/dialog";
import { RichText } from "@/components/grammar/rich-text";
import { useMessages } from "@/lib/i18n/client";
import { youtubeId, youtubeStart } from "@/lib/agenda/media";
import type { AgendaNoteData } from "@/lib/agenda/types";
import { mediaUrl } from "@/lib/notes/media-client";

function hostname(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}

function YouTube({ link, id }: { link: string; id: string }) {
  const t = useMessages().agenda;
  const [playing, setPlaying] = useState(false);
  const start = youtubeStart(link);
  if (playing) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl border bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${start ? `&start=${start}` : ""}`}
          title={t.playVideo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={t.playVideo}
      className="group relative aspect-video w-full overflow-hidden rounded-xl border bg-muted"
    >
      <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill unoptimized sizes="(min-width: 1024px) 22rem, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
      <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
        <span className="flex size-14 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition-transform group-hover:scale-105">
          <Play className="ml-0.5 size-6 fill-current" />
        </span>
      </span>
    </button>
  );
}

export function NoteCard({ note, onEdit, onDelete }: { note: AgendaNoteData; onEdit: () => void; onDelete: () => void }) {
  const messages = useMessages();
  const t = messages.agenda;
  const close = messages.common.close;
  const [viewing, setViewing] = useState<string | null>(null);
  const videos = note.links.flatMap((link) => {
    const id = youtubeId(link);
    return id ? [{ link, id }] : [];
  });
  const others = note.links.filter((link) => !youtubeId(link));

  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-4 animate-in">
      <header className="flex items-start gap-2">
        <h4 className="min-w-0 flex-1 text-sm font-semibold leading-snug">{note.title || t.notes}</h4>
        <Menu
          label={t.edit}
          contentClassName="w-40"
          trigger={
            <span className="-mr-1 -mt-1 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <MoreHorizontal className="size-4" />
            </span>
          }
        >
          <MenuItem icon={<Pencil />} onSelect={onEdit}>
            {t.edit}
          </MenuItem>
          <MenuItem icon={<Trash2 />} tone="danger" onSelect={onDelete}>
            {t.delete}
          </MenuItem>
        </Menu>
      </header>
      {note.body ? <RichText text={note.body} className="text-sm" /> : null}
      {videos.map(({ link, id }) => (
        <YouTube key={link} link={link} id={id} />
      ))}
      {others.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {others.map((link) => (
            <li key={link}>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                title={t.openLink}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <ExternalLink className="size-3 shrink-0" />
                <span className="truncate">{hostname(link)}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {note.images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {note.images.map((name) => (
            <button key={name} type="button" onClick={() => setViewing(name)} aria-label={t.openImage} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <Image src={mediaUrl(name)} alt="" fill unoptimized sizes="8rem" className="object-cover transition-transform duration-300 hover:scale-105" />
            </button>
          ))}
        </div>
      ) : null}
      <Modal open={viewing !== null} onClose={() => setViewing(null)} className="max-w-3xl overflow-hidden bg-black p-0">
        {viewing ? (
          <div className="relative" onClick={(event) => event.stopPropagation()}>
            <Image src={mediaUrl(viewing)} alt="" width={1600} height={1200} unoptimized className="h-auto max-h-[85dvh] w-full object-contain" />
            <button type="button" onClick={() => setViewing(null)} aria-label={close} className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80">
              <X className="size-4" />
            </button>
          </div>
        ) : null}
      </Modal>
    </article>
  );
}
