import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/user";
import { getMessages } from "@/lib/i18n/server";
import { agendaMonth, upcomingTasks } from "@/lib/agenda/queries";
import { DAY_RE, localDay } from "@/lib/agenda/time";
import { PageHeader } from "@/components/layout/page-header";
import { AgendaView } from "@/components/agenda/agenda-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.agenda.title };
}

export default async function AgendaPage({ searchParams }: PageProps<"/agenda">) {
  const [user, t, params] = await Promise.all([requireUser(), getMessages(), searchParams]);
  const today = localDay(new Date(), user.timezone);
  const day = typeof params.day === "string" && DAY_RE.test(params.day) ? params.day : today;
  const [month, upcoming] = await Promise.all([agendaMonth(user, day.slice(0, 7)), upcomingTasks(user)]);
  return (
    <div className="flex w-full flex-col">
      <PageHeader title={t.agenda.title} description={t.agenda.description} />
      <AgendaView key={day} initial={month} upcoming={upcoming} initialDay={day} />
    </div>
  );
}
