"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Download, Layers, MoreHorizontal, Pencil, Play, Settings2, Trash2 } from "lucide-react";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatNumber } from "@/lib/utils";
import { useI18n, useLocale } from "@/lib/i18n/client";
import type { DeckNode } from "@/lib/decks/queries";
import { ExportDialog } from "@/components/export/export-dialog";
import { CreateDeckButton, DeleteDeckDialog, RenameDeckDialog } from "./deck-dialogs";

function Count({ value, tone }: { value: number; tone: "new" | "learn" | "due" }) {
  const locale = useLocale();
  const color = tone === "new" ? "text-info" : tone === "learn" ? "text-danger" : "text-success";
  return (
    <span className={cn("w-12 text-right text-sm tabular-nums sm:w-16", value > 0 ? color : "text-muted-foreground/50")}>
      {formatNumber(value, locale)}
    </span>
  );
}

function DeckRow({
  node,
  expanded,
  onToggle,
  onRename,
  onExport,
  onDelete,
}: {
  node: DeckNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onRename: (node: DeckNode) => void;
  onExport: (node: DeckNode) => void;
  onDelete: (node: DeckNode) => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const hasDue = node.counts.fresh + node.counts.learning + node.counts.review > 0;
  return (
    <>
      <div
        className="group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/70"
        style={node.depth > 0 ? { marginLeft: `${node.depth * 1.25}rem` } : undefined}
      >
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          aria-label={isOpen ? t.decks.collapse : t.decks.expand}
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
            {hasDue ? t.decks.study : t.decks.viewDeck}
          </MenuItem>
          <MenuItem icon={<Settings2 />} onSelect={() => router.push(`/decks/${node.id}/options`)}>
            {t.common.options}
          </MenuItem>
          <MenuItem icon={<Pencil />} onSelect={() => onRename(node)}>
            {t.common.rename}
          </MenuItem>
          <MenuItem icon={<Download />} onSelect={() => onExport(node)}>
            {t.exporter.export}
          </MenuItem>
          <MenuSeparator />
          <MenuItem icon={<Trash2 />} tone="danger" onSelect={() => onDelete(node)}>
            {t.common.delete}
          </MenuItem>
        </Menu>
      </div>
      {hasChildren && isOpen ? (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <DeckRow key={child.id} node={child} expanded={expanded} onToggle={onToggle} onRename={onRename} onExport={onExport} onDelete={onDelete} />
          ))}
        </div>
      ) : null}
    </>
  );
}

export function DeckList({ tree }: { tree: DeckNode[] }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [renaming, setRenaming] = useState<DeckNode | null>(null);
  const [deleting, setDeleting] = useState<DeckNode | null>(null);
  const [exporting, setExporting] = useState<DeckNode | null>(null);

  if (tree.length === 0) {
    return (
      <EmptyState
        icon={<Layers />}
        title={t.decks.emptyTitle}
        description={t.decks.emptyDescription}
        action={<CreateDeckButton>{t.decks.createFirst}</CreateDeckButton>}
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
      <div className="flex items-center gap-1 px-2 pb-2 pt-1 text-[11px] font-medium text-muted-foreground">
        <span className="flex-1 pl-7">{t.decks.deck}</span>
        <span className="w-12 text-right sm:w-16">{t.decks.new}</span>
        <span className="w-12 text-right sm:w-16">{t.decks.learnShort}</span>
        <span className="w-12 text-right sm:w-16">{t.decks.due}</span>
        <span className="ml-1 w-8" />
      </div>
      <div className="flex flex-col">
        {tree.map((node) => (
          <DeckRow key={node.id} node={node} expanded={expanded} onToggle={toggle} onRename={setRenaming} onExport={setExporting} onDelete={setDeleting} />
        ))}
      </div>
      <RenameDeckDialog deck={renaming} onClose={() => setRenaming(null)} />
      <DeleteDeckDialog deck={deleting} onClose={() => setDeleting(null)} />
      <ExportDialog
        target={exporting ? { id: exporting.id, name: exporting.fullName } : null}
        open={exporting !== null}
        onClose={() => setExporting(null)}
      />
    </div>
  );
}
