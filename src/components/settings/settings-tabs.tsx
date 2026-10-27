"use client";

import { useId, useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap, Languages, ShieldCheck, UserRound } from "lucide-react";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", icon: UserRound },
  { id: "study", icon: GraduationCap },
  { id: "translator", icon: Languages },
  { id: "account", icon: ShieldCheck },
] as const;

export type SettingsTab = (typeof TABS)[number]["id"];

function isTab(value: string | null): value is SettingsTab {
  return TABS.some((tab) => tab.id === value);
}

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function SettingsTabs({ panels }: { panels: Record<SettingsTab, ReactNode> }) {
  const t = useMessages().settings;
  const id = useId();
  const params = useSearchParams();
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const requested = params.get("tab");
  const active: SettingsTab = isTab(requested) ? requested : isTab(hash) ? hash : "profile";

  const select = (tab: SettingsTab) => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    url.hash = "";
    window.history.replaceState(null, "", url);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((tab) => tab.id === active);
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    const next = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : step ? (index + step + TABS.length) % TABS.length : -1;
    if (next < 0) return;
    event.preventDefault();
    select(TABS[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
      <div
        role="tablist"
        aria-label={t.tabsLabel}
        onKeyDown={onKeyDown}
        className="grid grid-cols-4 gap-1 rounded-xl border bg-card p-1 md:sticky md:top-24 md:flex md:w-52 md:shrink-0 md:flex-col md:border-0 md:bg-transparent md:p-0"
      >
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${id}-${tab.id}-tab`}
              aria-selected={selected}
              aria-controls={`${id}-${tab.id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-xs transition-colors md:flex-row md:gap-2.5 md:px-3 md:text-sm",
                selected ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={selected ? 2.2 : 1.9} />
              <span className="max-w-full truncate">{t.tabs[tab.id]}</span>
            </button>
          );
        })}
      </div>
      <div className="min-w-0 flex-1">
        {TABS.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${id}-${tab.id}-panel`}
            aria-labelledby={`${id}-${tab.id}-tab`}
            hidden={tab.id !== active}
            className="flex flex-col gap-6"
          >
            {panels[tab.id]}
          </div>
        ))}
      </div>
    </div>
  );
}
