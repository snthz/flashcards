import { cn } from "@/lib/utils";

const ratings = [
  ["10m", "Otra vez", "text-danger border-danger/40"],
  ["2d", "Difícil", "text-warning border-warning/40"],
  ["6d", "Bien", "text-success border-success/40"],
  ["12d", "Fácil", "text-info border-info/40"],
] as const;

export function CardPreview({ className }: { className?: string }) {
  return (
    <div className={cn("w-full max-w-md rounded-2xl border bg-card p-3 shadow-xl animate-in", className)}>
      <div className="flex items-center justify-between px-1 pb-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Idiomas::Inglés</span>
        <span className="flex gap-2 tabular-nums">
          <span className="text-info">12</span>
          <span className="text-danger">3</span>
          <span className="text-success">28</span>
        </span>
      </div>
      <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border bg-background px-6 py-8 text-center">
        <p className="text-2xl font-medium">ubiquitous</p>
        <div className="h-px w-16 bg-border" />
        <p className="text-lg text-muted-foreground">omnipresente, que está en todas partes</p>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {ratings.map(([interval, label, tone]) => (
          <div key={label} className={cn("flex flex-col items-center rounded-lg border py-2", tone)}>
            <span className="text-[11px] text-muted-foreground">{interval}</span>
            <span className="text-xs font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
