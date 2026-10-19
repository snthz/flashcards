import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/messages";

export function formatInterval(days: number, locale: Locale = defaultLocale) {
  const units = dictionaries[locale].time;
  if (days < 1 / 24 / 60) return `<1${units.minute}`;
  const minutes = days * 24 * 60;
  if (minutes < 60) return `${Math.round(minutes)}${units.minute}`;
  const hours = minutes / 60;
  if (hours < 24) return `${trim(hours)}${units.hour}`;
  if (days < 30) return `${trim(days)}${units.day}`;
  if (days < 365) return `${trim(days / 30)}${units.month}`;
  return `${trim(days / 365)}${units.year}`;
}

function trim(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatDueDistance(due: Date, now: Date, locale: Locale = defaultLocale) {
  const diffMs = due.getTime() - now.getTime();
  if (diffMs <= 0) return dictionaries[locale].time.now;
  return formatInterval(diffMs / 86_400_000, locale);
}
