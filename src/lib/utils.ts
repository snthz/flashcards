export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es").format(value);
}

export function formatDate(date: Date, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  return new Intl.DateTimeFormat("es", options).format(date);
}

export function formatDuration(ms: number) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)}min`;
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}
