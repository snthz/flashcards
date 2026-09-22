import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/user";
import { getDeckOptions } from "@/lib/notes/queries";
import { getStats, type StatsPeriod } from "@/lib/stats/queries";
import { PageHeader } from "@/components/layout/page-header";
import { StatsFilters } from "@/components/stats/stats-filters";
import { ChartCard, DataTable, Heatmap, HorizontalBars, Legend, StackedBar, StackedColumns, StatTile } from "@/components/stats/charts";
import { SERIES } from "@/lib/stats/palette";
import { formatDuration, formatNumber } from "@/lib/utils";
import { StatsSkeleton } from "./loading";

export const metadata: Metadata = { title: "Estadísticas" };

const PERIOD_VALUES: StatsPeriod[] = ["month", "quarter", "year", "all"];
const REVIEW_SERIES = [
  { key: "fresh", label: "Nuevas", color: SERIES.blue },
  { key: "learning", label: "Aprendizaje", color: SERIES.orange },
  { key: "review", label: "Repaso", color: SERIES.aqua },
];
const BUTTON_LABELS = ["Otra vez", "Difícil", "Bien", "Fácil"];

async function StatsContent({ deckId, period }: { deckId: string; period: StatsPeriod }) {
  const user = await requireUser();
  const stats = await getStats(user, { deckId: deckId || undefined, period });
  const periodReviews = stats.reviewsByDay.reduce((sum, d) => sum + d.total, 0);
  const periodTime = stats.reviewsByDay.reduce((sum, d) => sum + d.durationMs, 0);
  const activeDays = stats.reviewsByDay.filter((d) => d.total > 0).length;
  const reviewButtons = stats.answerButtons.review.reduce((a, b) => a + b, 0);
  const learningButtons = stats.answerButtons.learning.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4 animate-in">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Repasos hoy" value={formatNumber(stats.today.reviews)} hint={formatDuration(stats.today.durationMs)} />
        <StatTile
          label="Retención"
          value={stats.retention == null ? "—" : `${Math.round(stats.retention * 100)}%`}
          hint="Repasos correctos en el periodo"
        />
        <StatTile label="Racha" value={`${stats.streak} ${stats.streak === 1 ? "día" : "días"}`} hint="Días seguidos estudiando" />
        <StatTile label="Pendientes" value={formatNumber(stats.totals.due)} hint={`${formatNumber(stats.totals.dueTomorrow)} más mañana`} />
      </div>

      <ChartCard
        title="Repasos por día"
        subtitle={`${formatNumber(periodReviews)} repasos en ${activeDays} días · ${formatDuration(periodTime)} · media ${formatNumber(activeDays ? Math.round(periodReviews / activeDays) : 0)} por día activo`}
        table={
          <DataTable
            headers={["Día", "Nuevas", "Aprendizaje", "Repaso", "Total"]}
            rows={stats.reviewsByDay.filter((d) => d.total > 0).map((d) => [d.day, d.fresh, d.learning, d.review, d.total])}
          />
        }
      >
        <Legend series={REVIEW_SERIES} />
        <StackedColumns data={stats.reviewsByDay.map((d) => ({ day: d.day, values: { fresh: d.fresh, learning: d.learning, review: d.review } }))} series={REVIEW_SERIES} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Previsión"
          subtitle="Repasos programados para los próximos 30 días"
          table={<DataTable headers={["Día", "Repasos"]} rows={stats.forecast.map((d) => [d.day, d.count])} />}
        >
          <StackedColumns
            data={stats.forecast.map((d) => ({ day: d.day, values: { due: d.count } }))}
            series={[{ key: "due", label: "Repasos", color: SERIES.blue }]}
            height={160}
          />
        </ChartCard>
        <ChartCard
          title="Tarjetas"
          subtitle={`${formatNumber(stats.totals.cards)} tarjetas · ${formatNumber(stats.totals.notes)} notas`}
          table={
            <DataTable
              headers={["Estado", "Tarjetas"]}
              rows={[
                ["Nuevas", stats.cardStates.fresh],
                ["Aprendiendo", stats.cardStates.learning],
                ["Jóvenes", stats.cardStates.young],
                ["Maduras", stats.cardStates.mature],
                ["Suspendidas", stats.cardStates.suspended],
              ]}
            />
          }
        >
          <StackedBar
            segments={[
              { label: "Nuevas", value: stats.cardStates.fresh, color: SERIES.blue },
              { label: "Aprendiendo", value: stats.cardStates.learning, color: SERIES.orange },
              { label: "Jóvenes", value: stats.cardStates.young, color: SERIES.aqua },
              { label: "Maduras", value: stats.cardStates.mature, color: SERIES.yellow },
              { label: "Suspendidas", value: stats.cardStates.suspended, color: SERIES.gray },
            ]}
          />
          <div className="mt-2 flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">Intervalos</p>
            <HorizontalBars data={stats.intervals.map((b) => ({ label: b.label, value: b.count }))} />
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Actividad" subtitle="Repasos por día durante el último año" table={<DataTable headers={["Día", "Repasos"]} rows={stats.heatmap.filter((d) => d.count > 0).map((d) => [d.day, d.count])} />}>
        <Heatmap data={stats.heatmap} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Botones de respuesta · repaso" subtitle={`${formatNumber(reviewButtons)} respuestas en tarjetas de repaso`}>
          <HorizontalBars
            data={stats.answerButtons.review.map((v, i) => ({ label: BUTTON_LABELS[i], value: v, hint: reviewButtons ? `${Math.round((v / reviewButtons) * 100)}%` : undefined }))}
            color={SERIES.aqua}
          />
        </ChartCard>
        <ChartCard title="Botones de respuesta · aprendizaje" subtitle={`${formatNumber(learningButtons)} respuestas en tarjetas nuevas o en aprendizaje`}>
          <HorizontalBars
            data={stats.answerButtons.learning.map((v, i) => ({ label: BUTTON_LABELS[i], value: v, hint: learningButtons ? `${Math.round((v / learningButtons) * 100)}%` : undefined }))}
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
  const deckId = typeof raw.deck === "string" && decks.some((d) => d.id === raw.deck) ? raw.deck : "";
  const period = typeof raw.period === "string" && PERIOD_VALUES.includes(raw.period as StatsPeriod) ? (raw.period as StatsPeriod) : "month";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Estadísticas" />
      <StatsFilters deckId={deckId} period={period} decks={decks} />
      <Suspense key={`${deckId}-${period}`} fallback={<StatsSkeleton />}>
        <StatsContent deckId={deckId} period={period} />
      </Suspense>
    </div>
  );
}
