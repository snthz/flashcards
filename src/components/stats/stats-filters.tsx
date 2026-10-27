"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { StatsPeriod } from "@/lib/stats/queries";
import { useI18n } from "@/lib/i18n/client";

const PERIODS: StatsPeriod[] = ["month", "quarter", "year", "all"];

export function StatsFilters({ deckId, period, decks }: { deckId: string; period: StatsPeriod; decks: Array<{ id: string; name: string }> }) {
  const { t } = useI18n();
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
      <Select
        value={deckId}
        onChange={(deck) => navigate({ deck })}
        label={t.stats.deck}
        className="sm:w-64"
        options={[{ value: "", label: t.stats.allDecks }, ...decks.map((d) => ({ value: d.id, label: d.name }))]}
      />
      <div className="flex rounded-lg border bg-card p-0.5" role="tablist" aria-label={t.stats.period}>
        {PERIODS.map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={period === value}
            onClick={() => navigate({ period: value })}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
              period === value ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.stats.periods[value]}
          </button>
        ))}
      </div>
    </div>
  );
}
