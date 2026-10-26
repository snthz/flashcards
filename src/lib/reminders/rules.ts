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
