import { useSyncExternalStore } from "react";

let ready = false;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Called by the settings page once its first view is fully drawn, so the first-load loader can wait for it. */
export function setSettingsViewReady(value: boolean) {
  if (ready === value) return;
  ready = value;
  for (const listener of listeners) listener();
}

export const useSettingsViewReady = () =>
  useSyncExternalStore(subscribe, () => ready, () => false);
