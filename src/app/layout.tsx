import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SerwistProvider } from "@serwist/turbopack/react";
import { I18nProvider } from "@/lib/i18n/client";
import { getI18n } from "@/lib/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Flashcards";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    applicationName: APP_NAME,
    title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
    description: t.meta.description,
    appleWebApp: { capable: true, statusBarStyle: "default", title: APP_NAME },
    formatDetection: { telephone: false },
    icons: {
      icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#111110" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale } = await getI18n();
  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV !== "production"}>
          <I18nProvider locale={locale}>{children}</I18nProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
