/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import { CacheFirst, ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/media/"),
      handler: new CacheFirst({
        cacheName: "fc-media",
        plugins: [new ExpirationPlugin({ maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 90, maxAgeFrom: "last-used" })],
      }),
    },
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && (url.pathname.startsWith("/api/export") || url.pathname.startsWith("/api/study/")),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({ cacheName: "fc-api", networkTimeoutSeconds: 10 }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

interface PushMessage {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
}

self.addEventListener("push", (event) => {
  let message: PushMessage = {};
  try {
    message = event.data?.json() ?? {};
  } catch {
    message = { body: event.data?.text() };
  }
  event.waitUntil(
    self.registration.showNotification(message.title ?? "Flashcards", {
      body: message.body,
      icon: "/icons/icon-192.png",
      tag: message.tag ?? "flashcards",
      renotify: true,
      data: { url: message.url ?? "/decks" },
    } as NotificationOptions),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data as { url?: string } | null)?.url ?? "/decks", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (existing) {
        await existing.focus();
        if ("navigate" in existing) await existing.navigate(target).catch(() => null);
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});
