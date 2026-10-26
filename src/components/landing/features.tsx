import type { ReactNode } from "react";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import { BrowserArt, HistoryArt, MediaArt, NoteTypesArt, SchedulingArt, StatsArt } from "./feature-art";
import { delay } from "./motion";
import { SectionIntro } from "./section-intro";

interface Tile {
  span: string;
  art: ReactNode;
}

export async function Features() {
  const { locale, t } = await getI18n();
  const l = t.landing;
  const tiles: Record<string, Tile> = {
    scheduling: {
      span: "sm:col-span-2 lg:col-span-4",
      art: <SchedulingArt locale={locale} labels={l.demo} retention={t.stats.retention} />,
    },
    media: { span: "lg:col-span-2", art: <MediaArt /> },
    history: { span: "lg:col-span-2", art: <HistoryArt locale={locale} /> },
    noteTypes: { span: "lg:col-span-2", art: <NoteTypesArt types={l.art.noteTypes} /> },
    browser: {
      span: "sm:col-span-2 lg:col-span-2",
      art: <BrowserArt query={l.art.search} rows={l.demo.cards.map((card) => card.front)} />,
    },
    stats: {
      span: "sm:col-span-2 lg:col-span-6",
      art: (
        <StatsArt
          less={t.stats.charts.less}
          more={t.stats.charts.more}
          figures={[
            { label: t.stats.retention, value: 91, suffix: "%" },
            { label: t.stats.streak, value: 12 },
            { label: t.stats.todayReviews, value: 128 },
          ]}
        />
      ),
    },
  };

  return (
    <section id="features" className="scroll-mt-16 border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-24 md:px-6 md:py-32">
        <SectionIntro label={l.nav.features} title={l.carryTitle} lead={l.carryLead} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {l.carry.map((row, index) => {
            const tile = tiles[row.key];
            if (!tile) return null;
            const wide = row.key === "stats";
            return (
              <div key={row.key} data-reveal className={tile.span} style={delay((index % 3) * 110)}>
                <article
                  data-spotlight
                  className={cn(
                    "spotlight flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition-[border-color,box-shadow] duration-500 hover:border-foreground/15 hover:shadow-xl",
                    wide && "lg:flex-row-reverse",
                  )}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "flex min-h-48 flex-1 items-center justify-center bg-background/60 p-6",
                      wide ? "border-b lg:border-b-0 lg:border-l lg:p-10" : "border-b",
                    )}
                  >
                    {tile.art}
                  </div>
                  <div className={cn("flex flex-col gap-2 p-6", wide && "lg:w-80 lg:justify-center lg:p-10")}>
                    <h3 className="text-lg font-semibold tracking-tight">{row.term}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{row.detail}</p>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
