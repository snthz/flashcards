import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/user";
import { buildStudyPack } from "@/lib/study/queue";
import { getI18n, getMessages } from "@/lib/i18n/server";
import { StudySession } from "@/components/study/study-session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.study.title };
}

export default async function StudyPage({ params, searchParams }: PageProps<"/decks/[id]/study">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [user, { locale }] = await Promise.all([requireUser(), getI18n()]);
  const pack = await buildStudyPack(user, id, locale);
  if (!pack) notFound();
  const preferCardId = typeof query.card === "string" ? query.card : null;
  return <StudySession key={pack.fetchedAt} initialPack={pack} preferCardId={preferCardId} />;
}
