import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { PATTERN_GROUPS } from "@/lib/premade/irregular-verbs";
import { PHRASAL_GROUPS } from "@/lib/premade/phrasal-verbs";
import { buttonStyles } from "@/components/ui/button";
import { delay } from "./motion";
import { ReviewDemo } from "./review-demo";
import { WordMarquee } from "./word-marquee";
import { WordRotator } from "./word-rotator";

const WORD_STEP_MS = 70;

function firstMeaning(text: string) {
  return text.split(";")[0].trim();
}

export async function Hero() {
  const { locale, t } = await getI18n();
  const l = t.landing;
  const words = l.headingTop.split(" ");
  const afterHeading = 120 + words.length * WORD_STEP_MS;
  const phrasal = PHRASAL_GROUPS.flatMap((group) => group.verbs.slice(0, 2))
    .slice(0, 18)
    .map(([verb, translation, definition]) => ({ front: verb, back: firstMeaning(locale === "es" ? translation : definition) }));
  const irregular = PATTERN_GROUPS.flatMap((group) => group.verbs.slice(0, 4))
    .slice(0, 18)
    .map(([base, past, participle]) => ({ front: base, back: `${past} · ${participle}` }));

  return (
    <section>
      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-4 pb-20 pt-14 md:px-6 md:pb-24 md:pt-24 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <div className="flex flex-col items-start gap-7">
          <h1 className="text-[2.3rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-[3.4rem] xl:text-[3.75rem]">
            <span className="sr-only">{l.heading}</span>
            <span aria-hidden className="block">
              {words.map((word, index) => (
                <Fragment key={`${word}-${index}`}>
                  <span className="inline-block animate-rise" style={delay(120 + index * WORD_STEP_MS)}>
                    {word}
                  </span>{" "}
                </Fragment>
              ))}
            </span>
            <span aria-hidden className="block text-muted-foreground">
              <span className="inline-block animate-rise" style={delay(afterHeading)}>
                {l.headingBottom}
              </span>{" "}
              <span className="inline-block animate-rise text-foreground" style={delay(afterHeading + WORD_STEP_MS)}>
                <WordRotator words={l.headingDevices} />
              </span>
            </span>
          </h1>

          <p className="max-w-xl animate-rise text-lg leading-relaxed text-muted-foreground text-pretty" style={delay(afterHeading + 150)}>
            {l.lead}
          </p>

          <div className="flex w-full animate-rise flex-col gap-3 sm:w-auto sm:flex-row" style={delay(afterHeading + 250)}>
            <Link href="/register" className={buttonStyles("primary", "lg", "group")}>
              {l.ctaPrimary}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className={buttonStyles("outline", "lg")}>
              {l.ctaSecondary}
            </Link>
          </div>

          <ul className="flex animate-rise flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground" style={delay(afterHeading + 350)}>
            {l.fineprint.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-foreground" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex w-full animate-rise justify-center" style={delay(300)}>
            <ReviewDemo />
          </div>
          <p className="animate-rise text-xs text-muted-foreground" style={delay(700)}>
            {l.demo.label}
            <span className="hidden lg:inline"> · {l.demo.keys}</span>
          </p>
        </div>
      </div>

      <div aria-hidden className="flex animate-rise flex-col gap-3 border-y bg-muted/40 py-5" style={delay(afterHeading + 450)}>
        <WordMarquee words={phrasal} seconds={70} />
        <WordMarquee words={irregular} seconds={60} reverse />
      </div>
    </section>
  );
}
