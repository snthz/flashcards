import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/user";
import { getStudyState } from "@/lib/study/queue";
import { getI18n, getMessages } from "@/lib/i18n/server";
import { StudySession } from "@/components/study/study-session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.study.title };
}

export default async function StudyPage({ params }: PageProps<"/decks/[id]/study">) {
  const { id } = await params;
  const [user, { locale }] = await Promise.all([requireUser(), getI18n()]);
  const state = await getStudyState(user, id, locale);
  if (!state) notFound();
  return <StudySession key={state.card?.id ?? "done"} initial={state} />;
}
