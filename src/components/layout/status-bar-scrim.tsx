import { cn } from "@/lib/utils";

export function StatusBarScrim({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-x-0 top-0 z-40 h-[var(--safe-top)] bg-background/75 backdrop-blur-xl", className)}
    />
  );
}
