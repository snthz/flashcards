const KEY = "fc-focus-shortcuts";

export interface FocusSettings {
  enabled: boolean;
  on: string;
  off: string;
}

export const DEFAULT_FOCUS: FocusSettings = { enabled: false, on: "Flashcards Focus On", off: "Flashcards Focus Off" };

export function isAppleDevice() {
  return typeof navigator !== "undefined" && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
}

function standalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function loadFocus(): FocusSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_FOCUS, ...(JSON.parse(raw) as Partial<FocusSettings>) } : DEFAULT_FOCUS;
  } catch {
    return DEFAULT_FOCUS;
  }
}

export function saveFocus(settings: FocusSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}

export function focusShortcut(kind: "on" | "off") {
  if (!isAppleDevice()) return null;
  const settings = loadFocus();
  const name = (kind === "on" ? settings.on : settings.off).trim();
  return settings.enabled && name ? name : null;
}

export function shortcutUrl(name: string, returnTo: string | null) {
  const encoded = encodeURIComponent(name);
  return returnTo
    ? `shortcuts://x-callback-url/run-shortcut?name=${encoded}&x-success=${encodeURIComponent(returnTo)}`
    : `shortcuts://run-shortcut?name=${encoded}`;
}

export function runShortcut(name: string) {
  window.location.href = shortcutUrl(name, standalone() ? null : window.location.href);
}
