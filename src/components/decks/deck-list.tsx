"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Layers, MoreHorizontal, Pencil, Play, Settings2, Trash2 } from "lucide-react";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatNumber } from "@/lib/utils";
import type { DeckNode } from "@/lib/decks/queries";
import { CreateDeckButton, DeleteDeckDialog, RenameDeckDialog } from "./deck-dialogs";

function Count({ value, tone }: { value: number; tone: "new" | "learn" | "due" }) {
  const color = tone === "new" ? "text-accent" : tone === "learn" ? "text-danger" : "text-success";
  return (
    <span className={cn("w-10 text-right text-sm tabular-nums", value > 0 ? color : "text-muted-foreground/50")}>
      {formatNumber(value)}
    </span>
  );
}

function DeckRow({
  node,
  expanded,
  onToggle,
  onRename,
  onDelete,
}: {
  node: DeckNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onRename: (node: DeckNode) => void;
  onDelete: (node: DeckNode) => void;
}) {
  const router = useRouter();
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const hasDue = node.counts.fresh + node.counts.learning + node.counts.review > 0;
  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/70",
          node.depth > 0 && "ml-4 border-l pl-3",
        )}
      >
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          aria-label={isOpen ? "Contraer" : "Expandir"}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground",
            hasChildren ? "hover:bg-border" : "invisible",
          )}
        >
          <ChevronRight className={cn("size-4 transition-transform", isOpen && "rotate-90")} />
        </button>
        <Link href={`/decks/${node.id}`} className="min-w-0 flex-1 truncate py-1 text-sm font-medium">
          {node.name}
        </Link>
        <div className="flex items-center gap-1">
          <Count value={node.counts.fresh} tone="new" />
          <Count value={node.counts.learning} tone="learn" />
          <Count value={node.counts.review} tone="due" />
        </div>
        <Menu
          className="ml-1"
          trigger={
            <span className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-border hover:text-foreground">
              <MoreHorizontal className="size-4" />
            </span>
          }
        >
          <MenuItem icon={<Play />} onSelect={() => router.push(`/decks/${node.id}/study`)}>
            {hasDue ? "Estudiar" : "Ver mazo"}
          </MenuItem>
          <MenuItem icon={<Settings2 />} onSelect={() => router.push(`/decks/${node.id}/options`)}>
            Opciones
          </MenuItem>
          <MenuItem icon={<Pencil />} onSelect={() => onRename(node)}>
            Renombrar
          </MenuItem>
          <MenuSeparator />
          <MenuItem icon={<Trash2 />} tone="danger" onSelect={() => onDelete(node)}>
            Eliminar
          </MenuItem>
        </Menu>
      </div>
      {hasChildren && isOpen ? (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <DeckRow key={child.id} node={child} expanded={expanded} onToggle={onToggle} onRename={onRename} onDelete={onDelete} />
          ))}
        </div>
      ) : null}
    </>
  );
}

export function DeckList({ tree }: { tree: DeckNode[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(tree.filter((n) => n.children.length > 0).map((n) => n.id)));
  const [renaming, setRenaming] = useState<DeckNode | null>(null);
  const [deleting, setDeleting] = useState<DeckNode | null>(null);

  if (tree.length === 0) {
    return (
      <EmptyState
        icon={<Layers />}
        title="Todavía no tienes mazos"
        description="Importa un archivo .apkg de Anki o crea un mazo nuevo para empezar a estudiar."
        action={<CreateDeckButton>Crear mi primer mazo</CreateDeckButton>}
      />
    );
  }

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="rounded-xl border bg-card p-2 animate-in">
      <div className="flex items-center gap-1 px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <span className="flex-1 pl-7">Mazo</span>
        <span className="w-10 text-right">Nuevas</span>
        <span className="w-10 text-right">Aprend.</span>
        <span className="w-10 text-right">Repaso</span>
        <span className="ml-1 w-8" />
      </div>
      <div className="flex flex-col">
        {tree.map((node) => (
          <DeckRow key={node.id} node={node} expanded={expanded} onToggle={toggle} onRename={setRenaming} onDelete={setDeleting} />
        ))}
      </div>
      <RenameDeckDialog deck={renaming} onClose={() => setRenaming(null)} />
      <DeleteDeckDialog deck={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}
