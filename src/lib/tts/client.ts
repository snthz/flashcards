import { naturalVoice } from "./voices";

const MAX_READY = 80;
const unsupported = new Set<string>();
const ready = new Map<string, string>();
const queued = new Set<string>();

function key(text: string, lang: string) {
  return `${lang.toLowerCase()}\u0000${text}`;
}

export function canUseNaturalVoice(lang: string) {
  return Boolean(naturalVoice(lang)) && !unsupported.has(lang.toLowerCase()) && typeof window !== "undefined" && navigator.onLine;
}

const inflight = new Map<string, Promise<string | null>>();

export function readySpeechUrl(text: string, lang: string) {
  return ready.get(key(text.replace(/\s+/g, " ").trim(), lang)) ?? null;
}

export function naturalSpeechUrl(text: string, lang: string): Promise<string | null> {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean || !canUseNaturalVoice(lang)) return Promise.resolve(null);
  const id = key(clean, lang);
  const known = ready.get(id);
  if (known) return Promise.resolve(known);
  const running = inflight.get(id);
  if (running) return running;
  const request = fetchSpeech(clean, lang, id).finally(() => inflight.delete(id));
  inflight.set(id, request);
  return request;
}

async function fetchSpeech(clean: string, lang: string, id: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/speech?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(clean)}`, {
      credentials: "same-origin",
      signal: AbortSignal.timeout(3000),
    });
    if (response.status === 501) unsupported.add(lang.toLowerCase());
    if (response.status !== 200) return null;
    const url = URL.createObjectURL(await response.blob());
    ready.set(id, url);
    if (ready.size > MAX_READY) {
      const [oldest, stale] = ready.entries().next().value as [string, string];
      ready.delete(oldest);
      URL.revokeObjectURL(stale);
    }
    return url;
  } catch {
    return null;
  }
}

export function prefetchSpeech(items: Array<{ text: string; lang: string }>) {
  if (typeof window === "undefined" || !navigator.onLine) return;
  const fresh = items
    .map((item) => ({ text: item.text.replace(/\s+/g, " ").trim(), lang: item.lang }))
    .filter((item) => item.text && canUseNaturalVoice(item.lang) && !queued.has(key(item.text, item.lang)) && !ready.has(key(item.text, item.lang)));
  const unique = [...new Map(fresh.map((item) => [key(item.text, item.lang), item])).values()].slice(0, 60);
  if (unique.length === 0) return;
  unique.forEach((item) => queued.add(key(item.text, item.lang)));
  void fetch("/api/speech", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: unique }),
  })
    .then((response) => {
      if (response.status === 501) unique.forEach((item) => unsupported.add(item.lang.toLowerCase()));
    })
    .catch(() => null);
}
