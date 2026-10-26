import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarClock, Check, Layers, MonitorSmartphone, Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/user";
import { getMessages } from "@/lib/i18n/server";
import { Brand } from "@/components/landing/brand";
import { CreditLine } from "@/components/landing/credits";
import { FloatingWords } from "@/components/landing/floating-words";
import { delay } from "@/components/landing/motion";
import { ReviewDemo } from "@/components/landing/review-demo";
import { StatusBarScrim } from "@/components/layout/status-bar-scrim";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

const HIGHLIGHT_ICONS = [Package, CalendarClock, MonitorSmartphone];

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (user) redirect("/decks");
  const messages = await getMessages();
  const t = messages.auth;
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <StatusBarScrim />
      <aside className="relative isolate hidden overflow-hidden border-r bg-muted/50 lg:flex lg:flex-col lg:justify-between lg:gap-10 lg:p-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <FloatingWords className="hidden xl:block" />
        </div>

        <div className="animate-rise">
          <Brand />
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="max-w-md animate-rise text-4xl font-semibold leading-[1.05] tracking-tight text-balance" style={delay(100)}>
              {t.asideHeading}
            </h2>
            <p className="max-w-md animate-rise leading-relaxed text-muted-foreground" style={delay(200)}>
              {t.asideLead}
            </p>
          </div>
          <div className="animate-rise" style={delay(300)}>
            <ReviewDemo className="max-w-sm" />
          </div>
          <ul className="flex flex-col gap-3 text-sm [@media(max-height:880px)]:hidden">
            {t.highlights.map((item, index) => {
              const Icon = HIGHLIGHT_ICONS[index] ?? Check;
              return (
                <li key={index} className="flex animate-rise items-center gap-3" style={delay(500 + index * 100)}>
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  {item}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex animate-rise items-end justify-between gap-6 text-xs text-muted-foreground" style={delay(800)}>
          <span>{t.asideFooter}</span>
          <CreditLine className="text-right" />
        </div>
      </aside>

      <main className="flex flex-col px-5 pb-6 pt-[calc(1.5rem_+_var(--safe-top))] sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {t.home}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight lg:hidden">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm">
                <Layers className="size-4" />
              </span>
              <span className="hidden sm:inline">Flashcards</span>
            </Link>
            <LanguageSwitcher label={messages.landing.language} size="sm" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <CreditLine className="text-center text-xs text-muted-foreground lg:hidden" />
      </main>
    </div>
  );
}
