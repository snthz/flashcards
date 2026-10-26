import { Plus } from "lucide-react";
import { getMessages } from "@/lib/i18n/server";
import { delay } from "./motion";
import { SectionIntro } from "./section-intro";

export async function Faq() {
  const l = (await getMessages()).landing;
  return (
    <section id="faq" className="scroll-mt-16 border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-24 md:px-6 md:py-32 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionIntro label={l.nav.faq} title={l.faqTitle} lead={l.faqLead} className="lg:sticky lg:top-28 lg:self-start" />
        <div className="flex flex-col gap-3">
          {l.faq.map((item, index) => (
            <div key={index} data-reveal style={delay(index * 90)}>
              <details className="faq-item group rounded-2xl border bg-card px-5 shadow-sm transition-[border-color,box-shadow] duration-300 open:border-foreground/15 open:shadow-md hover:border-foreground/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background transition-[rotate,background-color,color] duration-300 group-open:rotate-45 group-open:bg-accent group-open:text-accent-foreground">
                    <Plus className="size-3.5" />
                  </span>
                </summary>
                <p className="pb-5 pr-10 leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
