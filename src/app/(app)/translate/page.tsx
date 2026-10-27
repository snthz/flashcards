import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/user";
import { getMessages } from "@/lib/i18n/server";
import { PageHeader } from "@/components/layout/page-header";
import { Translator } from "@/components/translate/translator";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.translate.title };
}

export default async function TranslatePage({ searchParams }: PageProps<"/translate">) {
  const [, t, params] = await Promise.all([requireUser(), getMessages(), searchParams]);
  const tab = params.tab === "dictionary" ? "dictionary" : "translate";
  const text = typeof params.q === "string" ? params.q.slice(0, 2000) : "";
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col">
      <PageHeader title={t.translate.title} description={t.translate.description} />
      <Translator initialTab={tab} initialText={text} />
    </div>
  );
}
