import type { StudyPack } from "../types";
import { savePack } from "./store";

const MEDIA_RE = /(?:src|data-src)="(\/api\/media\/[^"]+)"/g;
const MEDIA_LIMIT = 300;
const CONCURRENCY = 4;

export function packMediaUrls(pack: StudyPack) {
  const urls = new Set<string>();
  for (const card of pack.cards) {
    for (const html of [card.question, card.answer]) {
      for (const match of html.matchAll(MEDIA_RE)) urls.add(match[1]);
    }
  }
  return [...urls].slice(0, MEDIA_LIMIT);
}

export async function warmMedia(urls: string[]) {
  const queue = [...urls];
  const worker = async () => {
    while (queue.length > 0) {
      const url = queue.shift()!;
      await fetch(url, { credentials: "same-origin" }).catch(() => null);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

export async function downloadPack(deckId: string) {
  try {
    const response = await fetch(`/api/study/pack?deck=${encodeURIComponent(deckId)}`, { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) return null;
    const pack = (await response.json()) as StudyPack;
    await savePack(pack);
    return pack;
  } catch {
    return null;
  }
}
