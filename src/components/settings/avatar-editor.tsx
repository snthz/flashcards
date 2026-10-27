"use client";

import { useEffect, useRef, useState, useTransition, type CSSProperties, type Dispatch, type KeyboardEvent, type ReactNode, type SetStateAction } from "react";
import Image from "next/image";
import { ImagePlus, Pencil, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PresetAvatar, UserAvatar } from "@/components/ui/avatar";
import { chooseAvatar, uploadAvatar, type AvatarError, type AvatarResult } from "@/app/(app)/settings/actions";
import { AVATAR_PRESETS, AVATAR_SOURCE_MAX_BYTES, clampView, coverScale, cropRect, parseAvatar, type CropView } from "@/lib/avatar";
import { loadImage, renderAvatar } from "@/lib/avatar/optimize";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const VIEWPORT = 256;
const MAX_ZOOM = 4;
const NUDGE = 8;
const START: CropView = { zoom: 1, x: 0, y: 0 };

interface Source {
  bitmap: ImageBitmap;
  url: string;
}

export function AvatarEditor({ name, avatar }: { name: string; avatar: string | null }) {
  const t = useMessages().settings;
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSession((value) => value + 1);
          setOpen(true);
        }}
        aria-label={t.avatarEdit}
        title={t.avatarEdit}
        className="group relative shrink-0 rounded-full"
      >
        <UserAvatar name={name} avatar={avatar} className="size-20 text-2xl" />
        <span aria-hidden className="absolute inset-0 rounded-full bg-black/0 transition-colors group-hover:bg-black/15" />
        <span
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 flex size-8 items-center justify-center rounded-full border-[3px] border-card bg-accent text-accent-foreground shadow-sm transition-transform group-hover:scale-105"
        >
          <Pencil className="size-3.5" strokeWidth={2.2} />
        </span>
      </button>
      <AvatarDialog key={session} open={open} name={name} avatar={avatar} onClose={() => setOpen(false)} />
    </>
  );
}

function AvatarDialog({ open, name, avatar, onClose }: { open: boolean; name: string; avatar: string | null; onClose: () => void }) {
  const t = useMessages();
  const s = t.settings;
  const [draft, setDraft] = useState(avatar);
  const [source, setSource] = useState<Source | null>(null);
  const [view, setView] = useState(START);
  const [error, setError] = useState<AvatarError | null>(null);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const uploaded = parseAvatar(avatar)?.kind === "upload";

  useEffect(() => {
    if (!source) return;
    return () => {
      URL.revokeObjectURL(source.url);
      source.bitmap.close();
    };
  }, [source]);

  const pick = async (file: File | undefined) => {
    if (input.current) input.current.value = "";
    if (!file) return;
    setError(null);
    if (file.size > AVATAR_SOURCE_MAX_BYTES) return setError("too_large");
    const bitmap = await loadImage(file);
    if (!bitmap) return setError("unsupported");
    setView(START);
    setSource({ bitmap, url: URL.createObjectURL(file) });
  };

  const finish = (result: AvatarResult) => {
    if (result.ok) onClose();
    else setError(result.error);
  };

  const save = () =>
    startTransition(async () => {
      setError(null);
      if (!source) return finish(await chooseAvatar(draft));
      const blob = await renderAvatar(source.bitmap, cropRect(source.bitmap.width, source.bitmap.height, VIEWPORT, view));
      if (!blob) return setError("failed");
      const form = new FormData();
      form.set("file", new File([blob], blob.type === "image/webp" ? "avatar.webp" : "avatar.jpg", { type: blob.type }));
      finish(await uploadAvatar(form));
    });

  return (
    <Dialog open={open} onClose={onClose} title={s.avatarTitle} description={source ? s.avatarCropHint : s.avatarDescription}>
      {source ? (
        <Cropper source={source} view={view} onView={setView} />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <UserAvatar name={name} avatar={draft} className="size-24 text-3xl" />
          <Button variant="outline" size="sm" onClick={() => input.current?.click()} disabled={pending}>
            <ImagePlus className="size-4" />
            {s.avatarUpload}
          </Button>
          <div className="flex w-full flex-col gap-2.5 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">{s.avatarChoose}</p>
            <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-7">
              {uploaded ? (
                <Tile label={s.avatarCurrent} selected={draft === avatar} onSelect={() => setDraft(avatar)}>
                  <UserAvatar name={name} avatar={avatar} className="size-full" />
                </Tile>
              ) : null}
              <Tile label={s.avatarInitials} selected={draft === null} onSelect={() => setDraft(null)}>
                <UserAvatar name={name} className="size-full text-sm" />
              </Tile>
              {AVATAR_PRESETS.map((preset, index) => (
                <Tile key={preset} label={s.avatarPreset(index + 1)} selected={draft === `preset:${preset}`} onSelect={() => setDraft(`preset:${preset}`)}>
                  <PresetAvatar preset={preset} className="size-full" />
                </Tile>
              ))}
            </div>
          </div>
        </div>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={(event) => pick(event.target.files?.[0])} />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {s.avatarErrors[error]}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={source ? () => setSource(null) : onClose} disabled={pending}>
          {source ? s.avatarBack : t.common.cancel}
        </Button>
        <Button onClick={save} loading={pending} disabled={!source && draft === avatar}>
          {s.avatarSave}
        </Button>
      </div>
    </Dialog>
  );
}

function Tile({ label, selected, onSelect, children }: { label: string; selected: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "aspect-square rounded-full ring-offset-2 ring-offset-card transition-[box-shadow,transform] hover:scale-105",
        selected ? "ring-2 ring-foreground" : "hover:ring-2 hover:ring-border",
      )}
    >
      {children}
    </button>
  );
}

