import { cn } from "@/lib/utils";

export function StudioMark({ className }: { className?: string }) {
  return (
    <span className={cn("font-normal tracking-tight", className)}>
      Fallxn<span className="font-bold">Studio</span>
    </span>
  );
}

export function BrandName({ className }: { className?: string }) {
  return (
    <span className={cn("flex flex-col leading-none", className)}>
      <span className="text-[15px] font-semibold tracking-tight">Flashcards</span>
      <span className="mt-0.5 text-[10px] font-normal tracking-normal text-muted-foreground">
        by <StudioMark />
      </span>
    </span>
  );
}
