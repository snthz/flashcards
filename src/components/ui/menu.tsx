"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function Menu({ trigger, children, align = "right", className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
      >
        {trigger}
      </div>
      {open ? (
        <div
          id={id}
          role="menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute z-30 mt-1 min-w-44 overflow-hidden rounded-lg border bg-card p-1 shadow-lg animate-in",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

interface MenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  tone?: "default" | "danger";
  icon?: ReactNode;
}

export function MenuItem({ children, onSelect, tone = "default", icon }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onSelect?.();
        (event.currentTarget.closest("[role=menu]") as HTMLElement | null)?.click();
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
        tone === "danger" ? "text-danger" : "text-foreground",
      )}
    >
      {icon ? <span className="text-muted-foreground [&>svg]:size-4">{icon}</span> : null}
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}
