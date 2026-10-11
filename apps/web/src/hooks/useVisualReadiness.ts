"use client";

import { useEffect, useState } from "react";
import {
  isImageDecoded,
  preloadAndDecodeImage,
  type CriticalImage,
} from "@/utils/visualReadiness/imageReadiness";

export type VisualReadinessStatus = "idle" | "loading" | "ready" | "degraded";

export type UseVisualReadinessOptions = {
  criticalAssets: readonly CriticalImage[];
  enabled?: boolean;
  /** Reveal as `degraded` once this elapses, even if assets are still pending. */
  maxWaitMs: number;
};

export type VisualReadiness = {
  status: VisualReadinessStatus;
  isReady: boolean;
  /** `src` of assets that failed or were still pending at the cap. */
  failedAssets: readonly string[];
};

type SettledRun = {
  key: string;
  status: "ready" | "degraded";
  failedAssets: readonly string[];
};

const NONE: readonly string[] = [];

const toKey = (assets: readonly CriticalImage[]): string =>
  assets.map(({ src, crossOrigin }) => `${crossOrigin ?? ""}|${src}`).join("\n");

const fromKey = (key: string): CriticalImage[] =>
  key.split("\n").map((entry) => {
    const [crossOrigin, src] = entry.split("|") as ["" | "anonymous", string];
    return crossOrigin ? { src, crossOrigin } : { src };
  });

/**
 * Tracks whether a view's critical images are requested and decoded. Gates visibility /
 * animation start only; it never prevents the images themselves from rendering.
 */
export function useVisualReadiness({
  criticalAssets,
  enabled = true,
  maxWaitMs,
}: UseVisualReadinessOptions): VisualReadiness {
  const key = toKey(criticalAssets);
  const [settled, setSettled] = useState<SettledRun | null>(null);
  const alreadyDecoded = criticalAssets.every(isImageDecoded);

  useEffect(() => {
    if (!enabled || alreadyDecoded || key === "") return;
    const assets = fromKey(key);
    let cancelled = false;
    const outstanding = new Set(assets.map((asset) => asset.src));
    const failed: string[] = [];

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      cancelled = true;
      setSettled({ key, status: "degraded", failedAssets: [...failed, ...outstanding] });
    }, maxWaitMs);

    void Promise.all(
      assets.map(async (asset) => {
        const result = await preloadAndDecodeImage(asset);
        outstanding.delete(asset.src);
        if (result === "failed") failed.push(asset.src);
      }),
    ).then(() => {
      if (cancelled) return;
      cancelled = true;
      window.clearTimeout(timer);
      setSettled({
        key,
        status: failed.length > 0 ? "degraded" : "ready",
        failedAssets: failed,
      });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled, alreadyDecoded, key, maxWaitMs]);

  if (!enabled) return { status: "idle", isReady: false, failedAssets: NONE };
  if (alreadyDecoded) return { status: "ready", isReady: true, failedAssets: NONE };
  if (settled?.key !== key) return { status: "loading", isReady: false, failedAssets: NONE };
  return {
    status: settled.status,
    isReady: settled.status === "ready",
    failedAssets: settled.failedAssets,
  };
}
