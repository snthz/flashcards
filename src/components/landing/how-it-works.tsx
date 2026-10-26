import { CircleCheck, Laptop, Package, Smartphone, Tablet } from "lucide-react";
import { getMessages } from "@/lib/i18n/server";
import { delay } from "./motion";
import { SectionIntro } from "./section-intro";

function ExportArt({ file }: { file: string }) {
  return (
    <div className="flex animate-float items-center gap-3 rounded-xl border bg-card py-2.5 pl-2.5 pr-4 shadow-md">
      <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Package className="size-4" />
      </span>
      <span className="flex flex-col">
        <span className="font-mono text-xs font-medium">{file}</span>
        <span className="text-[11px] text-muted-foreground">Anki · .apkg</span>
      </span>
    </div>
  );
}

function ImportArt({ file, busy, done }: { file: string; busy: string; done: string }) {
  return (
    <div className="flex w-52 flex-col gap-2.5 rounded-xl border bg-card p-3 shadow-md">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="grid font-medium">
          <span className="import-label-busy col-start-1 row-start-1">{busy}…</span>
          <span className="import-label-done col-start-1 row-start-1 inline-flex items-center gap-1 text-success">
            <CircleCheck className="size-3.5" />
            {done}
          </span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="import-bar h-full rounded-full bg-foreground" />
      </div>
      <span className="truncate font-mono text-[10px] text-muted-foreground">{file}</span>
    </div>
  );
}

function SyncDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((dot) => (
        <span key={dot} className="size-1 animate-blink rounded-full bg-foreground/60" style={delay(dot * 180)} />
      ))}
    </span>
  );
}

function DevicesArt() {
  const tile = "flex items-center justify-center rounded-xl border bg-card shadow-md";
  return (
    <div className="flex items-center gap-2.5">
      <span className={`${tile} size-10`}>
        <Smartphone className="size-4" />
      </span>
      <SyncDots />
      <span className={`${tile} size-14`}>
        <Laptop className="size-6" />
      </span>
      <SyncDots />
      <span className={`${tile} size-12`}>
        <Tablet className="size-5" />
      </span>
    </div>
  );
}

export async function HowItWorks() {
  const l = (await getMessages()).landing;
  const art = [
    <ExportArt key="export" file={l.howFile} />,
    <ImportArt key="import" file={l.howFile} busy={l.howImporting} done={l.howImported} />,
    <DevicesArt key="devices" />,
  ];

  return (
    <section id="how" className="scroll-mt-16 border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-24 md:px-6 md:py-32">
        <SectionIntro label={l.nav.how} title={l.howTitle} lead={l.howLead} />
        <ol className="grid gap-5 md:grid-cols-3">
          {l.how.map((step, index) => {
            return (
              <li key={index} data-reveal style={delay(index * 140)}>
                <div className="flex h-full flex-col gap-6 rounded-3xl border bg-card p-5">
                  <div aria-hidden className="flex h-32 items-center justify-center rounded-2xl bg-muted/60">
                    {art[index]}
                  </div>
                  <div className="flex flex-col gap-2 px-1 pb-1">
                    <h3 className="flex items-center gap-3 text-lg font-semibold tracking-tight">
                      <span className="relative flex size-7 shrink-0">
                        <span aria-hidden className="absolute inset-0 translate-x-1 -translate-y-1 rounded-[7px] border border-foreground/30" />
                        <span className="relative flex size-7 items-center justify-center rounded-[7px] bg-foreground text-sm font-semibold text-background tabular-nums">
                          {index + 1}
                        </span>
                      </span>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
