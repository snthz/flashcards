export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "fc_locale";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

const intlLocales: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function intlLocale(locale: Locale) {
  return intlLocales[locale];
}
