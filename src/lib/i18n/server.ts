import { cache } from "react";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { dictionaries } from "./messages";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const getLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
});

export async function getMessages() {
  return dictionaries[await getLocale()];
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

export async function setLocaleCookie(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });
}
