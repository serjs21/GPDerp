"use client";

import { forwardRef, useCallback } from "react";
import type { HaikuListSort } from "@/api/haikus";
import { SVGPath, type SVGPathHandle } from "@/components/SVGPath";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useHaikuDeleteController } from "@/hooks/useHaikuDeleteController";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { SavedHaikusPathStatus } from "./SavedHaikusPathStatus";
import { useSavedHaikusSearch } from "./useSavedHaikusSearch";
import { savedHaikusPathPhase } from "./utils/savedHaikusPathUtils";

export type SavedHaikusLanternPathProps = {
  generatingDraft?: GeneratingDraft | null;
  /** Far-path modal chrome open — park creation lantern on the path guideBox. */
  creationChromeOpen?: boolean;
  searchString?: string;
  selectedLabelIds?: string[];
  excludedLabelIds?: string[];
  /** Lantern order; omitted = newest first. */
  sort?: HaikuListSort;
};

export const SavedHaikusLanternPath = forwardRef<
  SVGPathHandle,
  SavedHaikusLanternPathProps
>(function SavedHaikusLanternPath({
  generatingDraft,
  creationChromeOpen,
  searchString,
  selectedLabelIds,
  excludedLabelIds,
  sort,
}, ref) {
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
  } = useInfiniteHaikusQuery({ sort });
  const signedIn = initialized && isLoggedIn;

  const search = useSavedHaikusSearch({
    haikus,
    listPaging: { hasNextPage, isFetchingNextPage, fetchNextPage },
    searchString,
    selectedLabelIds,
    excludedLabelIds,
    sort,
    queryEnabled: signedIn,
  });

  const { onHaikuDeleted, onHaikuDeleteFailed, deleteFailedModal } = useHaikuDeleteController();

  const { filteredHaikus, showSearchLoader, paging } = search;
  const fetchVisibleNextPage = paging.fetchNextPage;
  const handleVacantQueueSlot = useCallback(() => {
    fetchVisibleNextPage();
  }, [fetchVisibleNextPage]);

  const handleHaikuChanged = useCallback(() => {
    invalidate();
  }, [invalidate]);

  const phase = savedHaikusPathPhase({ signedIn, isInitialLoading, isError, showSearchLoader });
  if (phase === "hidden") return null;
  if (phase !== "ready") return <SavedHaikusPathStatus phase={phase} onRetry={refetch} />;

  return (
    <>
      <SVGPath
        ref={ref}
        haikus={filteredHaikus}
        generatingDraft={generatingDraft}
        creationChromeOpen={creationChromeOpen}
        hasNextPage={paging.hasNextPage}
        isFetchingNextPage={paging.isFetchingNextPage}
        onVacantQueueSlot={handleVacantQueueSlot}
        onHaikuDeleted={onHaikuDeleted}
        onHaikuDeleteFailed={onHaikuDeleteFailed}
        onHaikuChanged={handleHaikuChanged}
        excludeLabelIds={search.selectedLabelIds}
        emptyPlaceholder={search.isFiltering ? undefined : "createFirst"}
      />
      {deleteFailedModal}
    </>
  );
});
