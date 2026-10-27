import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/user";
import { getMessages } from "@/lib/i18n/server";
import { PageHeader } from "@/components/layout/page-header";
import { ToolTabs } from "@/components/translate/results";
import { DictionaryWorkspace } from "@/components/translate/dictionary-workspace";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.translate.dictionaryTitle };
}

export default async function DictionaryPage({ searchParams }: PageProps<"/dictionary">) {
  const [, t, params] = await Promise.all([requireUser(), getMessages(), searchParams]);
  const word = typeof params.q === "string" ? params.q.slice(0, 80) : "";
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <PageHeader title={t.translate.dictionaryTitle} description={t.translate.dictionaryDescription} actions={<ToolTabs current="dictionary" />} />
      <DictionaryWorkspace initialText={word} />
    </div>
  );
}
