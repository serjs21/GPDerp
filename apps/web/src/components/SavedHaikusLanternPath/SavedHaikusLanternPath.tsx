"use client";

import { forwardRef, useCallback, useMemo } from "react";
import { Button } from "@/components/StyledComponents";
import { SVGPath, type SVGPathHandle } from "@/components/SVGPath";
import { SakuraPetalLoader } from "@/components/Loaders";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useHaikuDeleteController } from "@/hooks/useHaikuDeleteController";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import styles from "@/components/Lantern/LanternPath/LanternPath.module.css";

export type SavedHaikusLanternPathProps = {
  generatingDraft?: GeneratingDraft | null;
  searchString?: string;
  selectedLabelIds?: string[];
};

export const SavedHaikusLanternPath = forwardRef<
  SVGPathHandle,
  SavedHaikusLanternPathProps
>(function SavedHaikusLanternPath({ generatingDraft = null, searchString = "", selectedLabelIds = [] }, ref) {
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

  const filteredHaikus = useMemo(() => {
    let result = haikus;
    
    if (searchString) {
      const lowerSearch = searchString.toLowerCase();
      result = result.filter((haiku) => haiku.title.toLowerCase().includes(lowerSearch));
    }
    
    if (selectedLabelIds.length > 0) {
      result = result.filter((haiku) =>
        haiku.labels.some((label) => selectedLabelIds.includes(label.id)),
      );
    }
    
    return result;
  }, [haikus, searchString, selectedLabelIds]);

  const { onHaikuDeleted, onHaikuDeleteFailed, deleteFailedModal } = useHaikuDeleteController();

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
    <>
      <SVGPath
        ref={ref}
        haikus={filteredHaikus}
        generatingDraft={generatingDraft}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onVacantQueueSlot={handleVacantQueueSlot}
        onHaikuDeleted={onHaikuDeleted}
        onHaikuDeleteFailed={onHaikuDeleteFailed}
        onHaikuChanged={handleHaikuChanged}
        showGuides
      />
      {deleteFailedModal}
    </>
  );
});
