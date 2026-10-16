"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronDown, Layers, LogOut, Search, Settings } from "lucide-react";
import { Menu, MenuLink, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { logout } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

const items = [
  { href: "/decks", label: "Mazos", short: "Mazos", icon: Layers },
  { href: "/browse", label: "Explorar", short: "Explorar", icon: Search },
  { href: "/stats", label: "Estadísticas", short: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Ajustes", short: "Ajustes", icon: Settings },
] as const;

const tabs = items.slice(0, 3);

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return `${parts[0][0]}${last[0] ?? ""}`.toUpperCase();
}

function Brand() {
  return (
    <Link href="/decks" className="flex shrink-0 items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm">
        <Layers className="size-4" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Flashcards</span>
    </Link>
  );
}

function Tabs({ pathname }: { pathname: string }) {
  const index = tabs.findIndex((tab) => isActive(pathname, tab.href));
  return (
    <nav className="relative grid auto-cols-fr grid-flow-col rounded-full border bg-muted/70 p-1">
      {index >= 0 ? (
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 rounded-full border bg-card shadow-sm transition-transform duration-300 ease-out"
          style={{ width: `calc((100% - 0.5rem) / ${tabs.length})`, transform: `translateX(${index * 100}%)` }}
        />
      ) : null}
      {tabs.map((tab) => {
        const active = index >= 0 && tabs[index].href === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" strokeWidth={active ? 2.2 : 1.9} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu({ name, settingsActive }: { name: string; settingsActive: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Menu
      className="shrink-0"
      trigger={
        <span
          className={cn(
            "flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-2.5 text-sm transition-colors hover:bg-muted",
            settingsActive && "ring-2 ring-ring",
            pending && "opacity-60",
          )}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
            {initials(name)}
          </span>
          <span className="max-w-28 truncate font-medium">{name}</span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </span>
      }
    >
      <p className="truncate px-2.5 py-2 text-xs text-muted-foreground">Sesión de {name}</p>
      <MenuSeparator />
      <MenuLink href="/settings" icon={<Settings />}>
        Ajustes
      </MenuLink>
      <MenuSeparator />
      <MenuItem tone="danger" icon={<LogOut />} onSelect={() => startTransition(() => logout())}>
        Cerrar sesión
      </MenuItem>
    </Menu>
  );
}

export function TopNav({ name }: { name: string }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 hidden border-b bg-background/75 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-6 px-6">
        <Brand />
        <Tabs pathname={pathname} />
        <UserMenu name={name} settingsActive={isActive(pathname, "/settings")} />
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.includes("/study")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/85 backdrop-blur-xl safe-bottom md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-1 pt-2 text-[11px] font-medium"
            >
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                  active ? "bg-accent-soft text-accent" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.3 : 1.9} />
              </span>
              <span className={active ? "text-foreground" : "text-muted-foreground"}>{item.short}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
