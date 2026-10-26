import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { getI18n } from "@/lib/i18n/server";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Install } from "@/components/landing/install";
import { LandingMotion } from "@/components/landing/landing-motion";
import { Premade } from "@/components/landing/premade";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { absolute: t.meta.landingTitle },
    description: t.meta.landingDescription,
  };
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/decks");

  return (
    <div data-landing className="flex min-h-dvh flex-col overflow-x-clip">
      <LandingMotion />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Install />
        <Premade />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
