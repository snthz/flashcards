"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useMessages } from "@/lib/i18n/client";
import { CUSTOM_DAYS, CUSTOM_NEW_COUNTS, customStudyQuery, type CustomMode, type CustomStudy } from "@/lib/study/custom";
import { cn } from "@/lib/utils";

const FLAG_COLORS = ["", "#ef4444", "#f97316", "#22c55e", "#3b82f6", "#ec4899", "#14b8a6", "#a855f7"];

export function CustomStudyButton({ deckId, tags, flags }: { deckId: string; tags: string[]; flags: number[] }) {
  const router = useRouter();
  const t = useMessages().custom;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CustomMode>("forgotten");
  const [days, setDays] = useState(1);
  const [aheadDays, setAheadDays] = useState(1);
  const [count, setCount] = useState(10);
  const [tag, setTag] = useState(tags[0] ?? "");
  const [flag, setFlag] = useState(flags[0] ?? 1);

  const study: CustomStudy =
    mode === "forgotten"
      ? { mode, days }
      : mode === "ahead"
        ? { mode, days: aheadDays }
        : mode === "new"
          ? { mode, count }
          : mode === "tag"
            ? { mode, tag }
            : { mode, flag };

  const options: Array<{ mode: CustomMode; title: string; hint: string; control: React.ReactNode; disabled?: boolean }> = [
    {
      mode: "forgotten",
      title: t.forgotten,
      hint: t.forgottenHint,
      control: (
        <Select
          variant="compact"
          label={t.forgotten}
          value={String(days)}
          onChange={(value) => setDays(Number(value))}
          options={CUSTOM_DAYS.map((value) => ({ value: String(value), label: t.lastDays(value) }))}
        />
      ),
    },
    {
      mode: "ahead",
      title: t.ahead,
      hint: t.aheadHint,
      control: (
        <Select
          variant="compact"
          label={t.ahead}
          value={String(aheadDays)}
          onChange={(value) => setAheadDays(Number(value))}
          options={CUSTOM_DAYS.slice(0, 4).map((value) => ({ value: String(value), label: t.nextDays(value) }))}
        />
      ),
    },
    {
      mode: "new",
      title: t.extraNew,
      hint: t.extraNewHint,
      control: (
        <Select
          variant="compact"
          label={t.extraNew}
          value={String(count)}
          onChange={(value) => setCount(Number(value))}
          options={CUSTOM_NEW_COUNTS.map((value) => ({ value: String(value), label: t.cards(value) }))}
        />
      ),
    },
    {
      mode: "tag",
      title: t.tag,
      hint: tags.length > 0 ? t.tagHint : t.noTags,
      disabled: tags.length === 0,
      control:
        tags.length > 0 ? (
          <Select
            variant="compact"
            label={t.tag}
            value={tag}
            onChange={setTag}
            options={tags.map((value) => ({ value, label: value }))}
            className="max-w-40"
          />
        ) : null,
    },
    {
      mode: "flag",
      title: t.flag,
      hint: t.flagHint,
      disabled: flags.length === 0,
      control:
        flags.length > 0 ? (
          <div className="flex gap-1.5">
            {flags.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode("flag");
                  setFlag(value);
                }}
                aria-label={t.flagName(value)}
                aria-pressed={flag === value}
                className={cn("size-6 rounded-full border-2 transition-transform", flag === value ? "scale-110 border-foreground" : "border-transparent")}
                style={{ backgroundColor: FLAG_COLORS[value] }}
              />
            ))}
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <Button variant="outline" size="lg" className="h-14" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="size-5" />
        {t.button}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t.title} description={t.description}>
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <label
              key={option.mode}
              className={cn(
                "flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-colors",
                mode === option.mode ? "border-accent bg-accent-soft" : "hover:bg-muted",
                option.disabled && "pointer-events-none opacity-50",
              )}
            >
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name="custom-mode"
                  checked={mode === option.mode}
                  disabled={option.disabled}
                  onChange={() => setMode(option.mode)}
                  className="mt-0.5 size-4 accent-accent"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{option.title}</span>
                  <span className="text-xs text-muted-foreground">{option.hint}</span>
                </span>
              </span>
              {mode === option.mode && option.control ? <span className="pl-7">{option.control}</span> : null}
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => router.push(`/decks/${deckId}/study?${customStudyQuery(study)}`)}>{t.start}</Button>
        </div>
      </Dialog>
    </>
  );
}
