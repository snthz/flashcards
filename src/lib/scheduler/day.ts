const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;

interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

export function isValidTimeZone(timeZone: string) {
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
}

function localParts(date: Date, timeZone: string): Parts {
  const parts = formatterFor(timeZone).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function offsetMinutes(date: Date, timeZone: string) {
  const p = localParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (asUtc - date.getTime()) / MINUTE_MS;
}

function localToUtc(year: number, month: number, day: number, hour: number, timeZone: string) {
  const guess = Date.UTC(year, month - 1, day, hour);
  const offset = offsetMinutes(new Date(guess), timeZone);
  const candidate = new Date(guess - offset * MINUTE_MS);
  const correction = offsetMinutes(candidate, timeZone);
  return new Date(guess - correction * MINUTE_MS);
}

export function dayStart(now: Date, timeZone: string, dayStartHour: number) {
  const p = localParts(now, timeZone);
  let dayShift = 0;
  if (p.hour < dayStartHour) dayShift = -1;
  const base = Date.UTC(p.year, p.month - 1, p.day + dayShift);
  const shifted = new Date(base);
  return localToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    dayStartHour,
    timeZone,
  );
}

export function nextDayStart(now: Date, timeZone: string, dayStartHour: number) {
  const start = dayStart(now, timeZone, dayStartHour);
  return dayStart(new Date(start.getTime() + DAY_MS + 60 * MINUTE_MS), timeZone, dayStartHour);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * MINUTE_MS);
}

export function daysBetween(from: Date, to: Date) {
  return (to.getTime() - from.getTime()) / DAY_MS;
}

export function dayKey(date: Date, timeZone: string, dayStartHour: number) {
  const start = dayStart(date, timeZone, dayStartHour);
  const p = localParts(new Date(start.getTime() + 12 * 60 * MINUTE_MS), timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export { DAY_MS, MINUTE_MS };
