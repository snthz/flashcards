import { cn } from "@/lib/utils";

interface SectionIntroProps {
  label: string;
  title: string;
  lead?: string;
  className?: string;
}

export function StackGlyph({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-block size-3.5 shrink-0", className)}>
      <span className="absolute inset-0 translate-x-[3px] -translate-y-[3px] rounded-[3px] border border-foreground/35" />
      <span className="absolute inset-0 rounded-[3px] bg-foreground" />
    </span>
  );
}

export function SectionIntro({ label, title, lead, className }: SectionIntroProps) {
  return (
    <div data-reveal className={cn("flex max-w-2xl flex-col gap-3", className)}>
      <span className="mb-2 inline-flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
        <StackGlyph />
        {label}
      </span>
      <h2 className="text-3xl font-semibold leading-[1.08] tracking-tight text-balance md:text-5xl">{title}</h2>
      {lead ? <p className="text-lg leading-relaxed text-muted-foreground text-pretty">{lead}</p> : null}
    </div>
  );
}
