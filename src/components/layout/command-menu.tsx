"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, BookOpen, Compass, CornerDownLeft, Dumbbell, GraduationCap, Languages, Layers, Search, Settings, Upload, type LucideIcon } from "lucide-react";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function CommandMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useMessages().nav;
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const pages: Command[] = useMemo(
    () => [
      { id: "decks", label: t.decks, href: "/decks", icon: Layers },
      { id: "discover", label: t.discover, href: "/discover", icon: Compass },
      { id: "browse", label: t.browse, href: "/browse", icon: Search },
      { id: "stats", label: t.stats, href: "/stats", icon: BarChart3 },
      { id: "practice", label: t.practice, href: "/practice", icon: Dumbbell },
      { id: "translate", label: t.translate, href: "/translate", icon: Languages },
      { id: "dictionary", label: t.dictionary, href: "/dictionary", icon: BookOpen },
      { id: "grammar", label: t.grammar, href: "/grammar", icon: GraduationCap },
      { id: "import", label: t.import, href: "/import", icon: Upload },
      { id: "settings", label: t.settings, href: "/settings", icon: Settings },
    ],
    [t],
  );

  const term = query.trim();
  const matches = pages.filter((page) => normalize(page.label).includes(normalize(term)));
  const commands: Command[] = term
    ? [{ id: "search", label: t.searchNotes(term), href: `/browse?q=${encodeURIComponent(term)}`, icon: Search }, ...matches]
    : matches;
  const selected = Math.min(active, Math.max(commands.length - 1, 0));

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
      input.current?.focus();
    }
    if (!open && node.open) node.close();
  }, [open]);

  const close = () => {
    setQuery("");
    setActive(0);
    onClose();
  };

  const run = (command: Command | undefined) => {
    if (!command) return;
    close();
    router.push(command.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((selected + step + commands.length) % Math.max(commands.length, 1));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      run(commands[selected]);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-label={t.searchLabel}
      onClose={close}
      onClick={(event) => {
        if (event.target === dialog.current) close();
      }}
      className="mx-auto mt-[14vh] w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-xl border bg-card p-0 text-foreground shadow-2xl open:animate-in"
    >
      <div className="flex items-center gap-3 border-b px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={input}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={t.searchPlaceholder}
          role="combobox"
          aria-expanded="true"
          aria-controls="command-list"
          aria-activedescendant={commands[selected] ? `command-${commands[selected].id}` : undefined}
          className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Esc</kbd>
      </div>
      <ul id="command-list" role="listbox" className="max-h-80 overflow-y-auto p-1.5">
        {!term ? <li className="px-2.5 pb-1 pt-2 text-xs font-medium text-muted-foreground">{t.goTo}</li> : null}
        {commands.map((command, index) => {
          const Icon = command.icon;
          const current = index === selected;
          return (
            <li
              key={command.id}
              id={`command-${command.id}`}
              role="option"
              aria-selected={current}
              onPointerMove={() => setActive(index)}
              onClick={() => run(command)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm",
                current ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 truncate">{command.label}</span>
              {current ? (
                command.id === "search" ? <CornerDownLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />
              ) : null}
            </li>
          );
        })}
        {commands.length === 0 ? <li className="px-2.5 py-6 text-center text-sm text-muted-foreground">{t.noResults}</li> : null}
      </ul>
      <p className="border-t px-4 py-2 text-[11px] text-muted-foreground">{t.paletteHint}</p>
    </dialog>
  );
}
