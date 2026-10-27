"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, CalendarDays, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import { setAgendaTaskDone } from "@/lib/agenda/actions";
import { addDays } from "@/lib/agenda/time";
import type { AgendaTaskData } from "@/lib/agenda/types";
import { cn } from "@/lib/utils";
import { dayFormatter, shortReminder } from "./format";

export function UpcomingCard({ tasks, today }: { tasks: AgendaTaskData[]; today: string }) {
  const { locale, t } = useI18n();
  const a = t.agenda;
  const router = useRouter();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const short = useMemo(() => dayFormatter(intlLocale(locale), { weekday: "short", day: "numeric", month: "short" }), [locale]);
  const when = (day: string) => (day === today ? a.today : day === addDays(today, 1) ? a.tomorrow : short(day));

  return (
    <section className="flex flex-col gap-1 rounded-2xl border bg-card p-2 animate-in" aria-label={a.upcoming}>
      <header className="flex items-center justify-between gap-2 px-2.5 pt-1.5">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {a.upcoming}
        </h2>
        <Link href="/agenda" className="group flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
          {a.viewAgenda}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>
      <ul className="flex flex-col">
        {tasks.map((task) => {
          const finished = done.has(task.id);
          const overdue = !finished && task.day < today;
          return (
            <li key={task.id} className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60">
              <button
                type="button"
                role="checkbox"
                aria-checked={finished}
                aria-label={finished ? a.task.undone : a.task.done}
                onClick={() => {
                  setDone((current) => {
                    const next = new Set(current);
                    if (finished) next.delete(task.id);
                    else next.add(task.id);
                    return next;
                  });
                  startTransition(async () => {
                    await setAgendaTaskDone(task.id, !finished);
                    router.refresh();
                  });
                }}
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  finished ? "border-success bg-success text-white" : "border-muted-foreground/40 hover:border-foreground",
                )}
              >
                {finished ? <Check className="size-3" strokeWidth={3} /> : null}
              </button>
              <Link href={`/agenda?day=${task.day}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className={cn("min-w-0 flex-1 truncate text-sm font-medium", finished && "text-muted-foreground line-through")}>{task.title}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  {task.remindMinutes !== null && !finished ? <Bell className="size-3" aria-label={shortReminder(a, task.remindMinutes)} /> : null}
                  <span className={cn(overdue && "font-medium text-danger")}>
                    {overdue ? a.overdue : when(task.day)}
                    {task.time && !overdue ? ` · ${task.time}` : ""}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
