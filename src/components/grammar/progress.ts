"use client";

import { useMemo, useSyncExternalStore } from "react";

const KEY = "fc-grammar";
const EVENT = "fc-grammar-store";

export interface TopicProgress {
  done: boolean;
  score?: number;
  total?: number;
  at: string;
}

function raw() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(value: string | null): Record<string, TopicProgress> {
  try {
    const parsed = JSON.parse(value ?? "{}") as Record<string, TopicProgress>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useGrammarProgress() {
  const value = useSyncExternalStore(subscribe, raw, () => null);
  return useMemo(() => parse(value), [value]);
}

export function saveTopicProgress(slug: string, patch: Partial<TopicProgress>) {
  const current = parse(raw());
  const next = { ...current, [slug]: { ...(current[slug] ?? { done: false }), ...patch, at: new Date().toISOString() } };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    return;
  }
}
