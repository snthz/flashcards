"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, ChevronDown, Compass, Dumbbell, Languages, Layers, LayoutGrid, LogOut, Search, Settings, Upload, X, type LucideIcon } from "lucide-react";
import { Menu, MenuLabel, MenuLink, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { logout } from "@/app/(auth)/actions";
import { forgetOfflineData } from "@/lib/study/offline/sync";
import { useI18n, useMessages } from "@/lib/i18n/client";
import type { Messages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import { BrandName } from "@/components/landing/studio-mark";
import { CommandMenu } from "./command-menu";

function navItems(t: Messages["nav"]) {
  return [
    { href: "/decks", label: t.decks, short: t.decks, icon: Layers },
    { href: "/discover", label: t.discover, short: t.discover, icon: Compass },
    { href: "/stats", label: t.stats, short: t.statsShort, icon: BarChart3 },
  ];
}

interface MoreItem {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}

function moreSections(t: Messages["nav"]): Array<{ label: string; items: MoreItem[] }> {
  return [
    {
      label: t.sectionStudy,
      items: [
        { href: "/practice", label: t.practice, hint: t.practiceHint, icon: Dumbbell },
        { href: "/browse", label: t.browse, hint: t.browseHint, icon: Search },
        { href: "/import", label: t.import, hint: t.importHint, icon: Upload },
      ],
    },
    {
      label: t.sectionLanguage,
      items: [
        { href: "/translate", label: t.translate, hint: t.translateHint, icon: Languages },
        { href: "/dictionary", label: t.dictionary, hint: t.dictionaryHint, icon: BookOpen },
      ],
    },
  ];
}

function settingsSection(t: Messages["nav"]) {
  return { label: t.sectionAccount, items: [{ href: "/settings", label: t.settings, hint: t.settingsHint, icon: Settings }] };
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return `${parts[0][0]}${last[0] ?? ""}`.toUpperCase();
}

function subscribeNothing() {
  return () => {};
}

function useIsMac() {
  return useSyncExternalStore(
    subscribeNothing,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => true,
  );
}

function place(marker: HTMLElement, target: HTMLElement, animate: boolean) {
  if (!animate) marker.style.transition = "none";
  marker.style.width = `${target.offsetWidth}px`;
  marker.style.transform = `translateX(${target.offsetLeft}px)`;
  marker.style.opacity = "1";
  if (!animate) {
    void marker.offsetWidth;
    marker.style.transition = "";
  }
}

function Brand() {
  return (
    <Link href="/decks" aria-label="Flashcards" className="group flex shrink-0 items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm transition-transform duration-500 ease-out group-hover:-rotate-12">
        <Layers className="size-4" />
      </span>
      <BrandName />
    </Link>
  );
}

function MoreRow({ item, active, onNavigate, menu = false }: { item: MoreItem; active: boolean; onNavigate?: () => void; menu?: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      role={menu ? "menuitem" : undefined}
      tabIndex={menu ? -1 : undefined}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className="group flex items-center gap-3 rounded-lg px-2 py-2 outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
          active ? "border-transparent bg-accent text-accent-foreground" : "bg-background text-muted-foreground group-hover:text-foreground",
        )}
      >
        <Icon className="size-[18px]" strokeWidth={1.9} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-foreground">{item.label}</span>
        <span className="truncate text-xs text-muted-foreground">{item.hint}</span>
      </span>
    </Link>
  );
}

