"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultLocale, type Locale } from "./config";
import { dictionaries, type Messages } from "./messages";

const LocaleContext = createContext<Locale>(defaultLocale);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useMessages(): Messages {
  return dictionaries[useContext(LocaleContext)];
}

export function useI18n() {
  const locale = useContext(LocaleContext);
  return { locale, t: dictionaries[locale] };
}
