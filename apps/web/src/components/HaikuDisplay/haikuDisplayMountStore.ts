import { useSyncExternalStore } from "react";

let mounted = false;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Called by HaikuDisplay on mount/unmount, so the first-load loader can wait for the code-split view. */
export function setHaikuDisplayMounted(value: boolean) {
  mounted = value;
  for (const listener of listeners) listener();
}

export const useHaikuDisplayMounted = () =>
  useSyncExternalStore(subscribe, () => mounted, () => false);
