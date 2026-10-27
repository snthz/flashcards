"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ToggleEvent } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  options: ReadonlyArray<SelectOption<T>>;
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: "field" | "compact" | "ghost";
  align?: "left" | "right";
  className?: string;
}

const SHEET_MEDIA = "(max-width: 47.99rem)";
const SEARCH_FROM = 10;
const ring = "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring aria-expanded:border-accent aria-expanded:ring-2 aria-expanded:ring-ring";

const variants = {
  field: cn("h-10 w-full gap-2 border bg-card px-3 text-base sm:text-sm", ring),
  compact: cn("h-8 gap-1.5 border bg-card pl-2.5 pr-2 text-xs", ring),
  ghost: "h-9 gap-1.5 px-3 text-sm font-medium hover:bg-muted aria-expanded:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
};

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function reveal(list: HTMLElement, item: HTMLElement, center = false) {
  if (center) list.scrollTop = item.offsetTop - (list.clientHeight - item.offsetHeight) / 2;
  else if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
  else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
}

export function Select<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  id,
  name,
  label,
  placeholder,
  disabled,
  variant = "field",
  align = "left",
  className,
}: SelectProps<T>) {
  const t = useMessages().common;
  const baseId = useId();
  const popId = `${baseId}-pop`;
  const trigger = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [title, setTitle] = useState(label ?? "");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const current = value ?? internal;
  const selected = options.find((option) => option.value === current);
  const searchable = options.length > SEARCH_FROM;
  const needle = normalize(query.trim());
  const visible = options
    .map((option, index) => ({ option, key: `${baseId}-${index}` }))
    .filter(({ option }) => !needle || normalize(option.label).includes(needle));
  const activeKey = visible[active]?.key;

  const place = useCallback(() => {
    const anchor = trigger.current?.getBoundingClientRect();
    const style = pop.current?.style;
    if (!anchor || !style) return;
    const viewport = window.visualViewport;
    const below = window.innerHeight - anchor.bottom - 14;
    const above = anchor.top - 14;
    const up = below < 240 && above > below;
    const vars: Record<string, string> = {
      "viewport-top": `${viewport?.offsetTop ?? 0}px`,
      "viewport-height": `${viewport?.height ?? window.innerHeight}px`,
      top: up ? "auto" : `${anchor.bottom + 6}px`,
      bottom: up ? `${window.innerHeight - anchor.top + 6}px` : "auto",
      left: align === "left" ? `${anchor.left}px` : "auto",
      right: align === "right" ? `${window.innerWidth - anchor.right}px` : "auto",
      width: `${anchor.width}px`,
      "max-width": `${(align === "left" ? window.innerWidth - anchor.left : anchor.right) - 8}px`,
      "max-height": `${Math.min(320, up ? above : below)}px`,
      origin: up ? "bottom" : "top",
    };
    for (const [key, setting] of Object.entries(vars)) style.setProperty(`--select-${key}`, setting);
  }, [align]);

  useEffect(() => {
    if (!open) return;
    const viewport = window.visualViewport;
    const onScroll = (event: Event) => {
      if (!pop.current?.contains(event.target as Node)) place();
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
  }, [open, sheet, place]);

  const close = () => {
    if (pop.current?.matches(":popover-open")) pop.current.hidePopover();
    trigger.current?.focus({ preventScroll: true });
  };

  const choose = (next: T) => {
    close();
    if (value === undefined) setInternal(next);
    if (next !== current) onChange?.(next);
  };

  const move = (next: number) => {
    const index = Math.max(0, Math.min(visible.length - 1, next));
    setActive(index);
    const item = visible[index] && document.getElementById(visible[index].key);
    if (item && list.current) reveal(list.current, item);
  };

  const settle = () => {
    const popover = pop.current;
    if (!popover?.matches(":popover-open") || popover.contains(document.activeElement)) return;
    const item = document.getElementById(`${baseId}-${Math.max(0, options.findIndex((option) => option.value === current))}`);
    if (item && list.current) reveal(list.current, item, true);
    (searchable && !window.matchMedia(SHEET_MEDIA).matches ? search.current : list.current)?.focus({ preventScroll: true });
  };

  const onBeforeToggle = (event: ToggleEvent<HTMLDivElement>) => {
    if (event.newState !== "open") return;
    place();
    setSheet(window.matchMedia(SHEET_MEDIA).matches);
    setTitle(label ?? trigger.current?.labels?.[0]?.textContent ?? "");
    setActive(Math.max(0, options.findIndex((option) => option.value === current)));
    setOpen(true);
    requestAnimationFrame(settle);
  };

  const onToggle = (event: ToggleEvent<HTMLDivElement>) => {
    if (event.newState === "open") return;
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const { key } = event;
    const inList = event.target === list.current;
    if (key === "Escape" || key === "Tab") {
      event.preventDefault();
      close();
      return;
    }
    const moves: Record<string, number> = { ArrowDown: active + 1, ArrowUp: active - 1, PageDown: active + 8, PageUp: active - 8 };
    if (inList) Object.assign(moves, { Home: 0, End: visible.length - 1 });
    if (key in moves) {
      event.preventDefault();
      move(moves[key]);
      return;
    }
    if (key === "Enter" || (key === " " && inList)) {
      event.preventDefault();
      const entry = visible[active];
      if (entry) choose(entry.option.value);
      return;
    }
    if (!inList || key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    const fresh = event.timeStamp - typed.current.at > 700;
    const text = (fresh ? "" : typed.current.text) + normalize(key);
    typed.current = { text, at: event.timeStamp };
    const start = text.length === 1 ? active + 1 : active;
    const match = [...visible.keys()].map((step) => (start + step) % visible.length).find((index) => normalize(visible[index].option.label).startsWith(text));
    if (match !== undefined) move(match);
  };

  return (
    <>
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={popId}
        popoverTarget={popId}
        disabled={disabled}
        onKeyDown={(event) => {
          if (open || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
          event.preventDefault();
          pop.current?.showPopover();
          settle();
        }}
        className={cn(
          "inline-flex min-w-0 items-center justify-between rounded-lg text-left text-foreground outline-none transition-[box-shadow,background-color] disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          className,
        )}
      >
        <span className={cn("min-w-0 truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div
        ref={pop}
        id={popId}
        popover="auto"
        onBeforeToggle={onBeforeToggle}
        onToggle={onToggle}
        onKeyDown={onKeyDown}
        onClick={(event) => event.preventDefault()}
        className="select-pop"
      >
        <button type="button" tabIndex={-1} aria-hidden onClick={close} className="animate-in absolute inset-0 bg-black/40 backdrop-blur-[2px] md:hidden" />
        <div className="select-panel relative flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card text-foreground shadow-lg max-md:max-h-[85%] max-md:rounded-b-none max-md:rounded-t-2xl max-md:border-x-0 max-md:border-b-0 max-md:pb-[max(0.5rem,var(--safe-bottom))] max-md:shadow-2xl">
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
          {searchable ? (
            <div className="p-1 pb-0 max-md:px-3 max-md:pb-1">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5 text-muted-foreground">
                <Search aria-hidden className="size-4 shrink-0" />
                <input
                  ref={search}
                  type="search"
                  role="combobox"
                  aria-label={t.search}
                  aria-expanded
                  aria-controls={`${baseId}-list`}
                  aria-autocomplete="list"
                  aria-activedescendant={activeKey}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                    if (list.current) list.current.scrollTop = 0;
                  }}
                  placeholder={t.search}
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-9 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-sm max-md:h-10 [&::-webkit-search-cancel-button]:hidden"
                />
              </div>
            </div>
          ) : null}
          <div
            ref={list}
            id={`${baseId}-list`}
            role="listbox"
            tabIndex={-1}
            aria-label={title || label}
            aria-activedescendant={activeKey}
            className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 outline-none max-md:px-2"
          >
            {visible.map(({ option, key }, index) => {
              const chosen = option.value === current;
              return (
                <button
                  key={key}
                  id={key}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={chosen}
                  data-active={index === active || undefined}
                  onPointerMove={(event) => {
                    if (event.pointerType === "mouse" && index !== active) setActive(index);
                  }}
                  onClick={() => choose(option.value)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm outline-none transition-colors data-active:bg-muted max-md:rounded-lg max-md:px-3 max-md:py-3 max-md:text-base",
                    chosen && "font-medium",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {chosen ? <Check aria-hidden className="size-4 shrink-0" /> : null}
                </button>
              );
            })}
            {visible.length === 0 ? <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t.noResults}</p> : null}
          </div>
        </div>
      </div>
      {name ? <input type="hidden" name={name} value={current ?? ""} /> : null}
    </>
  );
}
