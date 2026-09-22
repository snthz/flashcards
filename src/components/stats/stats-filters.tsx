"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { StatsPeriod } from "@/lib/stats/queries";

const PERIODS: Array<{ value: StatsPeriod; label: string }> = [
  { value: "month", label: "1 mes" },
  { value: "quarter", label: "3 meses" },
  { value: "year", label: "1 año" },
  { value: "all", label: "Todo" },
];

export function StatsFilters({ deckId, period, decks }: { deckId: string; period: StatsPeriod; decks: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const navigate = (next: { deck?: string; period?: StatsPeriod }) => {
    const params = new URLSearchParams();
    const deck = next.deck ?? deckId;
    const p = next.period ?? period;
    if (deck) params.set("deck", deck);
    if (p !== "month") params.set("period", p);
    startTransition(() => router.push(`/stats${params.size ? `?${params}` : ""}`));
  };
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", pending && "opacity-70")}>
      <Select value={deckId} onChange={(e) => navigate({ deck: e.target.value })} aria-label="Mazo" className="sm:w-64">
        <option value="">Todos los mazos</option>
        {decks.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </Select>
      <div className="flex rounded-lg border bg-card p-0.5" role="tablist" aria-label="Periodo">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            role="tab"
            aria-selected={period === p.value}
            onClick={() => navigate({ period: p.value })}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
              period === p.value ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
