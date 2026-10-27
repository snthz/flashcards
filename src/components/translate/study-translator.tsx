"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Languages, X } from "lucide-react";
import { useMessages } from "@/lib/i18n/client";
import { htmlToText } from "@/lib/anki/render";
import { MAX_TEXT } from "@/lib/translate/types";
import { cn } from "@/lib/utils";
import { Translator } from "./translator";

type SelectableRoot = ShadowRoot & { getSelection?: () => Selection | null };

function selectedText(container: HTMLElement | null) {
  const pieces = [window.getSelection()?.toString() ?? ""];
  container?.querySelectorAll("*").forEach((element) => {
    const root = element.shadowRoot as SelectableRoot | null;
    if (root?.getSelection) pieces.push(root.getSelection()?.toString() ?? "");
  });
  return pieces.map((piece) => piece.trim()).find(Boolean)?.slice(0, MAX_TEXT) ?? "";
}

function cardContext(html: string | null) {
  if (!html) return null;
  return htmlToText(html.replace(/<style[\s\S]*?<\/style>/gi, "")).slice(0, 1000) || null;
}

interface StudyTranslatorProps {
  cardHtml: string | null;
  cardRef: RefObject<HTMLElement | null>;
  deckId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function wideScreen() {
  return window.matchMedia("(min-width: 768px)").matches;
}

export function StudyTranslator({ cardHtml, cardRef, deckId, open, onOpenChange: setOpen }: StudyTranslatorProps) {
  const t = useMessages().translate;
  const [session, setSession] = useState({ id: 0, text: "", focus: false });
  const triggerSelection = useRef("");

  const show = () => {
    const text = triggerSelection.current || selectedText(cardRef.current);
    triggerSelection.current = "";
    setSession((current) => ({ id: current.id + 1, text, focus: wideScreen() }));
    setOpen(true);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = (event.composedPath()[0] ?? event.target) as HTMLElement | null;
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (open || event.ctrlKey || event.metaKey || event.altKey || event.key.toLowerCase() !== "t") return;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      event.preventDefault();
      const text = selectedText(cardRef.current);
      setSession((current) => ({ id: current.id + 1, text, focus: wideScreen() }));
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, cardRef, setOpen]);

  useEffect(() => {
    if (!open) return;
    if (wideScreen()) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const context = cardContext(cardHtml);

  return (
    <>
      <button
        type="button"
        onPointerDown={() => {
          triggerSelection.current = selectedText(cardRef.current);
        }}
        onClick={show}
        aria-label={t.helperOpen}
        title={`${t.helperOpen} (T)`}
        aria-expanded={open}
        data-translator
        className={cn(
          "absolute bottom-3 right-3 z-20 flex size-10 items-center justify-center rounded-full border bg-card/95 text-muted-foreground shadow-md backdrop-blur transition-[transform,opacity] hover:text-foreground active:scale-95",
          "md:fixed md:bottom-6 md:right-6 md:size-12 md:bg-accent md:text-accent-foreground md:shadow-lg md:hover:text-accent-foreground",
          open && "md:pointer-events-none md:scale-90 md:opacity-0",
        )}
      >
        <Languages className="size-5" />
      </button>
      {open
        ? createPortal(
            <div data-translator className="fixed inset-0 z-40 md:pointer-events-none md:inset-auto md:bottom-6 md:right-6">
              <div className="absolute inset-0 bg-black/30 animate-in md:hidden" onClick={() => setOpen(false)} aria-hidden />
              <div
                role="dialog"
                aria-label={t.helperTitle}
                className={cn(
                  "absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-2xl border bg-background shadow-2xl animate-in safe-bottom",
                  "md:pointer-events-auto md:static md:max-h-[min(640px,calc(100dvh-3rem))] md:w-[400px] md:rounded-2xl",
                )}
              >
                <div className="flex justify-center pt-2 md:hidden" aria-hidden>
                  <span className="h-1 w-10 rounded-full bg-border" />
                </div>
                <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Languages className="size-4" />
                    {t.helperTitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={t.close}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                  <Translator key={session.id} autoFocus={session.focus} initialText={session.text} cardText={context} deckId={deckId} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
