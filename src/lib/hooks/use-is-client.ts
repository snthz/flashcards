import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function useBrowserTimeZone() {
  return useSyncExternalStore(
    subscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    () => "UTC",
  );
}
