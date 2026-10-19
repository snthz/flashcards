"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { SERIES } from "@/lib/stats/palette";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale, type Locale } from "@/lib/i18n/config";

export interface Series {
  key: string;
  label: string;
  color: string;
}

function dayDate(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

function shortDay(day: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "numeric", timeZone: "UTC" }).format(dayDate(day));
}

function longDay(day: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(dayDate(day));
}

function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function useContainerWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(Math.max(1, Math.round(node.getBoundingClientRect().width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

export function ChartCard({ title, subtitle, children, table }: { title: string; subtitle?: string; children: ReactNode; table?: ReactNode }) {
  const { t } = useI18n();
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">{children}</div>
      {table ? (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none">{t.stats.charts.showTable}</summary>
          <div className="mt-2 max-h-64 overflow-auto rounded-md border">{table}</div>
        </details>
      ) : null}
    </section>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: Array<Array<string | number>> }) {
  const { locale } = useI18n();
  return (
    <table className="w-full text-xs">
      <thead className="bg-muted/60 text-left">
        <tr>
          {headers.map((h) => (
            <th key={h} className="px-2 py-1 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t">
            {row.map((cell, j) => (
              <td key={j} className={cn("px-2 py-1", j > 0 && "text-right tabular-nums")}>
                {typeof cell === "number" ? formatNumber(cell, locale) : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface StackedColumnsProps {
  data: Array<{ day: string; values: Record<string, number> }>;
  series: Series[];
  height?: number;
  valueLabel?: string;
}

export function StackedColumns({ data, series, height = 220, valueLabel }: StackedColumnsProps) {
  const { locale, t } = useI18n();
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();
  const [ref, width] = useContainerWidth<HTMLDivElement>(600);
  const padLeft = 36;
  const padRight = 8;
  const padBottom = 22;
  const padTop = 8;
  const plotW = Math.max(1, width - padLeft - padRight);
  const plotH = height - padBottom - padTop;
  const totals = data.map((d) => series.reduce((sum, s) => sum + (d.values[s.key] ?? 0), 0));
  const max = niceMax(Math.max(...totals, 0));
  const band = plotW / Math.max(1, data.length);
  const barW = Math.min(28, Math.max(2, band - 3));
  const ticks = [0, max / 2, max];
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(plotW / 72))));
  const active = hover != null ? data[hover] : null;

  return (
    <div ref={ref} className="relative w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block max-w-full" role="img" aria-labelledby={id}>
        <title id={id}>{t.stats.charts.columnChart}</title>
        {ticks.map((t) => {
          const y = padTop + plotH - (t / max) * plotH;
          return (
            <g key={t}>
              <line x1={padLeft} x2={width - padRight} y1={y} y2={y} style={{ stroke: "var(--viz-grid)" }} strokeWidth={1} />
              <text x={padLeft - 8} y={y + 3} textAnchor="end" fontSize={11} style={{ fill: "var(--muted-foreground)" }}>
                {formatNumber(t, locale)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = padLeft + i * band + (band - barW) / 2;
          let cursor = padTop + plotH;
          return (
            <g key={d.day}>
              {series.map((s, si) => {
                const value = d.values[s.key] ?? 0;
                const h = (value / max) * plotH;
                if (value <= 0) return null;
                const y = cursor - h;
                cursor = y - 2;
                const isTop = series.slice(si + 1).every((next) => (d.values[next.key] ?? 0) <= 0);
                return (
                  <rect
                    key={s.key}
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(1, h)}
                    rx={isTop ? 3 : 0}
                    style={{ fill: s.color }}
                    opacity={hover == null || hover === i ? 1 : 0.45}
                  />
                );
              })}
              <rect
                x={padLeft + i * band}
                y={padTop}
                width={band}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={-1}
              />
              {i % labelEvery === 0 ? (
                <text x={padLeft + i * band + band / 2} y={height - 6} textAnchor="middle" fontSize={11} style={{ fill: "var(--muted-foreground)" }}>
                  {shortDay(d.day, locale)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {active ? (
        <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-md border bg-card px-2.5 py-1.5 text-xs shadow-md">
          <p className="font-medium">{longDay(active.day, locale)}</p>
          {series.map((s) => (
            <p key={s.key} className="flex items-center gap-1.5 text-muted-foreground">
              <span className="inline-block size-2 rounded-sm" style={{ background: s.color }} />
              {s.label}: {formatNumber(active.values[s.key] ?? 0, locale)}
            </p>
          ))}
          {series.length > 1 ? (
            <p className="text-muted-foreground">
              {t.stats.charts.total}: {formatNumber(totals[hover!], locale)} {valueLabel ?? t.stats.charts.reviewsUnit}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function HorizontalBars({ data, color = SERIES.primary }: { data: Array<{ label: string; value: number; hint?: string }>; color?: string }) {
  const { locale } = useI18n();
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="flex flex-col gap-2">
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[5rem_1fr_3rem] items-center gap-2 text-xs" title={d.hint}>
          <span className="truncate text-muted-foreground">{d.label}</span>
          <span className="h-3 overflow-hidden rounded-r-[3px] bg-transparent">
            <span className="block h-full rounded-r-[3px]" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </span>
          <span className="text-right tabular-nums">{formatNumber(d.value, locale)}</span>
        </li>
      ))}
    </ul>
  );
}

export function StackedBar({ segments }: { segments: Array<{ label: string; value: number; color: string }> }) {
  const { locale, t } = useI18n();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return <p className="text-sm text-muted-foreground">{t.stats.charts.noCards}</p>;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <span key={s.label} className="h-full" style={{ width: `${(s.value / total) * 100}%`, background: s.color }} title={`${s.label}: ${formatNumber(s.value, locale)}`} />
          ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto tabular-nums">{formatNumber(s.value, locale)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Heatmap({ data }: { data: Array<{ day: string; count: number }> }) {
  const { locale, t } = useI18n();
  const [hover, setHover] = useState<{ day: string; count: number } | null>(null);
  const max = Math.max(...data.map((d) => d.count), 1);
  const first = data[0]?.day;
  const [y, m, d] = (first ?? "2026-01-01").split("-").map(Number);
  const firstDow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  const cell = 11;
  const gap = 2;
  const step = cell + gap;
  const padLeft = 18;
  const padTop = 16;
  const weeks = Math.ceil((data.length + firstDow) / 7);
  const width = padLeft + weeks * step;
  const height = padTop + 7 * step;
  const steps = ["var(--viz-seq-1)", "var(--viz-seq-2)", "var(--viz-seq-3)", "var(--viz-seq-4)", "var(--viz-seq-5)"];
  const stepFor = (count: number) => {
    if (count === 0) return "var(--viz-empty)";
    const ratio = count / max;
    return steps[Math.min(steps.length - 1, Math.floor(ratio * steps.length))];
  };
  const monthLabels: Array<{ col: number; label: string }> = [];
  data.forEach((item, i) => {
    const [, month, dayOfMonth] = item.day.split("-").map(Number);
    if (dayOfMonth !== 1) return;
    const col = Math.floor((i + firstDow) / 7);
    const last = monthLabels[monthLabels.length - 1];
    if (last && col - last.col < 3) return;
    monthLabels.push({ col, label: t.stats.charts.months[month - 1] });
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full min-w-[540px]" role="img" aria-label={t.stats.charts.dailyActivity}>
          {monthLabels.map((l) => (
            <text key={`${l.col}-${l.label}`} x={padLeft + l.col * step} y={10} fontSize={9} style={{ fill: "var(--muted-foreground)" }}>
              {l.label}
            </text>
          ))}
          {t.stats.charts.weekdays.map((label, row) =>
            label ? (
              <text key={row} x={0} y={padTop + row * step + cell - 2} fontSize={9} style={{ fill: "var(--muted-foreground)" }}>
                {label}
              </text>
            ) : null,
          )}
          {data.map((item, i) => {
            const index = i + firstDow;
            const col = Math.floor(index / 7);
            const row = index % 7;
            return (
              <rect
                key={item.day}
                x={padLeft + col * step}
                y={padTop + row * step}
                width={cell}
                height={cell}
                rx={2}
                style={{ fill: stepFor(item.count) }}
                onMouseEnter={() => setHover(item)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </svg>
        {hover ? (
          <div className="pointer-events-none absolute left-2 top-2 rounded-md border bg-card px-2.5 py-1.5 text-xs shadow-md">
            <p className="font-medium">{longDay(hover.day, locale)}</p>
            <p className="text-muted-foreground">{t.stats.charts.reviewCount(hover.count, formatNumber(hover.count, locale))}</p>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
        <span className="mr-1">{t.stats.charts.less}</span>
        {["var(--viz-empty)", ...steps].map((color) => (
          <span key={color} className="inline-block size-2.5 rounded-[2px]" style={{ background: color }} aria-hidden />
        ))}
        <span className="ml-1">{t.stats.charts.more}</span>
      </div>
    </div>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
