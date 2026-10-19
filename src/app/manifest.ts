import type { MetadataRoute } from "next";
import { getI18n } from "@/lib/i18n/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { locale, t } = await getI18n();
  return {
    name: "Flashcards",
    short_name: "Flashcards",
    description: t.meta.description,
    id: "/",
    start_url: "/decks",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafaf9",
    theme_color: "#fafaf9",
    lang: locale,
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: t.meta.shortcutDecks, url: "/decks", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: t.meta.shortcutAddNote, url: "/notes/new", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
