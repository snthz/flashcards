import Link from "next/link";
import type { Streak } from "@/lib/stats/queries";
import { cn } from "@/lib/utils";

interface Tier {
  min: number;
  name: string;
  outer: [string, string];
  inner: [string, string];
  glow: string;
}

// Hotter flames for longer streaks: ember → fire → blaze → blue flame → violet flame.
const TIERS: Tier[] = [
  { min: 100, name: "violet", outer: ["#e879f9", "#7c3aed"], inner: ["#fdf4ff", "#f0abfc"], glow: "rgba(168, 85, 247, 0.45)" },
  { min: 30, name: "blue", outer: ["#7dd3fc", "#2563eb"], inner: ["#f0f9ff", "#93c5fd"], glow: "rgba(59, 130, 246, 0.45)" },
  { min: 7, name: "blaze", outer: ["#fb923c", "#dc2626"], inner: ["#fef9c3", "#fbbf24"], glow: "rgba(239, 68, 68, 0.4)" },
  { min: 3, name: "fire", outer: ["#fdba74", "#ea580c"], inner: ["#fefce8", "#fcd34d"], glow: "rgba(249, 115, 22, 0.4)" },
  { min: 1, name: "ember", outer: ["#fed7aa", "#f97316"], inner: ["#fffbeb", "#fde68a"], glow: "rgba(251, 146, 60, 0.35)" },
];

const OUTER_PATH =
  "M12 1.75c.55 2.9 2.2 4.6 3.9 6.35 1.95 2 3.85 4 3.85 7.35 0 4.15-3.4 6.8-7.75 6.8s-7.75-2.65-7.75-6.8c0-2.6 1.2-4.6 2.85-6.1.25 1.65 1.05 2.85 2.3 3.5-.3-4.15 1.05-8.05 2.6-11.1Z";
const INNER_PATH =
  "M12.1 11.2c.35 1.75 1.4 2.75 2.35 3.85.7.8 1.15 1.7 1.15 2.75 0 2-1.6 3.2-3.6 3.2s-3.6-1.2-3.6-3.2c0-1.35.65-2.4 1.55-3.15.2.85.65 1.45 1.3 1.75-.1-1.8.2-3.5.85-5.2Z";

function FlameIcon({ tier, className }: { tier: Tier | null; className?: string }) {
  if (!tier) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden>
        <path d={OUTER_PATH} />
      </svg>
    );
  }
  const id = `streak-${tier.name}`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-outer`} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={tier.outer[0]} />
          <stop offset="1" stopColor={tier.outer[1]} />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="12" y1="11" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={tier.inner[1]} />
          <stop offset="1" stopColor={tier.inner[0]} />
        </linearGradient>
      </defs>
      <path d={OUTER_PATH} fill={`url(#${id}-outer)`} />
      <path d={INNER_PATH} fill={`url(#${id}-inner)`} />
    </svg>
  );
}

export function StreakBadge({ streak, className }: { streak: Streak; className?: string }) {
  const tier = TIERS.find((t) => streak.days >= t.min) ?? null;
  const label =
    streak.days === 0
      ? "Sin racha. Estudia hoy para empezar una."
      : `Racha de ${streak.days} ${streak.days === 1 ? "día" : "días"}${streak.activeToday ? "" : ". Estudia hoy para mantenerla."}`;
  return (
    <Link
      href="/stats"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border bg-card pl-2.5 pr-3.5 text-sm font-semibold tabular-nums transition-colors hover:bg-muted",
        streak.days === 0 && "text-muted-foreground",
        className,
      )}
      style={tier && streak.activeToday ? { boxShadow: `0 0 18px -6px ${tier.glow}` } : undefined}
    >
      <FlameIcon
        tier={tier}
        className={cn("size-5", tier && streak.activeToday && "animate-flicker", tier && !streak.activeToday && "opacity-45 grayscale")}
      />
      {streak.days}
    </Link>
  );
}
