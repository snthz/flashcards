import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Layers, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/user";
import { getI18n } from "@/lib/i18n/server";
import { PREMADE_DECKS } from "@/lib/premade/catalog";
import { formatNumber } from "@/lib/utils";
import { buttonStyles } from "@/components/ui/button";
import { ReviewDemo } from "@/components/landing/review-demo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { absolute: t.meta.landingTitle },
    description: t.meta.landingDescription,
  };
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm">
        <Layers className="size-4" />
      </span>
      Flashcards
    </Link>
  );
}

function Steps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <h3 className="font-medium">{title}</h3>
      <ol className="flex flex-col gap-3 text-sm">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="w-4 shrink-0 font-mono text-muted-foreground tabular-nums">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/decks");
  const { locale, t } = await getI18n();
  const l = t.landing;
  const premade = PREMADE_DECKS[0];
  const premadeCount = premade ? formatNumber(premade.cardCount, locale) : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="safe-top sticky top-0 z-20 border-b bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
          <Brand />
          <nav className="flex items-center gap-2">
            <div className="mr-1 hidden sm:block">
              <LanguageSwitcher label={l.language} size="sm" />
            </div>
            <Link href="/login" className={buttonStyles("ghost", "sm", "whitespace-nowrap")}>
              {l.login}
            </Link>
            <Link href="/register" className={buttonStyles("primary", "sm", "whitespace-nowrap")}>
              {l.signup}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-5xl items-center gap-12 px-4 pb-20 pt-14 md:grid-cols-[1.1fr_1fr] md:px-6 md:pb-28 md:pt-24">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-pretty md:text-[3.25rem]">{l.heading}</h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">{l.lead}</p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link href="/register" className={buttonStyles("primary", "lg")}>
                {l.ctaPrimary}
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className={buttonStyles("outline", "lg")}>
                {l.ctaSecondary}
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {l.fineprint.map((item, index) => (
                <li key={item} className="flex items-center gap-4">
                  {index > 0 ? <span aria-hidden className="size-1 rounded-full bg-border" /> : null}
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ReviewDemo />
            <p className="text-xs text-muted-foreground">{l.demo.label}</p>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-16 md:grid-cols-[1fr_1.6fr] md:gap-16 md:px-6 md:py-20">
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{l.carryTitle}</h2>
              <p className="text-muted-foreground">{l.carryLead}</p>
            </div>
            <dl className="divide-y border-y">
              {l.carry.map((row) => (
                <div key={row.term} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="font-medium">{row.term}</dt>
                  <dd className="text-muted-foreground">{row.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 md:px-6 md:py-20">
            <div className="flex max-w-xl flex-col gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{l.installTitle}</h2>
              <p className="text-muted-foreground">{l.installLead}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Steps title={l.installIosTitle} steps={l.installIosSteps} />
              <Steps title={l.installAndroidTitle} steps={l.installAndroidSteps} />
            </div>
          </div>
        </section>

        {premade && premadeCount ? (
          <section className="border-t">
            <div className="mx-auto grid w-full max-w-5xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:px-6 md:py-20">
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-semibold tracking-tight">{l.premadeTitle}</h2>
                <p className="text-muted-foreground">{l.premadeLead}</p>
              </div>
              <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-medium">{l.premadeName}</h3>
                  <span className="text-sm text-muted-foreground tabular-nums">{l.premadeCards(premadeCount)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{l.premadeDetail(premadeCount)}</p>
                <ul className="flex flex-wrap gap-1.5" lang="en">
                  {premade.samples.map((sample) => (
                    <li key={sample.front} className="rounded-md border bg-background px-2 py-1 text-xs">
                      {sample.front}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-t">
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-16 md:grid-cols-[1fr_1.6fr] md:gap-16 md:px-6 md:py-20">
            <h2 className="text-2xl font-semibold tracking-tight">{l.faqTitle}</h2>
            <div className="divide-y border-y">
              {l.faq.map((item) => (
                <details key={item.q} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <Plus className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="pb-4 pr-8 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-4 py-16 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex flex-col gap-1">
              <p className="text-xl font-semibold tracking-tight">{l.finalTitle}</p>
              <p className="text-muted-foreground">{l.finalLead}</p>
            </div>
            <Link href="/register" className={buttonStyles("primary", "lg")}>
              {l.finalCta}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <span>{l.footerNote}</span>
          <LanguageSwitcher label={l.language} size="sm" className="self-start md:self-auto" />
        </div>
      </footer>
    </div>
  );
}
