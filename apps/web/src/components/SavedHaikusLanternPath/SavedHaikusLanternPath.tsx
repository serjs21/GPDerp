"use client";

import { useCallback } from "react";
import { Button } from "@/components/StyledComponents";
import { SVGPath } from "@/components/SVGPath";
import { SakuraPetalLoader } from "@/components/Loaders";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import styles from "@/components/Lantern/LanternPath/LanternPath.module.css";

const PREFETCH_THRESHOLD = 3;

export type SavedHaikusLanternPathProps = {
  generatingDraft?: GeneratingDraft | null;
};

export function SavedHaikusLanternPath({
  generatingDraft = null,
}: SavedHaikusLanternPathProps) {
  const {
    haikus,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    invalidate,
    initialized,
    isLoggedIn,
    isInitialLoading,
    isError,
    refetch,
  } = useInfiniteHaikusQuery();

  const handleFocusChange = useCallback(
    (focusIndex: number) => {
      // #region agent log
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4f3b7" },
        body: JSON.stringify({
          sessionId: "a4f3b7",
          runId: "pre-fix",
          hypothesisId: "B",
          location: "SavedHaikusLanternPath.tsx:onFocusChange",
          message: "prefetch check",
          data: {
            focusIndex,
            haikuCount: haikus.length,
            hasNextPage,
            isFetchingNextPage,
            willFetch: hasNextPage && !isFetchingNextPage && focusIndex >= haikus.length - PREFETCH_THRESHOLD,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!hasNextPage || isFetchingNextPage) return;
      if (focusIndex >= haikus.length - PREFETCH_THRESHOLD) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, haikus.length, hasNextPage, isFetchingNextPage],
  );

  const handleHaikuChanged = useCallback(() => {
    invalidate();
  }, [invalidate]);

  if (!initialized || !isLoggedIn) {
    return null;
  }

  if (isInitialLoading) {
    return (
      <div className={styles.flightPathLoader} aria-busy="true" aria-label="Loading haikus">
        <SakuraPetalLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.flightPathError}>
        <p>Could not load saved haikus.</p>
        <Button type="primary" onClick={refetch}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <SVGPath
      haikus={haikus}
      generatingDraft={generatingDraft}
      onFocusChange={handleFocusChange}
      onHaikuDeleted={handleHaikuChanged}
      onHaikuChanged={handleHaikuChanged}
      showGuides
    />
  );
}
