"use client";

import { useCallback, useEffect, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const SHEET_MEDIA = "(max-width: 47.99rem)";
const ring = "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring aria-expanded:border-accent aria-expanded:ring-2 aria-expanded:ring-ring";

export const triggerVariants = {
  field: cn("h-10 w-full gap-2 border bg-card px-3 text-base sm:text-sm", ring),
  compact: cn("h-8 gap-1.5 border bg-card pl-2.5 pr-2 text-xs", ring),
  ghost: "h-9 gap-1.5 px-3 text-sm font-medium hover:bg-muted aria-expanded:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
};

export const triggerBase =
  "inline-flex min-w-0 items-center justify-between rounded-lg text-left text-foreground outline-none transition-[box-shadow,background-color] disabled:cursor-not-allowed disabled:opacity-60";

export function isSheet() {
  return window.matchMedia(SHEET_MEDIA).matches;
}

export function reveal(list: HTMLElement, item: HTMLElement, center = false) {
  if (center) list.scrollTop = item.offsetTop - (list.clientHeight - item.offsetHeight) / 2;
  else if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
  else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
}

export function closePopover(pop: HTMLElement | null, anchor: HTMLElement | null) {
  if (pop?.matches(":popover-open")) pop.hidePopover();
  anchor?.focus({ preventScroll: true });
}

interface PopoverProps {
  id: string;
  popRef: RefObject<HTMLDivElement | null>;
  anchorRef: RefObject<HTMLButtonElement | null>;
  label?: string;
  align?: "left" | "right";
  height?: number;
  onOpenChange: (open: boolean) => void;
  onOpened?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  className?: string;
  children: ReactNode;
}

export function Popover({ id, popRef, anchorRef, label, align = "left", height = 320, onOpenChange, onOpened, onKeyDown, className, children }: PopoverProps) {
  const t = useMessages().common;
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [title, setTitle] = useState(label ?? "");

  const place = useCallback(() => {
    const anchor = anchorRef.current?.getBoundingClientRect();
    const style = popRef.current?.style;
    if (!anchor || !style) return;
    const viewport = window.visualViewport;
    const below = window.innerHeight - anchor.bottom - 14;
    const above = anchor.top - 14;
    const up = below < height && above > below;
    const vars: Record<string, string> = {
      "viewport-top": `${viewport?.offsetTop ?? 0}px`,
      "viewport-height": `${viewport?.height ?? window.innerHeight}px`,
      top: up ? "auto" : `${anchor.bottom + 6}px`,
      bottom: up ? `${window.innerHeight - anchor.top + 6}px` : "auto",
      left: align === "left" ? `${anchor.left}px` : "auto",
      right: align === "right" ? `${window.innerWidth - anchor.right}px` : "auto",
      width: `${anchor.width}px`,
      "max-width": `${(align === "left" ? window.innerWidth - anchor.left : anchor.right) - 8}px`,
      "max-height": `${Math.min(height, up ? above : below)}px`,
      origin: up ? "bottom" : "top",
    };
    for (const [key, setting] of Object.entries(vars)) style.setProperty(`--select-${key}`, setting);
  }, [anchorRef, popRef, align, height]);

  useEffect(() => {
    if (!open) return;
    const viewport = window.visualViewport;
    const onScroll = (event: Event) => {
      if (!popRef.current?.contains(event.target as Node)) place();
    };
    const previous = document.body.style.overflow;
    if (sheet) document.body.style.overflow = "hidden";
    window.addEventListener("resize", place);
    document.addEventListener("scroll", onScroll, true);
    viewport?.addEventListener("resize", place);
    viewport?.addEventListener("scroll", place);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("resize", place);
      document.removeEventListener("scroll", onScroll, true);
      viewport?.removeEventListener("resize", place);
      viewport?.removeEventListener("scroll", place);
    };
  }, [open, sheet, place, popRef]);

  const close = () => closePopover(popRef.current, anchorRef.current);

  return (
    <div
      ref={popRef}
      id={id}
      popover="auto"
      onBeforeToggle={(event) => {
        if (event.newState !== "open") return;
        place();
        setSheet(isSheet());
        setTitle(label ?? anchorRef.current?.labels?.[0]?.textContent ?? "");
        setOpen(true);
        onOpenChange(true);
        if (onOpened) requestAnimationFrame(onOpened);
      }}
      onToggle={(event) => {
        if (event.newState === "open") return;
        setOpen(false);
        onOpenChange(false);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        onKeyDown?.(event);
        if (event.defaultPrevented || event.key !== "Escape") return;
        event.preventDefault();
        close();
      }}
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null;
        if (next && !event.currentTarget.contains(next) && next !== anchorRef.current && event.currentTarget.matches(":popover-open")) event.currentTarget.hidePopover();
      }}
      onClick={(event) => event.preventDefault()}
      className="select-pop"
    >
      <button type="button" tabIndex={-1} aria-hidden onClick={close} className="animate-in absolute inset-0 bg-black/40 backdrop-blur-[2px] md:hidden" />
      <div
        className={cn(
          "select-panel relative flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card text-foreground shadow-lg max-md:max-h-[85%] max-md:rounded-b-none max-md:rounded-t-2xl max-md:border-x-0 max-md:border-b-0 max-md:pb-[max(0.5rem,var(--safe-bottom))] max-md:shadow-2xl",
          className,
        )}
      >
        <div className="relative flex items-center justify-between gap-3 px-4 pb-2 pt-6 md:hidden">
          <span aria-hidden className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-border" />
          <p className="min-w-0 truncate text-base font-semibold">{title}</p>
          <button
            type="button"
            onClick={close}
            aria-label={t.close}
            className="-mr-1.5 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
