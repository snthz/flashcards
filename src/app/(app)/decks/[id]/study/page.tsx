import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/user";
import { buildStudyPack } from "@/lib/study/queue";
import { parseCustomStudy } from "@/lib/study/custom";
import { getI18n, getMessages } from "@/lib/i18n/server";
import { StudySession } from "@/components/study/study-session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.study.title };
}

export default async function StudyPage({ params, searchParams }: PageProps<"/decks/[id]/study">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [user, { locale }] = await Promise.all([requireUser(), getI18n()]);
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (typeof value === "string") search.set(key, value);
  const pack = await buildStudyPack(user, id, locale, parseCustomStudy(search));
  if (!pack) notFound();
  const preferCardId = typeof query.card === "string" ? query.card : null;
  return <StudySession key={pack.fetchedAt} initialPack={pack} preferCardId={preferCardId} />;
}
