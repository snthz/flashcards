"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Clock } from "lucide-react";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { closePopover, Popover, reveal, triggerBase, triggerVariants } from "./popover";

interface TimePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (time: string) => void;
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  step?: number;
  disabled?: boolean;
  align?: "left" | "right";
  className?: string;
}

type Column = "hour" | "minute";

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));

export function TimePicker({ value, defaultValue, onChange, id, name, label, placeholder = "--:--", step = 5, disabled, align = "left", className }: TimePickerProps) {
  const t = useMessages().common;
  const baseId = useId();
  const popId = `${baseId}-pop`;
  const trigger = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const current = value ?? internal;
  const [hour = "", minute = ""] = current ? current.split(":") : [];
  const steps = Array.from({ length: Math.ceil(60 / step) }, (_, index) => String(index * step).padStart(2, "0"));
  const minutes = minute && !steps.includes(minute) ? [...steps, minute].sort() : steps;
  const columns: Array<{ key: Column; label: string; items: string[]; chosen: string }> = [
    { key: "hour", label: t.hours, items: HOURS, chosen: hour },
    { key: "minute", label: t.minutes, items: minutes, chosen: minute },
  ];

  const option = (column: Column, item: string) => document.getElementById(`${baseId}-${column}-${item}`);

  const focusColumn = (column: Column) => {
    const entry = columns.find((candidate) => candidate.key === column);
    if (entry) option(column, entry.chosen || entry.items[0])?.focus({ preventScroll: true });
  };

  const commit = (next: string, done: boolean) => {
    if (done) closePopover(pop.current, trigger.current);
    if (value === undefined) setInternal(next);
    if (next !== current) onChange?.(next);
  };

  const pick = (column: Column, item: string) => {
    if (column === "minute") return commit(`${hour || "12"}:${item}`, true);
    commit(`${item}:${minute || "00"}`, false);
    focusColumn("minute");
  };

  const settle = () => {
    const popover = pop.current;
    if (!popover?.matches(":popover-open") || popover.contains(document.activeElement)) return;
    for (const { key, chosen } of columns) {
      const item = chosen ? option(key, chosen) : null;
      if (item?.parentElement) reveal(item.parentElement, item, true);
    }
    focusColumn("hour");
  };

  const onColumnKey = (event: KeyboardEvent<HTMLDivElement>, column: Column) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      focusColumn(column === "hour" ? "minute" : "hour");
      return;
    }
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="option"]')];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const item = items[Math.max(0, Math.min(items.length - 1, moves[event.key]))];
    if (!item) return;
    item.focus({ preventScroll: true });
    reveal(event.currentTarget, item);
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
          if (open || event.key !== "ArrowDown") return;
          event.preventDefault();
          pop.current?.showPopover();
          settle();
        }}
        className={cn(triggerBase, triggerVariants.field, className)}
      >
        <span className={cn("min-w-0 truncate tabular-nums", !current && "text-muted-foreground")}>{current || placeholder}</span>
        <Clock aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </button>
      <Popover id={popId} popRef={pop} anchorRef={trigger} label={label} align={align} height={300} onOpenChange={setOpen} onOpened={settle}>
        <div className="flex min-h-0 gap-1 p-1.5 max-md:gap-3 max-md:px-4 max-md:pt-0">
          {columns.map((column) => (
            <div key={column.key} className="flex min-h-0 min-w-16 flex-1 flex-col">
              <span aria-hidden className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {column.label}
              </span>
              <div
                role="listbox"
                aria-label={column.label}
                onKeyDown={(event) => onColumnKey(event, column.key)}
                className="relative h-56 overflow-y-auto overscroll-contain max-md:h-64"
              >
                {column.items.map((item) => {
                  const chosen = item === column.chosen;
                  return (
                    <button
                      key={item}
                      id={`${baseId}-${column.key}-${item}`}
                      type="button"
                      role="option"
                      aria-selected={chosen}
                      tabIndex={item === (column.chosen || column.items[0]) ? 0 : -1}
                      onClick={() => pick(column.key, item)}
                      className={cn(
                        "flex h-9 w-full items-center justify-center rounded-lg text-sm tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring max-md:h-11 max-md:text-base",
                        chosen ? "bg-foreground font-semibold text-background" : "hover:bg-muted",
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Popover>
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </>
  );
}
