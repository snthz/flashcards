import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/user";
import { getDeckOptions } from "@/lib/notes/queries";
import { getStats, type StatsPeriod } from "@/lib/stats/queries";
import { PageHeader } from "@/components/layout/page-header";
import { StatsFilters } from "@/components/stats/stats-filters";
import { ChartCard, DataTable, Heatmap, HorizontalBars, Legend, StackedBar, StackedColumns, StatTile } from "@/components/stats/charts";
import { SERIES } from "@/lib/stats/palette";
import { getI18n, getMessages } from "@/lib/i18n/server";
import { formatDuration, formatNumber } from "@/lib/utils";
import { StatsSkeleton } from "./loading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.stats.title };
}

const PERIOD_VALUES: StatsPeriod[] = ["month", "quarter", "year", "all"];

async function StatsContent({ deckId, period }: { deckId: string; period: StatsPeriod }) {
  const user = await requireUser();
  const { locale, t } = await getI18n();
  const stats = await getStats(user, { deckId: deckId || undefined, period });
  const format = (value: number) => formatNumber(value, locale);
  const periodReviews = stats.reviewsByDay.reduce((sum, d) => sum + d.total, 0);
  const periodTime = stats.reviewsByDay.reduce((sum, d) => sum + d.durationMs, 0);
  const activeDays = stats.reviewsByDay.filter((d) => d.total > 0).length;
  const reviewButtons = stats.answerButtons.review.reduce((a, b) => a + b, 0);
  const learningButtons = stats.answerButtons.learning.reduce((a, b) => a + b, 0);
  const reviewSeries = [
    { key: "fresh", label: t.stats.series.fresh, color: SERIES.primary },
    { key: "learning", label: t.stats.series.learning, color: SERIES.orange },
    { key: "review", label: t.stats.series.review, color: SERIES.aqua },
  ];
  const states = t.stats.cardStates;

  return (
    <div className="flex flex-col gap-4 animate-in">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={t.stats.todayReviews} value={format(stats.today.reviews)} hint={formatDuration(stats.today.durationMs)} />
        <StatTile
          label={t.stats.retention}
          value={stats.retention == null ? "—" : `${Math.round(stats.retention * 100)}%`}
          hint={t.stats.retentionHint}
        />
        <StatTile label={t.stats.streak} value={t.stats.days(stats.streak, format(stats.streak))} hint={t.stats.streakHint} />
        <StatTile label={t.stats.due} value={format(stats.totals.due)} hint={t.stats.dueTomorrow(format(stats.totals.dueTomorrow))} />
      </div>

      <ChartCard
        title={t.stats.reviews}
        subtitle={t.stats.reviewsSubtitle(
          periodReviews,
          format(periodReviews),
          activeDays,
          formatDuration(periodTime),
          format(activeDays ? Math.round(periodReviews / activeDays) : 0),
        )}
        table={
          <DataTable
            headers={[t.stats.table.day, t.stats.series.fresh, t.stats.series.learning, t.stats.series.review, t.stats.table.total]}
            rows={stats.reviewsByDay.filter((d) => d.total > 0).map((d) => [d.day, d.fresh, d.learning, d.review, d.total])}
          />
        }
      >
        <Legend series={reviewSeries} />
        <StackedColumns data={stats.reviewsByDay.map((d) => ({ day: d.day, values: { fresh: d.fresh, learning: d.learning, review: d.review } }))} series={reviewSeries} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title={t.stats.futureDue}
          subtitle={t.stats.futureDueSubtitle}
          table={<DataTable headers={[t.stats.table.day, t.stats.table.reviews]} rows={stats.forecast.map((d) => [d.day, d.count])} />}
        >
          <StackedColumns
            data={stats.forecast.map((d) => ({ day: d.day, values: { due: d.count } }))}
            series={[{ key: "due", label: t.stats.table.reviews, color: SERIES.primary }]}
            height={200}
          />
        </ChartCard>
        <ChartCard
          title={t.stats.cardCounts}
          subtitle={t.stats.cardCountsSubtitle(stats.totals.cards, format(stats.totals.cards), stats.totals.notes, format(stats.totals.notes))}
          table={
            <DataTable
              headers={[t.stats.table.state, t.stats.table.cards]}
              rows={[
                [states.fresh, stats.cardStates.fresh],
                [states.learning, stats.cardStates.learning],
                [states.young, stats.cardStates.young],
                [states.mature, stats.cardStates.mature],
                [states.suspended, stats.cardStates.suspended],
              ]}
            />
          }
        >
          <StackedBar
            segments={[
              { label: states.fresh, value: stats.cardStates.fresh, color: SERIES.primary },
              { label: states.learning, value: stats.cardStates.learning, color: SERIES.orange },
              { label: states.young, value: stats.cardStates.young, color: SERIES.aqua },
              { label: states.mature, value: stats.cardStates.mature, color: SERIES.yellow },
              { label: states.suspended, value: stats.cardStates.suspended, color: SERIES.gray },
            ]}
          />
          <div className="mt-2 flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">{t.stats.intervals}</p>
            <HorizontalBars data={stats.intervals.map((b) => ({ label: t.stats.intervalBuckets[b.bucket], value: b.count }))} />
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title={t.stats.activity}
        subtitle={t.stats.activitySubtitle}
        table={<DataTable headers={[t.stats.table.day, t.stats.table.reviews]} rows={stats.heatmap.filter((d) => d.count > 0).map((d) => [d.day, d.count])} />}
      >
        <Heatmap data={stats.heatmap} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={t.stats.answerButtonsReview} subtitle={t.stats.answerButtonsReviewSubtitle(format(reviewButtons))}>
          <HorizontalBars
            data={stats.answerButtons.review.map((v, i) => ({ label: t.stats.buttons[i], value: v, hint: reviewButtons ? `${Math.round((v / reviewButtons) * 100)}%` : undefined }))}
            color={SERIES.aqua}
          />
        </ChartCard>
        <ChartCard title={t.stats.answerButtonsLearning} subtitle={t.stats.answerButtonsLearningSubtitle(format(learningButtons))}>
          <HorizontalBars
            data={stats.answerButtons.learning.map((v, i) => ({ label: t.stats.buttons[i], value: v, hint: learningButtons ? `${Math.round((v / learningButtons) * 100)}%` : undefined }))}
            color={SERIES.orange}
          />
        </ChartCard>
      </div>
    </div>
  );
}

export default async function StatsPage({ searchParams }: PageProps<"/stats">) {
  const raw = await searchParams;
  const user = await requireUser();
  const decks = await getDeckOptions(user);
  const t = await getMessages();
  const deckId = typeof raw.deck === "string" && decks.some((d) => d.id === raw.deck) ? raw.deck : "";
  const period = typeof raw.period === "string" && PERIOD_VALUES.includes(raw.period as StatsPeriod) ? (raw.period as StatsPeriod) : "month";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t.stats.title} />
      <StatsFilters deckId={deckId} period={period} decks={decks} />
      <Suspense key={`${deckId}-${period}`} fallback={<StatsSkeleton />}>
        <StatsContent deckId={deckId} period={period} />
      </Suspense>
    </div>
  );
}
