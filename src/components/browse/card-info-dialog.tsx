"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getCardInfo, type CardInfo } from "@/lib/notes/card-info";
import { formatInterval } from "@/lib/scheduler/format";
import { useI18n } from "@/lib/i18n/client";
import { cn, formatDate, formatDuration, formatNumber } from "@/lib/utils";

const RATING_TONE = ["", "text-danger", "text-warning", "text-success", "text-info"];
const STATE_TONE = { NEW: "accent", LEARNING: "danger", REVIEW: "success", RELEARNING: "warning" } as const;

export function CardInfoDialog({ cardId, onClose }: { cardId: string | null; onClose: () => void }) {
  const { locale, t } = useI18n();
  const c = t.cardInfo;
  const [info, setInfo] = useState<{ id: string; data: CardInfo | null } | null>(null);

  useEffect(() => {
    if (!cardId) return;
    let cancelled = false;
    getCardInfo(cardId)
      .then((data) => !cancelled && setInfo({ id: cardId, data }))
      .catch(() => !cancelled && setInfo({ id: cardId, data: null }));
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const data = info?.id === cardId ? info.data : undefined;
  const date = (iso: string | null) => (iso ? formatDate(new Date(iso), locale, { dateStyle: "medium" }) : c.never);
  const percent = (value: number) => `${formatNumber(Math.round(value * 1000) / 10, locale)}%`;

  const rows: Array<[string, string]> = data
    ? [
        [c.added, date(data.createdAt)],
        [c.firstReview, date(data.firstReview)],
        [c.lastReview, date(data.lastReview)],
        [c.due, data.state === "NEW" ? c.never : date(data.due)],
        [c.interval, data.state === "NEW" ? c.never : formatInterval(data.interval, locale)],
        ...(data.stability != null
          ? ([
              [c.stability, formatInterval(data.stability, locale)],
              [c.difficulty, data.difficulty != null ? `${formatNumber(Math.round(data.difficulty * 10) / 10, locale)} / 10` : c.never],
              ...(data.retrievability != null ? ([[c.retrievability, percent(data.retrievability)]] as Array<[string, string]>) : []),
            ] as Array<[string, string]>)
          : ([[c.ease, data.state === "NEW" ? c.never : `${Math.round(data.ease / 10)}%`]] as Array<[string, string]>)),
        [c.reviews, formatNumber(data.reps, locale)],
        [c.lapses, formatNumber(data.lapses, locale)],
        [c.averageTime, data.history.length > 0 ? formatDuration(data.totalMs / data.history.length) : c.never],
        [c.totalTime, data.totalMs > 0 ? formatDuration(data.totalMs) : c.never],
        [c.position, `${data.noteTypeName} · ${data.templateName}`],
      ]
    : [];

  return (
    <Dialog open={cardId !== null} onClose={onClose} title={c.title} description={data?.preview} className="max-w-lg">
      {data === undefined ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : data === null ? (
        <p className="text-sm text-danger">{c.failed}</p>
      ) : (
        <div className="flex max-h-[70dvh] flex-col gap-4 overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge tone={STATE_TONE[data.state]}>{t.browse.badges[data.state]}</Badge>
            {data.suspended ? <Badge>{t.browse.badges.suspended}</Badge> : null}
            <span className="truncate">{data.deckName}</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{c.history}</p>
            {data.history.length === 0 ? (
              <p className="text-sm text-muted-foreground">{c.noHistory}</p>
            ) : (
              <ul className="divide-y rounded-lg border text-sm">
                {data.history.map((entry) => (
                  <li key={entry.at} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2">
                    <span className="text-muted-foreground">{formatDate(new Date(entry.at), locale, { dateStyle: "medium", timeStyle: "short" })}</span>
                    <span className={cn("font-medium", RATING_TONE[entry.rating])}>{c.ratings[entry.rating]}</span>
                    <span className="w-14 text-right tabular-nums text-muted-foreground">
                      {entry.newInterval > 0 ? formatInterval(entry.newInterval, locale) : c.never}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
