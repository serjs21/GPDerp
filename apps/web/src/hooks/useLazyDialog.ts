"use client";

import { useEffect, useState } from "react";

export type LazyDialog<T> = {
  /** The loaded dialog component; null until first requested. */
  Component: T | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  requestOpen: () => void;
};

/**
 * Open state for a code-split dialog that is loaded and mounted on first use, then kept
 * mounted (so closing still plays its exit transition). The component is held in state rather
 * than rendered through Suspense, whose delayed reveal would let it mount already open.
 */
export function useLazyDialog<T>(load: () => Promise<T>): LazyDialog<T> {
  const [loaded, setLoaded] = useState<{ Component: T } | null>(null);
  const [open, setOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);

  useEffect(() => {
    if (!loaded || !pendingOpen) return;
    // Base UI skips the enter transition for a dialog that mounts already open, so open only
    // after its first (closed) commit.
    const frame = requestAnimationFrame(() => {
      setPendingOpen(false);
      setOpen(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [loaded, pendingOpen]);

  const requestOpen = () => {
    if (loaded) {
      setOpen(true);
      return;
    }
    setPendingOpen(true);
    void load().then(
      (Component) => setLoaded({ Component }),
      () => setPendingOpen(false),
    );
  };

  return { Component: loaded?.Component ?? null, open, setOpen, requestOpen };
}
