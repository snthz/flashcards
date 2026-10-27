"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Check, ChevronLeft, ChevronRight, Flame, NotebookPen, Plus, StickyNote } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import { deleteAgendaNote, loadAgendaMonth, setAgendaTaskDone } from "@/lib/agenda/actions";
import { monthGrid, shiftMonth } from "@/lib/agenda/time";
import type { AgendaMonth, AgendaNoteData, AgendaTaskData } from "@/lib/agenda/types";
import { cn } from "@/lib/utils";
import { dayFormatter, shortReminder } from "./format";
import { NoteCard } from "./note-card";
import { NoteDialog, emptyNote, type NoteDraft } from "./note-dialog";
import { TaskDialog, emptyTask, type TaskDraft } from "./task-dialog";

function usePushReady() {
  const [ready, setReady] = useState(true);
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      const timer = window.setTimeout(() => setReady(false), 0);
      return () => window.clearTimeout(timer);
    }
    let cancelled = false;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => !cancelled && setReady(Boolean(subscription) && Notification.permission === "granted"))
      .catch(() => !cancelled && setReady(false));
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

function TaskRow({ task, today, onToggle, onOpen, showDay, dayLabel }: { task: AgendaTaskData; today: string; onToggle: () => void; onOpen: () => void; showDay?: boolean; dayLabel?: (day: string) => string }) {
  const t = useI18n().t.agenda;
  const overdue = !task.done && task.day < today;
  return (
    <li className="group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? t.task.undone : t.task.done}
        onClick={onToggle}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          task.done ? "border-success bg-success text-white" : "border-muted-foreground/40 hover:border-foreground",
        )}
      >
        {task.done ? <Check className="size-3" strokeWidth={3} /> : null}
      </button>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className={cn("text-sm font-medium leading-snug", task.done && "text-muted-foreground line-through")}>{task.title}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {showDay && dayLabel ? <span className={cn(overdue && "font-medium text-danger")}>{dayLabel(task.day)}</span> : null}
          <span className={cn(overdue && !showDay && "font-medium text-danger")}>{task.time ?? t.allDay}</span>
          {overdue ? <span className="rounded bg-danger-soft px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-danger">{t.overdue}</span> : null}
          {task.remindMinutes !== null && !task.done ? (
            <span className="inline-flex items-center gap-1">
              <Bell className="size-3" />
              {shortReminder(t, task.remindMinutes)}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

export function AgendaView({ initial, upcoming: initialUpcoming, initialDay }: { initial: AgendaMonth; upcoming: AgendaTaskData[]; initialDay: string }) {
  const { locale, t } = useI18n();
  const a = t.agenda;
  const intl = intlLocale(locale);
  const [data, setData] = useState(initial);
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [selected, setSelected] = useState(initialDay);
  const [loading, startLoading] = useTransition();
  const [noteDraft, setNoteDraft] = useState<NoteDraft | null>(null);
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);
  const [deleting, setDeleting] = useState<AgendaNoteData | null>(null);
  const pushReady = usePushReady();
  const weekStartsOn: 0 | 1 = locale === "en" ? 0 : 1;
  const grid = useMemo(() => monthGrid(data.month, weekStartsOn), [data.month, weekStartsOn]);

  const monthTitle = useMemo(() => {
    const text = new Intl.DateTimeFormat(intl, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${data.month}-01T00:00:00Z`));
    return text.charAt(0).toLocaleUpperCase() + text.slice(1);
  }, [data.month, intl]);
  const weekdays = useMemo(() => grid.slice(0, 7).map((cell) => dayFormatter(intl, { weekday: "short" })(cell.day).replace(".", "")), [grid, intl]);
  const longDay = useMemo(() => dayFormatter(intl, { weekday: "long", day: "numeric", month: "long" }), [intl]);
  const shortDay = useMemo(() => dayFormatter(intl, { weekday: "short", day: "numeric", month: "short" }), [intl]);

  const study = useMemo(() => new Map(data.study.map((entry) => [entry.day, entry])), [data.study]);
  const notesByDay = useMemo(() => groupBy(data.notes), [data.notes]);
  const tasksByDay = useMemo(() => groupBy(data.tasks), [data.tasks]);

  const load = (month: string, day?: string) =>
    startLoading(async () => {
      const next = await loadAgendaMonth(month).catch(() => null);
      if (!next) return;
      setData(next.month);
      setUpcoming(next.upcoming);
      if (day) setSelected(day);
    });

  const go = (delta: number) => {
    const month = shiftMonth(data.month, delta);
    load(month, selected.startsWith(month) ? undefined : `${month}-01`);
  };

  const pick = (day: string) => {
    setSelected(day);
    const url = new URL(window.location.href);
    url.searchParams.set("day", day);
    window.history.replaceState(null, "", url);
    if (!day.startsWith(data.month)) load(day.slice(0, 7));
  };

  const refresh = () => load(data.month);

  const toggle = (task: AgendaTaskData) => {
    const update = (list: AgendaTaskData[]) => list.map((item) => (item.id === task.id ? { ...item, done: !task.done } : item));
    setData((current) => ({ ...current, tasks: update(current.tasks) }));
    setUpcoming((current) => update(current));
    void setAgendaTaskDone(task.id, !task.done).then(refresh);
  };

  const selectedStudy = study.get(selected);
  const selectedNotes = notesByDay.get(selected) ?? [];
  const selectedTasks = tasksByDay.get(selected) ?? [];
  const isToday = selected === data.today;
  const isPast = selected < data.today;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="flex min-w-0 flex-col gap-6">
        <section className={cn("flex flex-col gap-4 rounded-2xl border bg-card p-3 shadow-sm transition-opacity sm:p-5", loading && "opacity-70")} aria-busy={loading}>
          <header className="flex items-center gap-2 px-1">
            <h2 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">{monthTitle}</h2>
            <Button variant="outline" size="sm" onClick={() => (data.today.startsWith(data.month) ? pick(data.today) : load(data.today.slice(0, 7), data.today))}>
              {a.today}
            </Button>
            <div className="flex">
              <Button variant="ghost" size="icon" onClick={() => go(-1)} aria-label={a.previousMonth} title={a.previousMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => go(1)} aria-label={a.nextMonth} title={a.nextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </header>

          <div role="grid" aria-label={monthTitle} className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {weekdays.map((name) => (
              <div key={name} role="columnheader" className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {name}
              </div>
            ))}
            {grid.map(({ day, inMonth }) => {
              const studied = study.get(day);
              const notes = notesByDay.get(day)?.length ?? 0;
              const dayTasks = tasksByDay.get(day) ?? [];
              const open = dayTasks.filter((task) => !task.done).length;
              const today = day === data.today;
              const active = day === selected;
              return (
                <button
                  key={day}
                  type="button"
                  role="gridcell"
                  aria-selected={active}
                  aria-current={today ? "date" : undefined}
                  aria-label={longDay(day)}
                  onClick={() => pick(day)}
                  className={cn(
                    "relative flex h-14 flex-col rounded-xl border p-1 text-left transition-[background-color,border-color,box-shadow] sm:h-24 sm:p-2",
                    inMonth ? "bg-card" : "bg-transparent text-muted-foreground/50",
                    studied && inMonth && "border-success/25 bg-success-soft/40",
                    active ? "border-foreground/50 ring-2 ring-foreground/15" : "border-transparent hover:border-border",
                  )}
                >
                  <span className="flex items-center justify-center gap-1 sm:justify-between">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs tabular-nums sm:size-7 sm:text-sm",
                        today ? "bg-foreground font-semibold text-background" : "font-medium",
                      )}
                    >
                      {Number(day.slice(8))}
                    </span>
                    {studied ? (
                      <span className="hidden size-5 items-center justify-center rounded-full bg-success text-white sm:flex" title={a.studiedTitle}>
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-auto hidden min-w-0 flex-col gap-0.5 sm:flex">
                    {dayTasks.slice(0, 2).map((task) => (
                      <span key={task.id} className={cn("truncate rounded px-1 text-[11px] leading-4", task.done ? "text-muted-foreground line-through" : "bg-muted text-foreground")}>
                        {task.title}
                      </span>
                    ))}
                    {dayTasks.length > 2 || (notes > 0 && dayTasks.length < 2) ? (
                      <span className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
                        {notes > 0 ? <StickyNote className="size-3" /> : null}
                        {dayTasks.length > 2 ? `+${dayTasks.length - 2}` : notes > 1 ? notes : null}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-auto flex justify-center gap-1 pb-0.5 sm:hidden" aria-hidden>
                    {studied ? <span className="size-1.5 rounded-full bg-success" /> : null}
                    {notes > 0 ? <span className="size-1.5 rounded-full bg-foreground/70" /> : null}
                    {open > 0 ? <span className="size-1.5 rounded-full border border-foreground/70" /> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-success" />
              {a.legendStudy}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-foreground/70" />
              {a.legendNotes}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-foreground/70" />
              {a.legendTasks}
            </span>
          </div>
        </section>

        <section className="hidden flex-col gap-2 rounded-2xl border bg-card p-4 lg:flex">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{a.upcoming}</h3>
          {upcoming.length === 0 ? (
            <p className="px-2 py-1 text-sm text-muted-foreground">{a.noUpcoming}</p>
          ) : (
            <ul className="-mx-2 flex flex-col">
              {upcoming.map((task) => (
                <TaskRow key={task.id} task={task} today={data.today} showDay dayLabel={shortDay} onToggle={() => toggle(task)} onOpen={() => setTaskDraft({ ...task })} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <header className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{longDay(selected)}</h2>
          {isToday ? <span className="rounded-md bg-foreground px-2 py-0.5 text-xs font-semibold text-background">{a.today}</span> : null}
        </header>

        {selectedStudy ? (
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-soft px-4 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
              <Flame className="size-4" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-success">{a.studiedTitle}</span>
              <span className="text-xs text-muted-foreground">{a.studiedDetail(selectedStudy.reviews, selectedStudy.minutes)}</span>
            </span>
          </div>
        ) : isToday ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3">
            <span className="text-sm text-muted-foreground">{a.notStudiedToday}</span>
            <Link href="/decks" className={buttonStyles("primary", "sm")}>
              {a.studyNow}
            </Link>
          </div>
        ) : isPast ? (
          <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">{a.noStudy}</p>
        ) : null}

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{a.tasks}</h3>
            <Button variant="ghost" size="sm" onClick={() => setTaskDraft(emptyTask(selected))}>
              <Plus className="size-4" />
              {a.addTask}
            </Button>
          </div>
          {selectedTasks.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">{a.noTasks}</p>
          ) : (
            <ul className="flex flex-col rounded-xl border bg-card p-1">
              {selectedTasks.map((task) => (
                <TaskRow key={task.id} task={task} today={data.today} onToggle={() => toggle(task)} onOpen={() => setTaskDraft({ ...task })} />
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{a.notes}</h3>
            <Button variant="ghost" size="sm" onClick={() => setNoteDraft(emptyNote(selected))}>
              <Plus className="size-4" />
              {a.addNote}
            </Button>
          </div>
          {selectedNotes.length === 0 ? (
            <button
              type="button"
              onClick={() => setNoteDraft(emptyNote(selected))}
              className="flex items-start gap-3 rounded-xl border border-dashed px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <NotebookPen className="mt-0.5 size-4 shrink-0" />
              {a.noNotes}
            </button>
          ) : (
            selectedNotes.map((note) => <NoteCard key={note.id} note={note} onEdit={() => setNoteDraft({ ...note })} onDelete={() => setDeleting(note)} />)
          )}
        </section>

        <section className="flex flex-col gap-2 lg:hidden">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{a.upcoming}</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">{a.noUpcoming}</p>
          ) : (
            <ul className="flex flex-col rounded-xl border bg-card p-1">
              {upcoming.map((task) => (
                <TaskRow key={task.id} task={task} today={data.today} showDay dayLabel={shortDay} onToggle={() => toggle(task)} onOpen={() => setTaskDraft({ ...task })} />
              ))}
            </ul>
          )}
        </section>
      </aside>

      <NoteDialog
        draft={noteDraft}
        dayLabel={noteDraft ? longDay(noteDraft.day) : ""}
        onClose={() => setNoteDraft(null)}
        onSaved={() => {
          setNoteDraft(null);
          refresh();
        }}
      />
      <TaskDialog
        draft={taskDraft}
        pushReady={pushReady}
        onClose={() => setTaskDraft(null)}
        onSaved={(task) => {
          setTaskDraft(null);
          if (task.day.startsWith(data.month) || grid.some((cell) => cell.day === task.day)) refresh();
          else load(task.day.slice(0, 7), task.day);
        }}
        onDeleted={() => {
          setTaskDraft(null);
          refresh();
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await deleteAgendaNote(deleting.id);
          setDeleting(null);
          refresh();
        }}
        title={a.note.deleteTitle}
        description={a.note.deleteDescription}
        confirmLabel={a.delete}
      />
    </div>
  );
}

function groupBy<T extends { day: string }>(list: T[]) {
  const map = new Map<string, T[]>();
  for (const entry of list) map.set(entry.day, [...(map.get(entry.day) ?? []), entry]);
  return map;
}
