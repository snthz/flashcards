"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsClient } from "@/lib/hooks/use-is-client";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const isClient = useIsClient();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!isClient || accepted || isStandalone()) return null;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!event && !isIos) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-accent-soft/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium">Instala la app</p>
        <p className="text-sm text-muted-foreground">
          {event
            ? "Accede más rápido y estudia a pantalla completa."
            : "En Safari toca Compartir y luego “Añadir a pantalla de inicio”."}
        </p>
      </div>
      {event ? (
        <Button
          size="sm"
          onClick={async () => {
            await event.prompt();
            const choice = await event.userChoice;
            if (choice.outcome === "accepted") setAccepted(true);
          }}
        >
          <Download className="size-4" />
          Instalar
        </Button>
      ) : (
        <Share className="size-5 text-accent" aria-hidden />
      )}
    </div>
  );
}
