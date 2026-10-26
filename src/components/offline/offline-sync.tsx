"use client";

import { useEffect } from "react";
import { loadPack, setMeta } from "@/lib/study/offline/store";
import { flushOps } from "@/lib/study/offline/sync";
import { downloadPack, packMediaUrls, warmMedia } from "@/lib/study/offline/prefetch";

const FRESH_FOR_MS = 15 * 60_000;
const MAX_DECKS = 6;

function whenIdle(work: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(work, { timeout: 5000 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = setTimeout(work, 1500);
  return () => clearTimeout(handle);
}

export function OfflineSync({ userId }: { userId: string }) {
  useEffect(() => {
    void setMeta("userId", userId);
    const flush = () => void flushOps(userId);
    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [userId]);

  return null;
}

export function OfflinePrefetch({ userId, deckIds }: { userId: string; deckIds: string[] }) {
  const deckKey = deckIds.slice(0, MAX_DECKS).join(",");

  useEffect(() => {
    if (!deckKey) return;
    let cancelled = false;
    const cancelIdle = whenIdle(() => {
      void (async () => {
        for (const deckId of deckKey.split(",")) {
          if (cancelled || !navigator.onLine) return;
          const stored = await loadPack(userId, deckId);
          if (stored && Date.now() - Date.parse(stored.fetchedAt) < FRESH_FOR_MS) continue;
          await flushOps(userId);
          const pack = await downloadPack(deckId);
          if (pack && !cancelled) await warmMedia(packMediaUrls(pack));
        }
      })();
    });
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [userId, deckKey]);

  return null;
}
