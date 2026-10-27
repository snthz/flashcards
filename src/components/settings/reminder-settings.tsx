"use client";

import { useEffect, useState, useTransition } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { deletePushSubscription, savePushSubscription, saveReminderHour, saveReminderNudges, sendTestReminder } from "@/app/(app)/settings/actions";
import { useI18n } from "@/lib/i18n/client";

type Support = "checking" | "unsupported" | "install" | "denied" | "ready";

const hours = Array.from({ length: 24 }, (_, i) => i);
const READY_TIMEOUT_MS = 10_000;

function keyBytes(base64: string) {
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function registration() {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), READY_TIMEOUT_MS)),
  ]);
}

function detectSupport(): Support {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return ios ? "install" : "unsupported";
  }
  return Notification.permission === "denied" ? "denied" : "ready";
}

export function ReminderSettings({ publicKey, initialHour, initialNudges }: { publicKey: string | null; initialHour: number | null; initialNudges: boolean }) {
  const { t } = useI18n();
  const s = t.settings;
  const [support, setSupport] = useState<Support>("checking");
  const [subscribed, setSubscribed] = useState(false);
  const [hour, setHour] = useState(initialHour ?? 19);
  const [nudges, setNudges] = useState(initialNudges);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const detected = detectSupport();
      let active = false;
      if (detected === "ready") {
        const existing = await navigator.serviceWorker.getRegistration();
        active = Boolean(await existing?.pushManager.getSubscription()) && initialHour != null;
      }
      if (cancelled) return;
      setSupport(detected);
      setSubscribed(active);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialHour]);

  const time = `${String(hour).padStart(2, "0")}:00`;

  const enable = () =>
    startTransition(async () => {
      setMessage(null);
      if (!publicKey) return;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setSupport(permission === "denied" ? "denied" : "ready");
        return;
      }
      try {
        const reg = await registration();
        if (!reg) throw new Error("no service worker");
        const subscription =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) }));
        const saved = await savePushSubscription(subscription.toJSON());
        if (!saved.ok) throw new Error("subscription rejected");
        await saveReminderHour(hour);
        setSubscribed(true);
      } catch {
        setMessage(s.pushFailed);
      }
    });

  const disable = () =>
    startTransition(async () => {
      setMessage(null);
      const reg = await navigator.serviceWorker.getRegistration();
      const subscription = await reg?.pushManager.getSubscription();
      if (subscription) {
        await deletePushSubscription(subscription.endpoint);
        await subscription.unsubscribe().catch(() => false);
      }
      setSubscribed(false);
    });

  const changeHour = (value: number) => {
    setHour(value);
    if (subscribed) startTransition(() => saveReminderHour(value));
  };

  const test = () =>
    startTransition(async () => {
      const result = await sendTestReminder();
      setMessage(result.sent > 0 ? s.testSent : s.testNone);
    });

  if (!publicKey) return <p className="text-sm text-muted-foreground">{s.pushNotConfigured}</p>;
  if (support === "checking") return <div className="skeleton h-10 w-full rounded-lg" />;
  if (support === "unsupported") return <p className="text-sm text-muted-foreground">{s.pushUnsupported}</p>;
  if (support === "install") return <p className="text-sm text-muted-foreground">{s.pushInstallFirst}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox
            checked={subscribed}
            disabled={pending || support === "denied"}
            onChange={(event) => (event.target.checked ? enable() : disable())}
          />
          <span className="text-sm font-medium">{s.reminderToggle}</span>
        </label>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="reminder-hour" className="text-muted-foreground">
            {s.reminderTime}
          </label>
          <div className="w-28">
            <Select
              id="reminder-hour"
              value={String(hour)}
              onChange={(value) => changeHour(Number(value))}
              disabled={pending}
              options={hours.map((value) => ({ value: String(value), label: `${String(value).padStart(2, "0")}:00` }))}
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {support === "denied" ? s.pushDenied : subscribed ? s.reminderOn(time) : s.reminderOff}
      </p>
      {subscribed ? (
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={nudges}
            disabled={pending}
            onChange={(event) => {
              const value = event.target.checked;
              setNudges(value);
              startTransition(() => saveReminderNudges(value));
            }}
            className="mt-0.5"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{s.reminderNudges}</span>
            <span className="text-xs text-muted-foreground">{s.reminderNudgesHint}</span>
          </span>
        </label>
      ) : null}
      {subscribed ? (
        <div>
          <Button variant="secondary" size="sm" onClick={test} loading={pending}>
            {pending ? null : <BellRing className="size-4" />}
            {s.sendTest}
          </Button>
        </div>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
