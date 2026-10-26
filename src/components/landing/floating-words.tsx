import { cn } from "@/lib/utils";
import { cssVars, delay } from "./motion";

const WORDS = [
  { front: "serendipity", className: "right-[6%] top-[12%]", tilt: "7deg", drift: 0 },
  { front: "look after", className: "-right-6 top-[44%]", tilt: "-5deg", drift: -5000 },
  { front: "figure out", className: "right-[12%] bottom-[14%]", tilt: "4deg", drift: -8000 },
];

export function FloatingWords({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("absolute inset-0", className)}>
      {WORDS.map((word) => (
        <div
          key={word.front}
          className={cn(
            "animate-drift absolute flex h-24 w-44 flex-col items-center justify-center gap-2 rounded-2xl border bg-card shadow-sm",
            word.className,
          )}
          style={{ ...cssVars({ "--tilt": word.tilt }), ...delay(word.drift) }}
        >
          <span lang="en" className="text-base font-semibold tracking-tight">
            {word.front}
          </span>
          <span className="h-1 w-12 rounded-full bg-border" />
        </div>
      ))}
    </div>
  );
}
