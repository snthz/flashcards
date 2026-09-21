import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/user";
import { getDeckOptions, searchCards } from "@/lib/notes/queries";
import { browseQuerySchema } from "@/lib/validation/note";
import { PageHeader } from "@/components/layout/page-header";
import { BrowseFilters } from "@/components/browse/browse-filters";
import { BrowseTable } from "@/components/browse/browse-table";
import { BrowseTableSkeleton } from "./loading";

export const metadata: Metadata = { title: "Explorar" };

async function Results({ query }: { query: ReturnType<typeof browseQuerySchema.parse> }) {
  const user = await requireUser();
  const result = await searchCards(user, query);
  return <BrowseTable rows={result.rows} total={result.total} page={query.page} pages={result.pages} decks={result.decks} />;
}

export default async function BrowsePage({ searchParams }: PageProps<"/browse">) {
  const raw = await searchParams;
  const parsed = browseQuerySchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    deck: typeof raw.deck === "string" ? raw.deck : "",
    state: typeof raw.state === "string" ? raw.state : "",
    page: typeof raw.page === "string" ? raw.page : "1",
  });
  const query = parsed.success ? parsed.data : browseQuerySchema.parse({});
  const user = await requireUser();
  const decks = await getDeckOptions(user);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Explorar" description="Busca, edita, suspende o reinicia tarjetas." />
      <BrowseFilters query={query} decks={decks} />
      <Suspense key={JSON.stringify(query)} fallback={<BrowseTableSkeleton />}>
        <Results query={query} />
      </Suspense>
    </div>
  );
}
