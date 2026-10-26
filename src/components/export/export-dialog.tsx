"use client";

import { useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import { Button, buttonStyles, type ButtonProps } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

type Format = "apkg" | "txt";

export interface ExportTarget {
  id: string;
  name: string;
}

function exportUrl(deckId: string | null, format: Format, scheduling: boolean, media: boolean) {
  const params = new URLSearchParams({ format });
  if (deckId) params.set("deck", deckId);
  if (format === "apkg") {
    params.set("scheduling", scheduling ? "1" : "0");
    params.set("media", media ? "1" : "0");
  }
  return `/api/export?${params}`;
}

function Option({ checked, onSelect, title, hint }: { checked: boolean; onSelect: () => void; title: string; hint: string }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
        checked ? "border-accent bg-accent-soft" : "hover:bg-muted",
      )}
    >
      <input type="radio" name="export-format" checked={checked} onChange={onSelect} className="mt-0.5 size-4 accent-accent" />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}

function Toggle({ checked, onChange, title, hint }: { checked: boolean; onChange: (value: boolean) => void; title: string; hint: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <Checkbox checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5" />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}

export function ExportDialog({ target, open, onClose }: { target: ExportTarget | null; open: boolean; onClose: () => void }) {
  const t = useMessages().exporter;
  const [format, setFormat] = useState<Format>("apkg");
  const [scheduling, setScheduling] = useState(true);
  const [media, setMedia] = useState(true);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={target ? t.title : t.allTitle}
      description={target ? t.description(target.name) : t.allDescription}
    >
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">{t.format}</legend>
          <Option checked={format === "apkg"} onSelect={() => setFormat("apkg")} title={t.formatApkg} hint={t.formatApkgHint} />
          <Option checked={format === "txt"} onSelect={() => setFormat("txt")} title={t.formatTxt} hint={t.formatTxtHint} />
        </fieldset>
        {format === "apkg" ? (
          <div className="flex flex-col gap-3">
            <Toggle checked={scheduling} onChange={setScheduling} title={t.includeScheduling} hint={t.includeSchedulingHint} />
            <Toggle checked={media} onChange={setMedia} title={t.includeMedia} hint={t.includeMediaHint} />
          </div>
        ) : null}
        <div className="flex justify-end">
          <a href={exportUrl(target?.id ?? null, format, scheduling, media)} download onClick={onClose} className={buttonStyles("primary", "md")}>
            <Download className="size-4" />
            {t.download}
          </a>
        </div>
      </div>
    </Dialog>
  );
}

export function ExportButton({
  target,
  children,
  variant = "outline",
  size = "md",
}: {
  target: ExportTarget | null;
  children: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <ExportDialog target={target} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
