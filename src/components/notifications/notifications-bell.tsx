"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, CheckCheck, Flame } from "lucide-react";
import { Modal, SheetHandle } from "@/components/ui/dialog";
import { Menu } from "@/components/ui/menu";
import { useI18n } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/config";
import { loadNotifications, markNotificationsRead } from "@/lib/notifications/actions";
import type { NotificationData } from "@/lib/notifications/store";
import { cn } from "@/lib/utils";

const POLL_MS = 60_000;

type Feed = { items: NotificationData[]; unread: number };

const EMPTY: Feed = { items: [], unread: 0 };
const store = { feed: EMPTY, listeners: new Set<() => void>(), timer: 0 };

function publish(feed: Feed) {
  store.feed = feed;
  store.listeners.forEach((listener) => listener());
}

async function refresh() {
  const next = await loadNotifications().catch(() => null);
  if (next) publish(next);
}

function onVisible() {
  if (document.visibilityState === "visible") void refresh();
}

function subscribe(listener: () => void) {
  store.listeners.add(listener);
  if (store.listeners.size === 1) {
    void refresh();
    store.timer = window.setInterval(onVisible, POLL_MS);
    document.addEventListener("visibilitychange", onVisible);
  }
  return () => {
    store.listeners.delete(listener);
    if (store.listeners.size === 0) {
      window.clearInterval(store.timer);
      document.removeEventListener("visibilitychange", onVisible);
    }
  };
}

async function markRead(ids: string[] | null) {
  const current = store.feed;
  const target = (item: NotificationData) => ids === null || ids.includes(item.id);
  publish({
    items: current.items.map((item) => (target(item) ? { ...item, read: true } : item)),
    unread: Math.max(0, current.unread - current.items.filter((item) => target(item) && !item.read).length),
  });
  const next = await markNotificationsRead(ids).catch(() => null);
  if (next) publish(next);
}

function useFeed() {
  const feed = useSyncExternalStore(
    subscribe,
    () => store.feed,
    () => EMPTY,
  );
  return { feed, markRead };
}

function useRelativeTime() {
  const { locale, t } = useI18n();
  return useMemo(() => {
    const format = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: "auto", style: "short" });
    return (iso: string) => {
      const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
      const abs = Math.abs(seconds);
      if (abs < 60) return t.notifications.justNow;
      if (abs < 3600) return format.format(Math.round(seconds / 60), "minute");
      if (abs < 86_400) return format.format(Math.round(seconds / 3600), "hour");
      return format.format(Math.round(seconds / 86_400), "day");
    };
  }, [locale, t]);
}

function Badge({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span className={cn("absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white tabular-nums ring-2 ring-background", className)}>
      {count > 9 ? "9+" : count}
    </span>
  );
}

function FeedList({ feed, onOpen, onMarkAll, onClose }: { feed: Feed; onOpen: (item: NotificationData) => void; onMarkAll: () => void; onClose?: () => void }) {
  const t = useI18n().t.notifications;
  const ago = useRelativeTime();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold">{t.title}</h2>
          {feed.unread > 0 ? <span className="text-xs text-muted-foreground">{t.unread(feed.unread)}</span> : null}
        </div>
        {feed.unread > 0 ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMarkAll();
            }}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <CheckCheck className="size-3.5" />
            {t.markAllRead}
          </button>
        ) : null}
      </div>
      {feed.items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Bell className="size-5" />
          </span>
          <p className="text-sm font-medium">{t.empty}</p>
          <p className="max-w-60 text-xs text-muted-foreground">{t.emptyHint}</p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 pb-1.5">
          {feed.items.map((item) => {
            const Icon = item.kind === "study" ? Flame : CalendarDays;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => onOpen(item)}
                  className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
                >
                  <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", item.read ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground")}>
                    <Icon className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={cn("text-sm leading-snug", item.read ? "text-muted-foreground" : "font-medium text-foreground")}>{item.title}</span>
                    {item.body ? <span className="line-clamp-2 text-xs text-muted-foreground">{item.body}</span> : null}
                    <span className="text-[11px] text-muted-foreground/80">{ago(item.createdAt)}</span>
                  </span>
                  {item.read ? null : <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-danger" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="border-t px-4 py-2.5">
        <Link href="/agenda" onClick={onClose} className="text-xs font-medium text-muted-foreground hover:text-foreground">
          {t.agenda} →
        </Link>
      </div>
    </div>
  );
}

export function NotificationsMenu() {
  const t = useI18n().t.notifications;
  const router = useRouter();
  const { feed, markRead } = useFeed();
  return (
    <Menu
      label={t.open}
      contentClassName="mt-2 flex max-h-[min(32rem,calc(100dvh-6rem))] w-[22rem] flex-col p-0"
      trigger={(open) => (
        <span
          title={t.open}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            open && "bg-muted text-foreground",
          )}
        >
          <Bell className="size-[18px]" />
          <Badge count={feed.unread} className="-right-0.5 -top-0.5" />
        </span>
      )}
    >
      <FeedList
        feed={feed}
        onMarkAll={() => void markRead(null)}
        onOpen={(item) => {
          if (!item.read) void markRead([item.id]);
          router.push(item.url);
        }}
      />
    </Menu>
  );
}

export function NotificationsDockButton({ className, active }: { className: string; active?: boolean }) {
  const t = useI18n().t.notifications;
  const router = useRouter();
  const { feed, markRead } = useFeed();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-haspopup="dialog" aria-expanded={open} aria-label={t.open} onClick={() => setOpen(true)} className={className}>
        <span className="relative">
          <Bell className="size-5.5" strokeWidth={open || active ? 2.2 : 1.8} />
          <Badge count={feed.unread} className="-right-2 -top-1.5" />
        </span>
        <span>{t.short}</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} sheet className="h-[70dvh] max-h-[70dvh] flex-col overflow-hidden open:flex">
        <SheetHandle />
        <FeedList
          feed={feed}
          onClose={() => setOpen(false)}
          onMarkAll={() => void markRead(null)}
          onOpen={(item) => {
            if (!item.read) void markRead([item.id]);
            setOpen(false);
            router.push(item.url);
          }}
        />
      </Modal>
    </>
  );
}
