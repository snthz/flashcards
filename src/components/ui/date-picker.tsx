"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { addDays, monthGrid, shiftMonth, weekday } from "@/lib/agenda/time";
import { cn } from "@/lib/utils";
import { buttonStyles } from "./button";
import { closePopover, Popover, triggerBase, triggerVariants } from "./popover";

interface DatePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (day: string) => void;
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  today?: string;
  disabled?: boolean;
  align?: "left" | "right";
  className?: string;
}

const navButton =
  "flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring max-md:size-10 [&>svg]:size-4";

function localToday() {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((part) => String(part).padStart(2, "0")).join("-");
}

function shiftDay(day: string, months: number) {
  const month = shiftMonth(day.slice(0, 7), months);
  const last = Number(addDays(`${shiftMonth(month, 1)}-01`, -1).slice(8));
  return `${month}-${String(Math.min(Number(day.slice(8)), last)).padStart(2, "0")}`;
}

function formatter(locale: string, options: Intl.DateTimeFormatOptions) {
  const format = new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });
  return (day: string) => {
    const text = format.format(new Date(`${day}T00:00:00Z`));
    return text.charAt(0).toLocaleUpperCase() + text.slice(1);
  };
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  id,
  name,
  label,
  placeholder,
  min,
  max,
  today: fixedToday,
  disabled,
  align = "left",
  className,
}: DatePickerProps) {
  const { locale, t } = useI18n();
  const intl = intlLocale(locale);
  const weekStartsOn: 0 | 1 = locale === "en" ? 0 : 1;
  const isClient = useIsClient();
  const baseId = useId();
  const popId = `${baseId}-pop`;
  const trigger = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const [internal, setInternal] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const today = fixedToday ?? (isClient ? localToday() : "");
  const current = value ?? internal;
  const clamp = (day: string) => (min && day < min ? min : max && day > max ? max : day);
  const focusDay = cursor ?? clamp(current || today);
  const month = focusDay.slice(0, 7);
  const grid = useMemo(() => (month ? monthGrid(month, weekStartsOn) : []), [month, weekStartsOn]);
  const formats = useMemo(
    () => ({
      field: formatter(intl, { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
      long: formatter(intl, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      month: formatter(intl, { month: "long", year: "numeric" }),
      weekday: formatter(intl, { weekday: "short" }),
    }),
    [intl],
  );
  const monthTitle = month ? formats.month(`${month}-01`) : "";
  const blocked = (day: string) => Boolean((min && day < min) || (max && day > max));

  useLayoutEffect(() => {
    if (!moveFocus.current || !cursor) return;
    moveFocus.current = false;
    document.getElementById(`${baseId}-${cursor}`)?.focus({ preventScroll: true });
  }, [cursor, baseId]);

  const choose = (day: string) => {
    closePopover(pop.current, trigger.current);
    if (value === undefined) setInternal(day);
    if (day !== current) onChange?.(day);
  };

  const go = (day: string, focus: boolean) => {
    moveFocus.current = focus;
    setCursor(clamp(day));
  };

  const focusSelected = () => {
    const popover = pop.current;
    if (!popover?.matches(":popover-open") || popover.contains(document.activeElement)) return;
    document.getElementById(`${baseId}-${focusDay}`)?.focus({ preventScroll: true });
  };

  const onGridKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const offset = (weekday(focusDay) - weekStartsOn + 7) % 7;
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focusDay, -1),
      ArrowRight: () => addDays(focusDay, 1),
      ArrowUp: () => addDays(focusDay, -7),
      ArrowDown: () => addDays(focusDay, 7),
      Home: () => addDays(focusDay, -offset),
      End: () => addDays(focusDay, 6 - offset),
      PageUp: () => shiftDay(focusDay, event.shiftKey ? -12 : -1),
      PageDown: () => shiftDay(focusDay, event.shiftKey ? 12 : 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    go(move(), true);
  };

  return (
    <>
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popId}
        popoverTarget={popId}
        disabled={disabled}
        onKeyDown={(event) => {
          if (open || event.key !== "ArrowDown") return;
          event.preventDefault();
          pop.current?.showPopover();
          focusSelected();
        }}
        className={cn(triggerBase, triggerVariants.field, className)}
      >
        <span className={cn("min-w-0 truncate", !current && "text-muted-foreground")}>{current ? formats.field(current) : placeholder}</span>
        <CalendarDays aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </button>
      <Popover
        id={popId}
        popRef={pop}
        anchorRef={trigger}
        label={label}
        align={align}
        height={380}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setCursor(null);
        }}
        onOpened={focusSelected}
        className="md:min-w-[19rem]"
      >
        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto p-3 max-md:px-4">
          <div className="flex items-center gap-1">
            <p aria-live="polite" className="min-w-0 flex-1 truncate pl-1 text-sm font-semibold tracking-tight max-md:text-base">
              {monthTitle}
            </p>
            <button type="button" aria-label={t.common.previousMonth} title={t.common.previousMonth} onClick={() => go(shiftDay(focusDay, -1), false)} className={navButton}>
              <ChevronLeft />
            </button>
            <button type="button" aria-label={t.common.nextMonth} title={t.common.nextMonth} onClick={() => go(shiftDay(focusDay, 1), false)} className={navButton}>
              <ChevronRight />
            </button>
          </div>
          <div role="group" aria-label={monthTitle} onKeyDown={onGridKey} className="grid grid-cols-7 gap-0.5">
            {grid.slice(0, 7).map(({ day }) => (
              <span key={day} aria-hidden className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {formats.weekday(day).replace(".", "")}
              </span>
            ))}
            {grid.map(({ day, inMonth }) => {
              const chosen = day === current;
              const isToday = day === today;
              return (
                <button
                  key={day}
                  id={`${baseId}-${day}`}
                  type="button"
                  tabIndex={day === focusDay ? 0 : -1}
                  disabled={blocked(day)}
                  aria-label={formats.long(day)}
                  aria-pressed={chosen}
                  aria-current={isToday ? "date" : undefined}
                  onClick={() => choose(day)}
                  className={cn(
                    "relative flex h-9 items-center justify-center rounded-lg text-sm tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30 max-md:h-11 max-md:text-base",
                    inMonth ? "text-foreground" : "text-muted-foreground/50",
                    chosen ? "bg-foreground font-semibold text-background" : "hover:bg-muted",
                    isToday && !chosen && "font-semibold after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-foreground",
                  )}
                >
                  {Number(day.slice(8))}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t px-3 py-2 max-md:px-4">
          <span className="min-w-0 truncate text-xs text-muted-foreground max-md:text-sm">{current ? formats.long(current) : null}</span>
          <button type="button" disabled={!today || blocked(today)} onClick={() => choose(today)} className={buttonStyles("ghost", "sm", "shrink-0")}>
            {t.common.today}
          </button>
        </div>
      </Popover>
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </>
  );
}
