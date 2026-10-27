import type { Messages } from "@/lib/i18n/messages";
import { REMINDER_PRESETS } from "@/lib/agenda/types";

export function dayFormatter(locale: string, options: Intl.DateTimeFormatOptions) {
  const format = new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });
  return (day: string) => {
    const text = format.format(new Date(`${day}T00:00:00Z`));
    return text.charAt(0).toLocaleUpperCase() + text.slice(1);
  };
}

export function reminderLabel(t: Messages["agenda"], minutes: number | null) {
  if (minutes === null) return t.task.presets.none;
  if ((REMINDER_PRESETS as readonly number[]).includes(minutes)) return t.task.presets[minutes as (typeof REMINDER_PRESETS)[number]];
  if (minutes % 1440 === 0) return t.task.before(minutes / 1440, t.task.units.days);
  if (minutes % 60 === 0) return t.task.before(minutes / 60, t.task.units.hours);
  return t.task.before(minutes, t.task.units.minutes);
}

export function shortReminder(t: Messages["agenda"], minutes: number) {
  return reminderLabel(t, minutes).toLowerCase();
}
