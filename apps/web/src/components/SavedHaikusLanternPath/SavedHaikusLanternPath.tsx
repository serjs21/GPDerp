"use client";

import { forwardRef, useCallback } from "react";
import { Button } from "@/components/StyledComponents";
import { SVGPath, type SVGPathHandle } from "@/components/SVGPath";
import { SakuraPetalLoader } from "@/components/Loaders";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import styles from "@/components/Lantern/LanternPath/LanternPath.module.css";

export type SavedHaikusLanternPathProps = {
  generatingDraft?: GeneratingDraft | null;
};

export const SavedHaikusLanternPath = forwardRef<
  SVGPathHandle,
  SavedHaikusLanternPathProps
>(function SavedHaikusLanternPath({ generatingDraft = null }, ref) {
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

  const handleVacantQueueSlot = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

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
      ref={ref}
      haikus={haikus}
      generatingDraft={generatingDraft}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onVacantQueueSlot={handleVacantQueueSlot}
      onHaikuDeleted={handleHaikuChanged}
      onHaikuChanged={handleHaikuChanged}
      showGuides
    />
  );
});
