"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { HTML_LOADER_FLIP_LOAD_TIMEOUT_MS } from "@/components/Loaders/htmlDecorations/htmlLoader/consts/htmlLoaderFlipConsts";
import type { HtmlLoaderPageFlipProps } from "@/components/Loaders/htmlDecorations/htmlLoader/HtmlLoaderPageFlip.types";
import { markHtmlLoaderExited } from "@/components/Loaders/htmlDecorations/htmlLoader/utils/htmlLoaderExitUtils";

type FlipModule =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "loaded"; Component: ComponentType<HtmlLoaderPageFlipProps> };

/**
 * Loads the page-flip exit right after hydration (off the critical path) and shows it once the app is
 * revealed. Without it in time (still loading after the timeout, or failed), the loader is just hidden.
 */
export function useHtmlLoaderExit(revealed: boolean) {
  const [flip, setFlip] = useState<FlipModule>({ status: "loading" });
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("@/components/Loaders/htmlDecorations/htmlLoader/HtmlLoaderPageFlip").then(
      (module) => {
        if (!cancelled) setFlip({ status: "loaded", Component: module.HtmlLoaderPageFlip });
      },
      () => {
        if (!cancelled) setFlip({ status: "failed" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!revealed || done || flip.status === "loaded") return;
    const timer = window.setTimeout(
      () => {
        markHtmlLoaderExited();
        setDone(true);
      },
      flip.status === "failed" ? 0 : HTML_LOADER_FLIP_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [revealed, done, flip.status]);

  const onDone = useCallback(() => setDone(true), []);
  const FlipComponent = revealed && !done && flip.status === "loaded" ? flip.Component : null;
  return { FlipComponent, onDone };
}
