"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes, type PointerEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const stepper =
  "flex size-8 shrink-0 select-none touch-manipulation items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,transform] [-webkit-touch-callout:none] hover:bg-muted hover:text-foreground active:scale-90 active:bg-border disabled:pointer-events-none disabled:opacity-35 [&>svg]:size-4";

export function NumberInput({ className, disabled, onChange, value, defaultValue, min, max, step, inputMode, ...props }: NumberInputProps) {
  const t = useMessages().common;
  const input = useRef<HTMLInputElement>(null);
  const repeat = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [typed, setTyped] = useState(String(defaultValue ?? ""));
  const shown = value === undefined ? typed : String(value);
  const numeric = shown.trim() === "" ? Number.NaN : Number(shown);
  const atMin = min !== undefined && numeric <= Number(min);
  const atMax = max !== undefined && numeric >= Number(max);
  const decimal = step !== undefined && !Number.isInteger(Number(step));

  const stop = () => clearTimeout(repeat.current);

  useEffect(() => stop, []);

  const nudge = (direction: 1 | -1) => {
    const field = input.current;
    if (!field || field.disabled) return;
    const before = field.value;
    try {
      if (direction > 0) field.stepUp();
      else field.stepDown();
    } catch {
      return;
    }
    if (field.value === before) return stop();
    field.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const hold = (direction: 1 | -1, delay: number) => {
    repeat.current = setTimeout(() => {
      nudge(direction);
      hold(direction, Math.max(40, Math.min(delay, 140) * 0.9));
    }, delay);
  };

  const press = (event: PointerEvent<HTMLButtonElement>, direction: 1 | -1) => {
    if (event.button !== 0) return;
    event.preventDefault();
    stop();
    nudge(direction);
    hold(direction, 400);
    window.addEventListener("pointerup", stop, { once: true });
    window.addEventListener("pointercancel", stop, { once: true });
  };

  return (
    <div
      className={cn(
        "flex h-10 w-full items-center gap-0.5 rounded-lg border bg-card pr-1 transition-shadow focus-within:border-accent focus-within:ring-2 focus-within:ring-ring has-[input:disabled]:opacity-60",
        className,
      )}
    >
      <input
        ref={input}
        type="number"
        inputMode={inputMode ?? (decimal ? "decimal" : "numeric")}
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(event) => {
          setTyped(event.target.value);
          onChange?.(event);
        }}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-base tabular-nums text-foreground outline-none [appearance:textfield] placeholder:text-muted-foreground disabled:cursor-not-allowed sm:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={t.decrease}
        disabled={disabled || atMin}
        onPointerDown={(event) => press(event, -1)}
        onPointerLeave={stop}
        onClick={(event) => event.detail === 0 && nudge(-1)}
        className={stepper}
      >
        <Minus />
      </button>
      <span aria-hidden className="h-4 w-px bg-border" />
      <button
        type="button"
        tabIndex={-1}
        aria-label={t.increase}
        disabled={disabled || atMax}
        onPointerDown={(event) => press(event, 1)}
        onPointerLeave={stop}
        onClick={(event) => event.detail === 0 && nudge(1)}
        className={stepper}
      >
        <Plus />
      </button>
    </div>
  );
}
