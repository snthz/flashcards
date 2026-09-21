import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/user";
import { getStudyState } from "@/lib/study/queue";
import { StudySession } from "@/components/study/study-session";

export const metadata: Metadata = { title: "Estudiar" };

export default async function StudyPage({ params }: PageProps<"/decks/[id]/study">) {
  const { id } = await params;
  const user = await requireUser();
  const state = await getStudyState(user, id);
  if (!state) notFound();
  return <StudySession key={state.card?.id ?? "done"} initial={state} />;
}
