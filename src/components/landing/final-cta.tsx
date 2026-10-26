import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getMessages } from "@/lib/i18n/server";
import { cssVars, delay } from "./motion";

const DECORATION = [
  { className: "right-[30%] top-10", tilt: "-8deg", drift: 0 },
  { className: "right-[8%] top-[22%]", tilt: "6deg", drift: -4000 },
  { className: "right-[20%] bottom-10", tilt: "-3deg", drift: -7000 },
];

export async function FinalCta() {
  const l = (await getMessages()).landing;
  return (
    <section className="px-4 pb-20 md:px-6 md:pb-24">
      <div data-reveal="scale" className="mx-auto w-full max-w-6xl">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-accent px-6 py-16 text-accent-foreground shadow-2xl sm:px-12 md:py-24">
          <div aria-hidden className="absolute inset-0 -z-10 hidden lg:block">
            {DECORATION.map((card, index) => (
              <div
                key={index}
                className={`animate-drift absolute flex h-28 w-48 flex-col items-center justify-center gap-2 rounded-2xl border border-accent-foreground/15 bg-accent-foreground/5 ${card.className}`}
                style={{ ...cssVars({ "--tilt": card.tilt }), ...delay(card.drift) }}
              >
                <span lang="en" className="text-lg font-semibold tracking-tight">
                  {l.demo.cards[index]?.front}
                </span>
                <span className="h-1 w-14 rounded-full bg-accent-foreground/20" />
              </div>
            ))}
          </div>
          <div className="flex max-w-xl flex-col items-start gap-6">
            <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-6xl">{l.finalTitle}</h2>
            <p className="text-lg opacity-70">{l.finalLead}</p>
            <Link
              href="/register"
              className="group mt-2 inline-flex h-12 items-center gap-2 rounded-lg bg-accent-foreground px-6 font-medium text-accent shadow-lg transition-[scale,box-shadow] duration-300 hover:scale-[1.03] hover:shadow-xl"
            >
              {l.finalCta}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
