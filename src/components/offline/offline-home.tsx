"use client";

import { useEffect, useState } from "react";
import { ChevronRight, RotateCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudySession } from "@/components/study/study-session";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import { createEngine, engineCounts } from "@/lib/study/engine";
import { getMeta, listPacks, loadOps, loadPack } from "@/lib/study/offline/store";
import type { StudyCounts, StudyPack } from "@/lib/study/types";

const STUDY_PATH = /^\/decks\/([0-9a-f-]{36})\/study\/?$/i;

type State =
  | { status: "loading" }
  | { status: "study"; pack: StudyPack }
  | { status: "list"; decks: Array<{ pack: StudyPack; counts: StudyCounts }> };

export function OfflineHome() {
  const { locale, t } = useI18n();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const userId = await getMeta<string>("userId");
      const match = STUDY_PATH.exec(window.location.pathname);
      if (userId && match) {
        const pack = await loadPack(userId, match[1]);
        if (pack && !cancelled) return setState({ status: "study", pack });
      }
      const [packs, ops] = userId ? await Promise.all([listPacks(userId), loadOps(userId)]) : [[], []];
      const now = new Date();
      const decks = packs
        .map((pack) => ({ pack, counts: engineCounts(createEngine(pack, ops), now) }))
        .sort((a, b) => a.pack.deckName.localeCompare(b.pack.deckName, intlLocale(locale)));
      if (!cancelled) setState({ status: "list", decks });
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (state.status === "study") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pt-[calc(1rem_+_var(--safe-top))] md:px-6 md:pt-8">
        <StudySession initialPack={state.pack} />
      </div>
    );
  }

  const time = (iso: string) => new Date(iso).toLocaleString(intlLocale(locale), { weekday: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <WifiOff className="size-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{state.status === "list" && state.decks.length > 0 ? t.offline.studyTitle : t.offline.title}</h1>
        <p className="text-sm text-muted-foreground">
          {state.status === "list" && state.decks.length > 0 ? t.offline.studyLead : state.status === "list" ? t.offline.noSavedDecks : t.offline.body}
        </p>
      </div>
      {state.status === "list" && state.decks.length > 0 ? (
        <ul className="flex flex-col divide-y rounded-xl border bg-card">
          {state.decks.map(({ pack, counts }) => {
            const due = counts.fresh + counts.learning + counts.review;
            return (
              <li key={pack.deckId}>
                <a href={`/decks/${pack.deckId}/study`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/70">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{pack.deckName}</span>
                    <span className="text-xs text-muted-foreground">{due > 0 ? t.offline.savedAt(time(pack.fetchedAt)) : t.offline.nothingDue}</span>
                  </span>
                  <span className="flex gap-2 text-sm tabular-nums">
                    <span className={counts.fresh > 0 ? "text-info" : "text-muted-foreground/50"}>{counts.fresh}</span>
                    <span className={counts.learning > 0 ? "text-danger" : "text-muted-foreground/50"}>{counts.learning}</span>
                    <span className={counts.review > 0 ? "text-success" : "text-muted-foreground/50"}>{counts.review}</span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
      <Button variant="outline" className="self-center" onClick={() => window.location.reload()}>
        <RotateCw className="size-4" />
        {t.offline.retry}
      </Button>
    </main>
  );
}
