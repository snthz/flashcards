import { cn } from "@/lib/utils";

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return `${parts[0][0]}${last[0] ?? ""}`.toUpperCase();
}

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("flex shrink-0 select-none items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground", className)}>
      {initials(name)}
    </span>
  );
}
