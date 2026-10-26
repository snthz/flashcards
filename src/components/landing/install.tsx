import { Bookmark, Copy, Layers, SquarePlus } from "lucide-react";
import { getMessages } from "@/lib/i18n/server";
import { delay } from "./motion";
import { SectionIntro } from "./section-intro";

function InstallPhone({ action }: { action: string }) {
  return (
    <div aria-hidden className="relative mx-auto w-60 shrink-0">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.6rem] border-[7px] border-foreground bg-background shadow-2xl">
        <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-foreground" />
        <div className="flex items-center justify-between px-6 pt-2.5 text-[10px] font-semibold tabular-nums">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-[2px] bg-foreground/70" />
          </span>
        </div>
        <div className="grid grid-cols-4 gap-x-3 gap-y-3.5 px-4 pt-9">
          {Array.from({ length: 15 }, (_, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <span className="aspect-square w-full rounded-[0.8rem] bg-border/70" />
              <span className="h-1 w-6 rounded-full bg-border/70" />
            </div>
          ))}
          <div className="phone-app flex flex-col items-center gap-1">
            <span className="flex aspect-square w-full items-center justify-center rounded-[0.8rem] bg-accent text-accent-foreground shadow-md">
              <Layers className="size-4" />
            </span>
            <span className="text-[7px] font-medium leading-none">Flashcards</span>
          </div>
        </div>
        <div className="absolute inset-x-3 bottom-3 grid grid-cols-4 gap-3 rounded-[1.4rem] bg-border/50 p-2.5 backdrop-blur">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="aspect-square rounded-[0.75rem] bg-border" />
          ))}
        </div>
        <div className="phone-sheet absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 rounded-t-3xl border-t bg-card px-3 pb-8 pt-2 shadow-[0_-12px_32px_-12px_rgb(0_0_0/0.25)]">
          <span className="mx-auto mb-2 h-1 w-8 rounded-full bg-border" />
          <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-[10px]">
            <Copy className="size-3 text-muted-foreground" />
            <span className="h-1.5 w-12 rounded-full bg-border" />
          </div>
          <div className="phone-row relative flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-medium">
            <SquarePlus className="size-3" />
            {action}
            <span className="phone-tap absolute right-6 top-1/2 size-6 -translate-y-1/2 rounded-full bg-foreground" />
          </div>
          <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-[10px]">
            <Bookmark className="size-3 text-muted-foreground" />
            <span className="h-1.5 w-16 rounded-full bg-border" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepsCard({ title, steps, offset }: { title: string; steps: string[]; offset: number }) {
  return (
    <div data-reveal style={delay(offset)}>
      <div className="flex h-full flex-col gap-5 rounded-3xl border bg-card p-6">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <ol className="relative flex flex-col gap-4 text-sm">
          <span aria-hidden className="absolute bottom-3 left-[0.6875rem] top-3 w-px bg-border" />
          {steps.map((step, index) => (
            <li key={index} className="reveal-child relative flex items-center gap-3" style={delay(offset + 200 + index * 130)}>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-[11px] text-muted-foreground">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export async function Install() {
  const l = (await getMessages()).landing;
  return (
    <section id="install" className="relative scroll-mt-16 overflow-hidden border-t">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-4 py-24 md:px-6 md:py-32 lg:grid-cols-[1fr_auto] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionIntro label={l.nav.install} title={l.installTitle} lead={l.installLead} />
          <div className="grid gap-4 sm:grid-cols-2">
            <StepsCard title={l.installIosTitle} steps={l.installIosSteps} offset={0} />
            <StepsCard title={l.installAndroidTitle} steps={l.installAndroidSteps} offset={120} />
          </div>
        </div>
        <div data-reveal="scale" style={delay(150)}>
          <InstallPhone action={l.installSheetAction} />
        </div>
      </div>
    </section>
  );
}
