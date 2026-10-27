"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { closePopover, isSheet, Popover, reveal, triggerBase, triggerVariants } from "./popover";

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
  variant?: keyof typeof triggerVariants;
  align?: "left" | "right";
  className?: string;
}

const SEARCH_FROM = 10;

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
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

  const choose = (next: T) => {
    closePopover(pop.current, trigger.current);
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
    (searchable && !isSheet() ? search.current : list.current)?.focus({ preventScroll: true });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    const inList = event.target === list.current;
    if (key === "Tab") {
      event.preventDefault();
      closePopover(pop.current, trigger.current);
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
        className={cn(triggerBase, triggerVariants[variant], className)}
      >
        <span className={cn("min-w-0 truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      <Popover
        id={popId}
        popRef={pop}
        anchorRef={trigger}
        label={label}
        align={align}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setActive(Math.max(0, options.findIndex((option) => option.value === current)));
          else setQuery("");
        }}
        onOpened={settle}
        onKeyDown={onKeyDown}
      >
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
          aria-label={label}
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
      </Popover>
      {name ? <input type="hidden" name={name} value={current ?? ""} /> : null}
    </>
  );
}