function MoreMenu({ pathname, active, onHover }: { pathname: string; active: boolean; onHover: (target: HTMLElement) => void }) {
  const t = useMessages().nav;
  const mac = useIsMac();
  return (
    <div data-current={active || undefined} className="flex h-full items-center" onPointerEnter={(event) => onHover(event.currentTarget)}>
      <Menu
        align="left"
        label={t.moreLabel}
        triggerClassName="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        contentClassName="mt-3 w-[21rem] p-0"
        trigger={(open) => (
          <span
            className={cn(
              "relative flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors",
              active || open ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.more}
            <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
          </span>
        )}
      >
        <div className="flex flex-col p-1.5">
          {moreSections(t).map((section) => (
            <div key={section.label} role="group" aria-label={section.label}>
              <MenuLabel>{section.label}</MenuLabel>
              {section.items.map((item) => (
                <MoreRow key={item.href} item={item} active={isActive(pathname, item.href)} menu />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span>{t.moreFooter}</span>
          <kbd className="rounded border bg-card px-1.5 py-0.5 font-sans text-[11px] font-medium text-foreground">{mac ? "⌘K" : "Ctrl K"}</kbd>
        </div>
      </Menu>
    </div>
  );
}

function Links({ pathname }: { pathname: string }) {
  const { locale, t } = useI18n();
  const links = navItems(t.nav);
  const moreActive = moreSections(t.nav).some((section) => section.items.some((item) => isActive(pathname, item.href)));
  const list = useRef<HTMLDivElement>(null);
  const underline = useRef<HTMLSpanElement>(null);
  const hover = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  const syncUnderline = useCallback((animate: boolean) => {
    const marker = underline.current;
    const target = list.current?.querySelector<HTMLElement>("[data-current]");
    if (!marker) return;
    if (!target) {
      marker.style.opacity = "0";
      return;
    }
    place(marker, target, animate);
  }, []);

  useLayoutEffect(() => {
    syncUnderline(placed.current);
    placed.current = true;
  }, [pathname, locale, syncUnderline]);

  useEffect(() => {
    const node = list.current;
    if (!node) return;
    const observer = new ResizeObserver(() => syncUnderline(false));
    observer.observe(node);
    return () => observer.disconnect();
  }, [syncUnderline]);

  const showHover = (target: HTMLElement) => {
    const marker = hover.current;
    if (marker) place(marker, target, marker.style.opacity === "1");
  };

  const hideHover = () => {
    if (hover.current) hover.current.style.opacity = "0";
  };

  return (
    <nav aria-label={t.nav.primary} className="flex h-full items-center">
      <div ref={list} onPointerLeave={hideHover} className="relative flex h-full items-center">
        <span
          ref={hover}
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 h-8 -translate-y-1/2 rounded-md bg-muted opacity-0 transition-[transform,width,opacity] duration-200 ease-out"
        />
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              data-current={active || undefined}
              onPointerEnter={(event) => showHover(event.currentTarget)}
              onFocus={(event) => showHover(event.currentTarget)}
              onBlur={hideHover}
              className={cn(
                "relative px-3 py-1.5 text-sm font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          );
        })}
        <MoreMenu pathname={pathname} active={moreActive} onHover={showHover} />
        <span
          ref={underline}
          aria-hidden
          className="pointer-events-none absolute -bottom-px left-0 h-0.5 rounded-full bg-foreground opacity-0 transition-[transform,width,opacity] duration-300 ease-out"
        />
      </div>
    </nav>
  );
}

function SearchButton({ onOpen }: { onOpen: () => void }) {
  const t = useMessages().nav;
  const mac = useIsMac();
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t.searchLabel}
      aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
      className="flex h-9 items-center gap-2 rounded-lg border bg-card px-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground lg:w-60"
    >
      <Search className="size-4 shrink-0" />
      <span className="hidden flex-1 text-left lg:block">{t.search}</span>
      <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium lg:block">
        {mac ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}

function UserMenu({ name, email, settingsActive }: { name: string; email: string; settingsActive: boolean }) {
  const [pending, startTransition] = useTransition();
  const { t } = useI18n();
  return (
    <Menu
      className="shrink-0"
      contentClassName="mt-2 w-64"
      trigger={
        <span
          aria-label={t.nav.account}
          className={cn(
            "flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-border",
            settingsActive && "ring-2 ring-foreground/30",
            pending && "opacity-60",
          )}
        >
          {initials(name)}
        </span>
      }
    >
      <div className="flex items-center gap-3 px-2.5 py-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {initials(name)}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="truncate text-xs text-muted-foreground">{email}</span>
        </span>
      </div>
      <MenuSeparator />
      <MenuLink href="/settings" icon={<Settings />}>
        {t.nav.settings}
      </MenuLink>
      <MenuLink href="/import" icon={<Upload />}>
        {t.nav.import}
      </MenuLink>
      <MenuSeparator />
      <div className="flex items-center justify-between gap-3 px-2.5 py-1.5 text-sm" onClick={(event) => event.stopPropagation()}>
        <span className="text-muted-foreground">{t.landing.language}</span>
        <LanguageSwitcher label={t.landing.language} size="sm" />
      </div>
      <MenuSeparator />
      <MenuItem
        tone="danger"
        icon={<LogOut />}
        onSelect={() =>
          startTransition(async () => {
            await forgetOfflineData();
            await logout();
          })
        }
      >
        {t.nav.logout}
      </MenuItem>
    </Menu>
  );
}

export function TopNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setSearching((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="safe-top sticky top-0 z-20 hidden border-b bg-background/80 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-5 px-6">
        <Brand />
        <span aria-hidden className="h-5 w-px bg-border" />
        <Links pathname={pathname} />
        <div className="ml-auto flex items-center gap-3">
          <SearchButton onOpen={() => setSearching(true)} />
          <UserMenu name={name} email={email} settingsActive={isActive(pathname, "/settings")} />
        </div>
      </div>
      <CommandMenu open={searching} onClose={() => setSearching(false)} />
    </header>
  );
}

function MoreSheet({ open, pathname, onClose }: { open: boolean; pathname: string; onClose: () => void }) {
  const t = useMessages().nav;
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <button type="button" aria-label={t.moreLabel} tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t.moreLabel}
        className="sheet-up absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col overflow-y-auto rounded-t-2xl border-t bg-card pb-[max(1rem,var(--safe-bottom))] shadow-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between bg-card px-4 pb-1 pt-2">
          <span aria-hidden className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-border" />
          <h2 className="pt-4 text-base font-semibold">{t.more}</h2>
          <button type="button" onClick={onClose} aria-label={t.moreLabel} className="mt-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <nav aria-label={t.moreLabel} className="flex flex-col px-2">
          {[...moreSections(t), settingsSection(t)].map((section) => (
            <div key={section.label} role="group" aria-label={section.label}>
              <MenuLabel>{section.label}</MenuLabel>
              {section.items.map((item) => (
                <MoreRow key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onClose} />
              ))}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const t = useMessages().nav;
  const [sheet, setSheet] = useState<string | null>(null);
  const closeSheet = useCallback(() => setSheet(null), []);
  const sheetOpen = sheet === pathname;
  if (pathname.includes("/study")) return null;
  const items = navItems(t);
  const more = [...moreSections(t), settingsSection(t)].some((section) => section.items.some((item) => isActive(pathname, item.href)));
  const primary = items.findIndex((item) => isActive(pathname, item.href));
  const index = sheetOpen || more ? items.length : primary;
  const cell = "relative flex flex-col items-center gap-1 pt-2 text-[11px] font-medium transition-transform active:scale-95";
  const icon = (active: boolean) => cn("flex h-7 w-12 items-center justify-center transition-colors", active ? "text-foreground" : "text-muted-foreground");
  const caption = (active: boolean) => cn("transition-colors", active ? "text-foreground" : "text-muted-foreground");
  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/85 backdrop-blur-xl safe-bottom md:hidden">
        <div className="relative mx-auto grid max-w-md grid-cols-4">
          {index >= 0 ? (
            <span
              aria-hidden
              className="absolute left-0 top-2 flex h-7 w-1/4 justify-center transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${index * 100}%)` }}
            >
              <span className="h-full w-12 rounded-full bg-accent-soft" />
            </span>
          ) : null}
          {items.map((item) => {
            const active = isActive(pathname, item.href) && !sheetOpen;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cell}>
                <span className={icon(active)}>
                  <Icon className="size-5" strokeWidth={active ? 2.3 : 1.9} />
                </span>
                <span className={caption(active)}>{item.short}</span>
              </Link>
            );
          })}
          <button type="button" aria-haspopup="dialog" aria-expanded={sheetOpen} onClick={() => setSheet(sheetOpen ? null : pathname)} className={cell}>
            <span className={icon(more || sheetOpen)}>
              <LayoutGrid className="size-5" strokeWidth={more || sheetOpen ? 2.3 : 1.9} />
            </span>
            <span className={caption(more || sheetOpen)}>{t.more}</span>
          </button>
        </div>
      </nav>
      <MoreSheet open={sheetOpen} pathname={pathname} onClose={closeSheet} />
    </>
  );
}