function Cropper({ source, view, onView }: { source: Source; view: CropView; onView: Dispatch<SetStateAction<CropView>> }) {
  const s = useMessages().settings;
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const { width, height } = source.bitmap;
  const scale = coverScale(width, height, VIEWPORT) * view.zoom;

  const update = (change: (current: CropView) => CropView) =>
    onView((current) => {
      const next = change(current);
      return clampView(width, height, VIEWPORT, { ...next, zoom: Math.min(MAX_ZOOM, Math.max(1, next.zoom)) });
    });

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      onView((current) => {
        const zoom = Math.min(MAX_ZOOM, Math.max(1, current.zoom * Math.exp(-event.deltaY * 0.0015)));
        return clampView(width, height, VIEWPORT, { ...current, zoom });
      });
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [onView, width, height]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = { ArrowLeft: [NUDGE, 0], ArrowRight: [-NUDGE, 0], ArrowUp: [0, NUDGE], ArrowDown: [0, -NUDGE] };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      update((current) => ({ ...current, x: current.x + move[0], y: current.y + move[1] }));
    } else if (event.key === "+" || event.key === "=" || event.key === "-") {
      event.preventDefault();
      update((current) => ({ ...current, zoom: current.zoom + (event.key === "-" ? -0.2 : 0.2) }));
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={frame}
        tabIndex={0}
        aria-label={s.avatarFrame}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { pointerX: event.clientX, pointerY: event.clientY, x: view.x, y: view.y };
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start) return;
          update((current) => ({ ...current, x: start.x + event.clientX - start.pointerX, y: start.y + event.clientY - start.pointerY }));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        className="relative size-64 shrink-0 cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-muted active:cursor-grabbing"
      >
        <Image
          src={source.url}
          alt=""
          width={width}
          height={height}
          unoptimized
          draggable={false}
          className="pointer-events-none absolute left-0 top-0 max-w-none"
          style={{
            width: width * scale,
            height: height * scale,
            transform: `translate(${(VIEWPORT - width * scale) / 2 + view.x}px, ${(VIEWPORT - height * scale) / 2 + view.y}px)`,
          }}
        />
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgb(0_0_0/0.5)] ring-2 ring-white/85" />
      </div>
      <label className="flex w-64 items-center gap-2 text-muted-foreground">
        <ZoomOut className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">{s.avatarZoom}</span>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={view.zoom}
          onChange={(event) => {
            const zoom = Number(event.target.value);
            update((current) => ({ ...current, zoom }));
          }}
          className="fc-range min-w-0 flex-1"
          style={{ "--fc-progress": `${((view.zoom - 1) / (MAX_ZOOM - 1)) * 100}%` } as CSSProperties}
        />
        <ZoomIn className="size-4 shrink-0" aria-hidden />
      </label>
    </div>
  );
}
