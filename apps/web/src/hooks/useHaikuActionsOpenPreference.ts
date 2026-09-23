"use client";

import { useEffect, useState } from "react";
import {
  HAIKU_ACTIONS_OPEN_EVENT,
  PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY,
} from "@/config/userConfiguration";

function readHaikuActionsOpen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeHaikuActionsOpen(open: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY,
      open ? "true" : "false",
    );
  } catch {
    // Quota / private mode — preference stays in-memory only.
  }
  window.dispatchEvent(
    new CustomEvent<boolean>(HAIKU_ACTIONS_OPEN_EVENT, { detail: open }),
  );
}

/**
 * Persists haiku-actions open/closed until the user toggles it off.
 * Syncs across mounts and tabs via localStorage + a same-tab custom event.
 */
export function useHaikuActionsOpenPreference(forcedOpen?: boolean): {
  isOpen: boolean;
  setOpenPreference: (next: boolean) => void;
} {
  const [open, setOpen] = useState(readHaikuActionsOpen);

  useEffect(() => {
    if (forcedOpen !== undefined) return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY) return;
      setOpen(event.newValue === "true");
    };
    const onCustom = (event: Event) => {
      setOpen((event as CustomEvent<boolean>).detail);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(HAIKU_ACTIONS_OPEN_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(HAIKU_ACTIONS_OPEN_EVENT, onCustom);
    };
  }, [forcedOpen]);

  const setOpenPreference = (next: boolean) => {
    if (forcedOpen !== undefined) return;
    setOpen(next);
    writeHaikuActionsOpen(next);
  };

  return {
    isOpen: forcedOpen !== undefined ? forcedOpen : open,
    setOpenPreference,
  };
}
