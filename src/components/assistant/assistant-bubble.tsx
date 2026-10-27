"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { AssistantChat } from "./assistant-chat";

function wideScreen() {
  return window.matchMedia("(min-width: 768px)").matches;
}

export function AssistantBubble() {
  const t = useMessages().assistant;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focus, setFocus] = useState(false);
  const hidden = pathname.includes("/study");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    if (wideScreen()) return () => window.removeEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (hidden) return null;

  const show = () => {
    setFocus(wideScreen());
    setMounted(true);
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        aria-label={t.open}
        title={t.open}
        aria-expanded={open}
        className={cn(
          "fixed bottom-[calc(5.25rem+var(--safe-bottom))] right-4 z-30 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg ring-1 ring-black/5 transition-[transform,opacity] hover:scale-105 active:scale-95 md:bottom-6 md:right-6",
          open && "pointer-events-none scale-90 opacity-0",
        )}
      >
        <MessageCircle className="size-5" />
      </button>
      {mounted ? (
        <div className={cn("fixed inset-0 z-40 md:pointer-events-none md:inset-auto md:bottom-6 md:right-6", !open && "hidden")}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in md:hidden" onClick={() => setOpen(false)} aria-hidden />
          <section
            role="dialog"
            aria-label={t.title}
            className={cn(
              "panel-pop absolute inset-x-0 bottom-0 flex h-[85dvh] flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl",
              "md:pointer-events-auto md:static md:h-[min(640px,calc(100dvh-3rem))] md:w-[400px] md:rounded-2xl",
            )}
          >
            <div className="flex justify-center pt-2 md:hidden" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-border" />
            </div>
            <header className="flex items-center gap-3 border-b px-4 py-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Sparkles className="size-4" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="text-sm font-semibold">{t.title}</h2>
                <p className="truncate text-xs text-muted-foreground">{t.subtitle}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={t.close} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </header>
            <div className="flex min-h-0 flex-1 flex-col pb-[var(--safe-bottom)] md:pb-0">
              <AssistantChat autoFocus={focus} />
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
