import { z } from "zod";
import type { Locale } from "./config";
import type { Messages } from "./messages";

const zodLocales = { en: z.locales.en(), es: z.locales.es() } satisfies Record<Locale, unknown>;

export function parseOptions(locale: Locale) {
  return { error: zodLocales[locale].localeError };
}

export function issueMessage(t: Messages, issue: { message: string } | undefined) {
  if (!issue) return t.common.invalidData;
  const messages: Record<string, string> = t.validation;
  return messages[issue.message] ?? issue.message;
}
