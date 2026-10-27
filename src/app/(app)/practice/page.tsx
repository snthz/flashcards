import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/user";
import { getMessages } from "@/lib/i18n/server";
import { getDeckOptions } from "@/lib/notes/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Practice } from "@/components/practice/practice";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.practice.title };
}

export default async function PracticePage({ searchParams }: PageProps<"/practice">) {
  const [user, t, params] = await Promise.all([requireUser(), getMessages(), searchParams]);
  const decks = await getDeckOptions(user);
  const deck = typeof params.deck === "string" ? params.deck : null;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <PageHeader title={t.practice.title} description={t.practice.description} />
      <Practice decks={decks} initialDeck={deck} />
    </div>
  );
}
