"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Overlay stays mounted from open until the scrim's close animation completes; Escape (window-level)
 * prefers Keep Scrolling, else onClose.
 */
export function usePathOverlayMount(open: boolean, onEscape: (() => void) | undefined) {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  const handleCloseComplete = useCallback(() => {
    setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onEscape?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onEscape]);

  return { mounted, handleCloseComplete };
}
