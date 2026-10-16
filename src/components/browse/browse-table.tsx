"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteNotes, moveCards, resetCards, setCardsSuspended } from "@/lib/notes/actions";
import type { BrowseRow } from "@/lib/notes/queries";
import { formatInterval } from "@/lib/scheduler/format";
import { cn, formatDate, formatNumber } from "@/lib/utils";

const STATE_LABEL: Record<BrowseRow["state"], { label: string; tone: "accent" | "danger" | "success" | "warning" }> = {
  NEW: { label: "Nueva", tone: "accent" },
  LEARNING: { label: "Aprendiendo", tone: "danger" },
  REVIEW: { label: "Repaso", tone: "success" },
  RELEARNING: { label: "Reaprend.", tone: "warning" },
};

const FLAG_COLORS = ["", "#ef4444", "#f97316", "#22c55e", "#3b82f6", "#ec4899", "#14b8a6", "#a855f7"];

interface Props {
  rows: BrowseRow[];
  total: number;
  page: number;
  pages: number;
  decks: Array<{ id: string; name: string }>;
}

export function BrowseTable({ rows, total, page, pages, decks }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [moveTo, setMoveTo] = useState("");

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const selectedRows = rows.filter((r) => selected.has(r.id));
  const ids = selectedRows.map((r) => r.id);

  const run = (work: () => Promise<void>) =>
    startTransition(async () => {
      await work();
      setSelected(new Set());
      router.refresh();
    });

  const goTo = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (target > 1) params.set("page", String(target));
    else params.delete("page");
    router.push(`${pathname}${params.size ? `?${params}` : ""}`);
  };

  if (rows.length === 0) {
    return <EmptyState title="Sin resultados" description="Prueba con otra búsqueda o cambia los filtros." />;
  }

  const currentQuery = searchParams.toString();
  const from = `/browse${currentQuery ? `?${currentQuery}` : ""}`;

  return (
    <div className="flex flex-col gap-3 animate-in">
      {ids.length > 0 ? (
        <div className="sticky top-[calc(3.5rem_+_var(--safe-top))] z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2 shadow-sm md:top-[calc(4rem_+_var(--safe-top))]">
          <span className="px-2 text-sm text-muted-foreground">{ids.length} seleccionadas</span>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setCardsSuspended(ids, !selectedRows.every((r) => r.suspended)))}>
            {selectedRows.every((r) => r.suspended) ? "Reactivar" : "Suspender"}
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => resetCards(ids))}>
            Reiniciar progreso
          </Button>
          <div className="flex items-center gap-1">
            <Select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className="h-8 w-44 text-xs" aria-label="Mover a">
              <option value="">Mover a…</option>
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <Button size="sm" variant="outline" disabled={!moveTo || pending} onClick={() => run(() => moveCards(ids, moveTo))}>
              Mover
            </Button>
          </div>
          <Button
            size="sm"
            variant="danger"
            disabled={pending}
            onClick={() => {
              if (window.confirm(`¿Eliminar ${ids.length} tarjetas y sus notas?`)) {
                run(() => deleteNotes(Array.from(new Set(selectedRows.map((r) => r.noteId)))));
              }
            }}
          >
            Eliminar
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-2">
                <Checkbox
                  checked={allSelected}
                  aria-label="Seleccionar todo"
                  onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))}
                />
              </th>
              <th className="px-2 py-2 text-left font-medium">Tarjeta</th>
              <th className="hidden px-2 py-2 text-left font-medium md:table-cell">Mazo</th>
              <th className="px-2 py-2 text-left font-medium">Estado</th>
              <th className="hidden px-2 py-2 text-right font-medium sm:table-cell">Vence</th>
              <th className="hidden px-2 py-2 text-right font-medium lg:table-cell">Intervalo</th>
              <th className="hidden px-2 py-2 text-right font-medium lg:table-cell">Facilidad</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.id} className={cn("transition-colors hover:bg-muted/40", selected.has(row.id) && "bg-accent-soft/40")}>
                <td className="px-3 py-2">
                  <Checkbox
                    checked={selected.has(row.id)}
                    aria-label="Seleccionar"
                    onChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(row.id)) next.delete(row.id);
                        else next.add(row.id);
                        return next;
                      })
                    }
                  />
                </td>
                <td className="max-w-0 px-2 py-2">
                  <Link href={`/notes/${row.noteId}/edit?from=${encodeURIComponent(from)}`} className="flex items-center gap-2 hover:text-accent">
                    {row.flag ? <Flag className="size-3.5 shrink-0 fill-current" style={{ color: FLAG_COLORS[row.flag] }} /> : null}
                    <span className={cn("truncate", row.suspended && "text-muted-foreground line-through")}>{row.preview}</span>
                  </Link>
                  {row.tags.length > 0 ? (
                    <p className="truncate text-xs text-muted-foreground">{row.tags.join(" · ")}</p>
                  ) : null}
                </td>
                <td className="hidden max-w-48 truncate px-2 py-2 text-muted-foreground md:table-cell">{row.deckName}</td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={STATE_LABEL[row.state].tone}>{STATE_LABEL[row.state].label}</Badge>
                    {row.suspended ? <Badge>Suspendida</Badge> : null}
                    {row.buried ? <Badge>Enterrada</Badge> : null}
                  </div>
                </td>
                <td className="hidden px-2 py-2 text-right tabular-nums text-muted-foreground sm:table-cell">
                  {row.state === "NEW" ? "—" : formatDate(new Date(row.due), { day: "numeric", month: "short" })}
                </td>
                <td className="hidden px-2 py-2 text-right tabular-nums text-muted-foreground lg:table-cell">
                  {row.state === "NEW" ? "—" : formatInterval(row.interval)}
                </td>
                <td className="hidden px-2 py-2 text-right tabular-nums text-muted-foreground lg:table-cell">
                  {row.state === "NEW" ? "—" : `${Math.round(row.ease / 10)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatNumber(total)} tarjetas</span>
        {pages > 1 ? (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => goTo(page - 1)} aria-label="Anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="tabular-nums">
              {page} / {pages}
            </span>
            <Button variant="ghost" size="icon" disabled={page >= pages} onClick={() => goTo(page + 1)} aria-label="Siguiente">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
