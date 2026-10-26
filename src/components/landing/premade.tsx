import Link from "next/link";
import { ArrowRight, RotateCw } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { PREMADE_DECKS } from "@/lib/premade/catalog";
import type { PremadeSample } from "@/lib/premade/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "./count-up";
import { delay } from "./motion";
import { SectionIntro } from "./section-intro";

function FlipCard({ sample, offset }: { sample: PremadeSample; offset: number }) {
  return (
    <div aria-hidden className="h-32 perspective-distant">
      <div
        className="flip-auto relative h-full transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] transform-3d group-hover:rotate-y-180"
        style={delay(offset)}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl border bg-background backface-hidden">
          <span lang="en" className="text-2xl font-semibold tracking-tight">
            {sample.front}
          </span>
          <RotateCw className="size-3.5 text-muted-foreground" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl border bg-accent px-6 text-center text-accent-foreground rotate-y-180 backface-hidden">
          <span className="text-lg font-medium">{sample.back}</span>
        </div>
      </div>
    </div>
  );
}

export async function Premade() {
  const { locale, t } = await getI18n();
  const l = t.landing;
  if (PREMADE_DECKS.length === 0) return null;

  return (
    <section className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-24 md:px-6 md:py-32">
        <SectionIntro label={l.premadeLabel} title={l.premadeTitle} lead={l.premadeLead} />
        <div className={cn("grid gap-5", PREMADE_DECKS.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
          {PREMADE_DECKS.map((deck, index) => {
            const text = deck.text[locale];
            const [featured, ...samples] = deck.samples;
            return (
              <div key={deck.slug} data-reveal style={delay(index * 140)}>
                <Link
                  href="/register"
                  data-spotlight
                  className="spotlight group flex h-full flex-col gap-6 rounded-3xl border bg-card p-6 shadow-sm transition-[translate,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-xl font-semibold tracking-tight">{deck.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{text.summary}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end">
                      <span className="text-3xl font-semibold tracking-tight">
                        <CountUp value={deck.cardCount} />
                      </span>
                      <span className="text-xs text-muted-foreground">{l.premadeCardsUnit}</span>
                    </div>
                  </div>
                  {featured ? <FlipCard sample={featured} offset={index * -3500} /> : null}
                  <ul className="flex flex-wrap gap-1.5" lang="en">
                    {samples.map((sample) => (
                      <li key={sample.front} className="rounded-full border bg-background px-2.5 py-1 text-xs">
                        {sample.front}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                    <span className="flex flex-wrap gap-1.5">
                      <Badge>{text.languages}</Badge>
                      <Badge>{text.level}</Badge>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      {l.premadeCta}
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
