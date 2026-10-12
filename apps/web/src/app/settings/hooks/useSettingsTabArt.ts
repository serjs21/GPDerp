"use client";

import { useState } from "react";
import { preload } from "react-dom";
import { CONTROL_ART_MAX_WAIT_MS } from "@/consts/visualReadiness/criticalAssets";
import { useLocale } from "@/hooks/useLocale";
import { useVisualReadiness, type VisualReadinessStatus } from "@/hooks/useVisualReadiness";
import type { ProfilePageTab } from "../components/ProfileTabs.types";
import { settingsTabArtSrcs } from "../utils/settingsTabArtUtils";

/**
 * The tab body mounts only after auth and the profile fetch, so its `<img>`s would be requested
 * after that round trip. Preloading + decoding from the page's first render overlaps them with it.
 * Readiness tracks the first view only; later tab switches must not hide the page again.
 */
export function useSettingsTabArt(tab: ProfilePageTab): VisualReadinessStatus {
  const { locale } = useLocale();
  const srcs = settingsTabArtSrcs(tab, locale);
  for (const src of srcs) preload(src, { as: "image" });
  const [firstViewSrcs] = useState(srcs);
  return useVisualReadiness({
    criticalAssets: firstViewSrcs.map((src) => ({ src })),
    maxWaitMs: CONTROL_ART_MAX_WAIT_MS,
  }).status;
}
