const PUSH_HOSTS = /^(?:fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)$/i;

const hourFormatters = new Map<string, Intl.DateTimeFormat>();

export function isPushEndpoint(endpoint: string) {
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" && PUSH_HOSTS.test(url.hostname);
  } catch {
    return false;
  }
}

export function localHour(date: Date, timeZone: string) {
  let formatter = hourFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" });
    hourFormatters.set(timeZone, formatter);
  }
  return Number(formatter.formatToParts(date).find((part) => part.type === "hour")?.value ?? 0);
}

export function isReminderHour(hour: number, reminderHour: number) {
  return hour === reminderHour || hour === (reminderHour + 1) % 24;
}

export type ReminderStage = 1 | 2 | 3;

export const QUIET_FROM = 22;
export const QUIET_UNTIL = 8;
export const LAST_CALL_HOUR = 21;
const NUDGE_DELAY_HOURS = 3;
const DEFAULT_SECONDS_PER_CARD = 8;

export function reminderSchedule(reminderHour: number, nudges: boolean): Array<{ stage: ReminderStage; hour: number }> {
  const schedule: Array<{ stage: ReminderStage; hour: number }> = [{ stage: 1, hour: reminderHour }];
  if (!nudges) return schedule;
  const nudgeHour = reminderHour + NUDGE_DELAY_HOURS;
  if (nudgeHour >= QUIET_UNTIL && nudgeHour < LAST_CALL_HOUR) schedule.push({ stage: 2, hour: nudgeHour });
  if (LAST_CALL_HOUR >= reminderHour + 2) schedule.push({ stage: 3, hour: LAST_CALL_HOUR });
  return schedule;
}

export function dueStage(hour: number, reminderHour: number, nudges: boolean): ReminderStage | null {
  const schedule = reminderSchedule(reminderHour, nudges);
  for (const entry of [...schedule].reverse()) {
    if (entry.stage === 1) {
      if (isReminderHour(hour, entry.hour)) return 1;
      continue;
    }
    if (hour === entry.hour || (hour === entry.hour + 1 && entry.hour + 1 < QUIET_FROM)) return entry.stage;
  }
  return null;
}

export function studyMinutes(cards: number, averageMs: number | null) {
  const seconds = averageMs && averageMs > 0 ? averageMs / 1000 : DEFAULT_SECONDS_PER_CARD;
  return Math.max(1, Math.round((cards * seconds) / 60));
}

export function pickVariant<T>(variants: T[], seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return variants[hash % variants.length];
}
