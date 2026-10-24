"use client";

import { useEffect } from "react";
import { waitForSettledContent } from "@/utils/visualReadiness/waitForSettledContent";
import type { ProfilePageTab } from "../components/ProfileTabs.types";
import { setSettingsViewReady } from "../settingsViewReadyStore";

/**
 * Reports the settings page's first view as ready once the active tab has mounted, nothing in it
 * is busy (list loaders, sort coin art, tab art) and its images and fonts are loaded.
 */
export function useReportSettingsViewReady(
  pageNode: HTMLElement | null,
  tab: ProfilePageTab,
  labelsAccountId: string | undefined,
) {
  // The labels tab renders nothing until the labels account resolves.
  const tabPending = tab === "labels" && !labelsAccountId;

  useEffect(() => {
    if (!pageNode || tabPending) return;
    const controller = new AbortController();
    void waitForSettledContent(pageNode, controller.signal).then(() => {
      if (!controller.signal.aborted) setSettingsViewReady(true);
    });
    return () => controller.abort();
  }, [pageNode, tabPending]);

  useEffect(() => () => setSettingsViewReady(false), []);
}
