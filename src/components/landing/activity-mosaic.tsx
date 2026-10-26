import { delay } from "./motion";

const WEEKS = 30;
const FILLS = ["var(--viz-empty)", "var(--viz-seq-1)", "var(--viz-seq-2)", "var(--viz-seq-3)", "var(--viz-seq-4)"];

function level(week: number, day: number) {
  const noise = Math.sin((week * 7 + day + 1) * 12.9898) * 43758.5453;
  const value = (noise - Math.floor(noise)) * 0.75 + (week / WEEKS) * 0.45 - (day >= 5 ? 0.18 : 0);
  if (value < 0.3) return 0;
  if (value < 0.5) return 1;
  if (value < 0.68) return 2;
  if (value < 0.85) return 3;
  return 4;
}

export function ActivityMosaic({ less, more }: { less: string; more: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end gap-[3px] overflow-hidden">
        {Array.from({ length: WEEKS }, (_, week) => (
          <div key={week} className="flex shrink-0 flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, day) => (
              <span
                key={day}
                className="mosaic-cell size-3 rounded-[3px]"
                style={{ backgroundColor: FILLS[level(week, day)], ...delay(week * 24 + day * 12) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        {less}
        {FILLS.map((fill) => (
          <span key={fill} className="size-2.5 rounded-[3px]" style={{ backgroundColor: fill }} />
        ))}
        {more}
      </div>
    </div>
  );
}
