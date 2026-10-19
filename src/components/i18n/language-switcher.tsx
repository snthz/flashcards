"use client";

import { useOptimistic, useTransition } from "react";
import { changeLocale } from "@/lib/i18n/actions";
import { useLocale } from "@/lib/i18n/client";
import { localeNames, locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  label: string;
  size?: "sm" | "md";
  className?: string;
}

export function LanguageSwitcher({ label, size = "md", className }: LanguageSwitcherProps) {
  const current = useLocale();
  const [locale, setOptimisticLocale] = useOptimistic(current);
  const [pending, startTransition] = useTransition();

  const select = (next: Locale) => {
    if (next === locale) return;
    startTransition(async () => {
      setOptimisticLocale(next);
      await changeLocale(next);
    });
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-full border bg-muted/70 p-0.5", pending && "opacity-70", className)}
    >
      {locales.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            lang={option}
            onClick={() => select(option)}
            className={cn(
              "rounded-full font-medium transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              active ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {size === "sm" ? option.toUpperCase() : localeNames[option]}
          </button>
        );
      })}
    </div>
  );
}
