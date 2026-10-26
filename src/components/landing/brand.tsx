import Link from "next/link";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5 text-[15px] font-semibold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm transition-transform duration-500 ease-out group-hover:-rotate-12 group-hover:scale-105">
        <Layers className="size-4" />
      </span>
      Flashcards
    </Link>
  );
}
