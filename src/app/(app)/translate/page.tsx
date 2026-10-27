import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/user";
import { getMessages } from "@/lib/i18n/server";
import { PageHeader } from "@/components/layout/page-header";
import { ToolTabs } from "@/components/translate/results";
import { TranslatorWorkspace } from "@/components/translate/translator-workspace";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.translate.translatorTitle };
}

export default async function TranslatePage({ searchParams }: PageProps<"/translate">) {
  const [, t, params] = await Promise.all([requireUser(), getMessages(), searchParams]);
  const text = typeof params.q === "string" ? params.q.slice(0, 2000) : "";
  if (params.tab === "dictionary") redirect(text ? `/dictionary?q=${encodeURIComponent(text.slice(0, 80))}` : "/dictionary");
  return (
    <div className="flex w-full flex-col">
      <PageHeader title={t.translate.translatorTitle} description={t.translate.translatorDescription} actions={<ToolTabs current="translate" />} />
      <TranslatorWorkspace initialText={text} />
    </div>
  );
}
