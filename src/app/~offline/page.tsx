import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { getMessages } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.offline.title };
}

export default async function OfflinePage() {
  const t = await getMessages();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <WifiOff className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">{t.offline.title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t.offline.body}
      </p>
    </main>
  );
}
