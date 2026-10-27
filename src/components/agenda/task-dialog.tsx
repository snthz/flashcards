"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BellOff, Trash2 } from "lucide-react";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input, Textarea } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Select } from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { Switch } from "@/components/ui/switch";
import { Field, FormError } from "@/components/ui/field";
import { useMessages } from "@/lib/i18n/client";
import { deleteAgendaTask, saveAgendaTask } from "@/lib/agenda/actions";
import { MAX_REMIND_MINUTES, REMINDER_PRESETS, type AgendaTaskData } from "@/lib/agenda/types";

export interface TaskDraft {
  id: string | null;
  title: string;
  notes: string;
  day: string;
  time: string | null;
  remindMinutes: number | null;
}

export function emptyTask(day: string): TaskDraft {
  return { id: null, title: "", notes: "", day, time: null, remindMinutes: 1440 };
}

type Unit = "minutes" | "hours" | "days";
const UNIT_MINUTES: Record<Unit, number> = { minutes: 1, hours: 60, days: 1440 };

function splitCustom(minutes: number): { amount: number; unit: Unit } {
  if (minutes % 1440 === 0) return { amount: minutes / 1440, unit: "days" };
  if (minutes % 60 === 0) return { amount: minutes / 60, unit: "hours" };
  return { amount: minutes, unit: "minutes" };
}

export function TaskDialog({
  draft,
  pushReady,
  onClose,
  onSaved,
  onDeleted,
}: {
  draft: TaskDraft | null;
  pushReady: boolean;
  onClose: () => void;
  onSaved: (task: AgendaTaskData) => void;
  onDeleted: (id: string) => void;
}) {
  const t = useMessages().agenda;
  return (
    <Dialog sheet open={draft !== null} onClose={onClose} title={draft?.id ? t.task.editTitle : t.task.newTitle} className="max-h-[92dvh] max-w-md overflow-y-auto">
      {draft ? <TaskForm key={draft.id ?? `new-${draft.day}`} draft={draft} pushReady={pushReady} onClose={onClose} onSaved={onSaved} onDeleted={onDeleted} /> : null}
    </Dialog>
  );
}

function TaskForm({
  draft,
  pushReady,
  onClose,
  onSaved,
  onDeleted,
}: {
  draft: TaskDraft;
  pushReady: boolean;
  onClose: () => void;
  onSaved: (task: AgendaTaskData) => void;
  onDeleted: (id: string) => void;
}) {
  const messages = useMessages();
  const t = messages.agenda;
  const isPreset = draft.remindMinutes === null || (REMINDER_PRESETS as readonly number[]).includes(draft.remindMinutes);
  const [title, setTitle] = useState(draft.title);
  const [notes, setNotes] = useState(draft.notes);
  const [day, setDay] = useState(draft.day);
  const [allDay, setAllDay] = useState(draft.time === null);
  const [time, setTime] = useState(draft.time ?? "18:00");
  const [preset, setPreset] = useState(isPreset ? (draft.remindMinutes === null ? "none" : String(draft.remindMinutes)) : "custom");
  const [custom, setCustom] = useState(() => splitCustom(isPreset ? 120 : (draft.remindMinutes ?? 120)));
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const taskId = draft.id;
  const remindMinutes = preset === "none" ? null : preset === "custom" ? Math.min(custom.amount * UNIT_MINUTES[custom.unit], MAX_REMIND_MINUTES) : Number(preset);

  const save = () =>
    startTransition(async () => {
      setError(null);
      const result = await saveAgendaTask({ id: draft.id, title, notes, day, time: allDay ? null : time, remindMinutes }).catch(() => null);
      if (!result?.ok) return setError(t.saveFailed);
      onSaved(result.data);
    });

  const options = [
    { value: "none", label: t.task.presets.none },
    ...REMINDER_PRESETS.map((minutes) => ({ value: String(minutes), label: t.task.presets[minutes] })),
    { value: "custom", label: t.task.presets.custom },
  ];

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (title.trim()) save();
      }}
    >
      <Field label={t.task.name} htmlFor="agenda-task-title">
        <Input id="agenda-task-title" value={title} maxLength={160} placeholder={t.task.namePlaceholder} onChange={(event) => setTitle(event.target.value)} autoFocus required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.task.date} htmlFor="agenda-task-day">
          <DatePicker id="agenda-task-day" value={day} onChange={setDay} />
        </Field>
        <Field label={t.task.time} htmlFor="agenda-task-time">
          <TimePicker id="agenda-task-time" value={allDay ? "" : time} disabled={allDay} onChange={setTime} />
        </Field>
      </div>
      <div className="-mt-1 flex items-center gap-2.5 text-sm">
        <Switch id="agenda-task-all-day" checked={allDay} onChange={setAllDay} />
        <label htmlFor="agenda-task-all-day" className="cursor-pointer select-none">
          {t.task.allDay}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t.task.remind}</span>
        <Select label={t.task.remind} value={preset} onChange={setPreset} options={options} />
        {preset === "custom" ? (
          <div className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-2 animate-in">
            <NumberInput
              aria-label={t.task.amount}
              min={1}
              max={999}
              value={custom.amount}
              onChange={(event) => setCustom((current) => ({ ...current, amount: Math.max(1, Math.min(999, Number(event.target.value) || 1)) }))}
            />
            <Select
              label={t.task.unit}
              value={custom.unit}
              onChange={(unit) => setCustom((current) => ({ ...current, unit }))}
              options={(["minutes", "hours", "days"] as const).map((unit) => ({ value: unit, label: t.task.unitsBefore[unit] }))}
            />
          </div>
        ) : null}
        {allDay && remindMinutes !== null ? <p className="text-xs text-muted-foreground">{t.task.allDayHint}</p> : null}
        {remindMinutes !== null && !pushReady ? (
          <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <BellOff className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {t.pushOff}{" "}
              <Link href="/settings?tab=study" className="font-medium text-foreground underline underline-offset-2">
                {t.pushOffAction}
              </Link>
            </span>
          </p>
        ) : null}
      </div>

      <Field label={t.task.notes} htmlFor="agenda-task-notes">
        <Textarea id="agenda-task-notes" value={notes} rows={3} maxLength={4000} placeholder={t.task.notesPlaceholder} onChange={(event) => setNotes(event.target.value)} className="resize-none" />
      </Field>

      <FormError message={error} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        {draft.id ? (
          <Button variant="ghost" className="text-danger" onClick={() => setConfirming(true)}>
            <Trash2 className="size-4" />
            {t.delete}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="ghost" onClick={onClose}>
            {messages.common.cancel}
          </Button>
          <Button type="submit" loading={pending} disabled={!title.trim()}>
            {t.task.save}
          </Button>
        </div>
      </div>
      {taskId ? (
        <ConfirmDialog
          open={confirming}
          onClose={() => setConfirming(false)}
          onConfirm={async () => {
            await deleteAgendaTask(taskId);
            setConfirming(false);
            onDeleted(taskId);
          }}
          title={t.task.deleteTitle}
          description={t.task.deleteDescription}
          confirmLabel={t.delete}
        />
      ) : null}
    </form>
  );
}
