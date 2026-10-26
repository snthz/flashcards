import { ArrowUpRight } from "lucide-react";
import { getMessages } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

const AUTHOR_URL = "https://axlsantos.dev";
const STUDIO_URL = "https://fallxn.studio";

export function StudioMark({ className }: { className?: string }) {
  return (
    <span className={cn("font-normal tracking-tight", className)}>
      Fallxn<span className="font-bold">Studio</span>
    </span>
  );
}

export async function CreditLine({ className }: { className?: string }) {
  const c = (await getMessages()).landing.credits;
  return (
    <p className={className}>
      {c.developedBy}{" "}
      <a href={AUTHOR_URL} target="_blank" rel="noopener" className="link-sweep font-medium text-foreground">
        Axl Santos
      </a>{" "}
      {c.through}{" "}
      <a href={STUDIO_URL} target="_blank" rel="noopener" className="link-sweep text-foreground">
        <StudioMark />
      </a>
    </p>
  );
}

export async function Credits() {
  const c = (await getMessages()).landing.credits;
  const links = [
    { href: AUTHOR_URL, label: "axlsantos.dev" },
    { href: STUDIO_URL, label: "fallxn.studio" },
  ];
  return (
    <div
      data-reveal
      data-spotlight
      className="spotlight flex flex-col gap-8 overflow-hidden rounded-3xl border bg-card p-6 shadow-sm sm:p-8 md:flex-row md:items-end md:justify-between"
    >
      <div className="flex flex-col gap-4">
        <CreditLine className="max-w-xl text-2xl leading-snug tracking-tight text-muted-foreground text-balance md:text-3xl" />
        <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener"
              className="group inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              {link.label}
              <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
      </div>
      <a
        href={STUDIO_URL}
        target="_blank"
        rel="noopener"
        className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full border bg-background py-1.5 pl-4 pr-1.5 text-sm shadow-sm transition-[box-shadow,border-color] hover:border-foreground/20 hover:shadow-md md:self-auto"
      >
        <span className="text-muted-foreground">{c.pitch}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 font-medium text-accent-foreground">
          {c.pitchCta}
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </a>
    </div>
  );
}
