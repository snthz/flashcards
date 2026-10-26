import type { Metadata } from "next";
import { OfflineHome } from "@/components/offline/offline-home";
import { getMessages } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.offline.title };
}

export default function OfflinePage() {
  return <OfflineHome />;
}
