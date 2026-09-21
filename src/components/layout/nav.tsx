"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Layers, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/decks", label: "Mazos", icon: Layers },
  { href: "/browse", label: "Explorar", icon: Search },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/settings", label: "Ajustes", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav({ name }: { name: string }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 hidden border-b bg-background/80 backdrop-blur md:block">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/decks" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Layers className="size-4" />
          </span>
          Flashcards
        </Link>
        <nav className="flex items-center gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(pathname, item.href) ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="max-w-40 truncate text-sm text-muted-foreground">{name}</span>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.includes("/study")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 backdrop-blur safe-bottom md:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
                active ? "text-accent" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
