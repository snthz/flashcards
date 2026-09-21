export function formatInterval(days: number) {
  if (days < 1 / 24 / 60) return "<1m";
  const minutes = days * 24 * 60;
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${trim(hours)}h`;
  if (days < 30) return `${trim(days)}d`;
  if (days < 365) return `${trim(days / 30)}me`;
  return `${trim(days / 365)}a`;
}

function trim(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatDueDistance(due: Date, now: Date) {
  const diffMs = due.getTime() - now.getTime();
  if (diffMs <= 0) return "ahora";
  return formatInterval(diffMs / 86_400_000);
}
