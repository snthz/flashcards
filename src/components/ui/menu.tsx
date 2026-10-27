"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const itemStyles = "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted";

interface MenuProps {
  trigger: ReactNode | ((open: boolean) => ReactNode);
  children: ReactNode;
  align?: "left" | "right";
  label?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

function menuItems(menu: HTMLElement | null) {
  return Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
}

export function Menu({ trigger, children, align = "right", label, className, triggerClassName, contentClassName }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const focusFirst = useRef(false);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    if (focusFirst.current) {
      focusFirst.current = false;
      menuItems(menu.current)[0]?.focus();
    }
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = menuItems(menu.current);
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 };
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (!(event.key in moves)) return;
    event.preventDefault();
    items[(moves[event.key] + items.length) % items.length]?.focus();
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        ref={button}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        className={triggerClassName}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
            event.preventDefault();
            focusFirst.current = true;
            setOpen(true);
          }
        }}
      >
        {typeof trigger === "function" ? trigger(open) : trigger}
      </div>
      {open ? (
        <div
          ref={menu}
          id={id}
          role="menu"
          aria-label={label}
          onClick={() => setOpen(false)}
          onKeyDown={onMenuKey}
          style={{ "--menu-origin": align === "right" ? "top right" : "top left" } as CSSProperties}
          className={cn(
            "menu-pop absolute z-30 mt-1 min-w-44 overflow-hidden rounded-xl border bg-card p-1 shadow-lg",
            align === "right" ? "right-0" : "left-0",
            contentClassName,
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
      tabIndex={-1}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onSelect?.();
        (event.currentTarget.closest("[role=menu]") as HTMLElement | null)?.click();
      }}
      className={cn(itemStyles, tone === "danger" ? "text-danger" : "text-foreground")}
    >
      {icon ? <span className="text-muted-foreground [&>svg]:size-4">{icon}</span> : null}
      {children}
    </button>
  );
}

export function MenuLink({ href, children, icon, className }: { href: string; children: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <Link href={href} role="menuitem" tabIndex={-1} className={cn(itemStyles, "text-foreground", className)}>
      {icon ? <span className="text-muted-foreground [&>svg]:size-4">{icon}</span> : null}
      {children}
    </Link>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</div>;
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}
