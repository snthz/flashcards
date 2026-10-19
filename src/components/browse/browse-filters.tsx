"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import type { BrowseQuery } from "@/lib/validation/note";
import { useI18n } from "@/lib/i18n/client";

const STATES: Array<Exclude<BrowseQuery["state"], "">> = ["NEW", "LEARNING", "REVIEW", "RELEARNING", "SUSPENDED", "BURIED", "FLAGGED"];

export function BrowseFilters({ query, decks }: { query: BrowseQuery; decks: Array<{ id: string; name: string }> }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = (next: Partial<BrowseQuery>) => {
    const merged = { ...query, ...next, page: next.page ?? 1 };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.deck) params.set("deck", merged.deck);
    if (merged.state) params.set("state", merged.state);
    if (merged.page > 1) params.set("page", String(merged.page));
    startTransition(() => router.push(`/browse${params.size ? `?${params}` : ""}`));
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        navigate({ q: String(form.get("q") ?? "").trim() });
      }}
      className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"
      aria-busy={pending}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={query.q} placeholder={t.browse.searchPlaceholder} className="pl-9" enterKeyHint="search" />
      </div>
      <Select value={query.deck} onChange={(e) => navigate({ deck: e.target.value })} aria-label={t.browse.deck} className="sm:w-56">
        <option value="">{t.browse.allDecks}</option>
        {decks.map((deck) => (
          <option key={deck.id} value={deck.id}>
            {deck.name}
          </option>
        ))}
      </Select>
      <Select value={query.state} onChange={(e) => navigate({ state: e.target.value as BrowseQuery["state"] })} aria-label={t.browse.state} className="sm:w-44">
        <option value="">{t.browse.filters.all}</option>
        {STATES.map((state) => (
          <option key={state} value={state}>
            {t.browse.filters[state]}
          </option>
        ))}
      </Select>
    </form>
  );
}
