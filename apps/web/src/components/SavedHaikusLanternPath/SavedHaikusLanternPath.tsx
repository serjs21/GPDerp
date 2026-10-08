"use client";

import { forwardRef, useCallback, useMemo } from "react";
import type { HaikuListSort } from "@/api/haikus";
import { Button } from "@/components/StyledComponents";
import { SVGPath, type SVGPathHandle } from "@/components/SVGPath";
import { SakuraPetalLoader } from "@/components/Loaders";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useHaikuDeleteController } from "@/hooks/useHaikuDeleteController";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { HAIKU_SEARCH_DEBOUNCE_MS } from "./consts/haikuSearchConsts";
import {
  filterHaikusByLabels,
  haikuMatchesSearch,
  mergeHaikuSearchResults,
  normalizeHaikuSearch,
} from "./utils/haikuSearchUtils";
import styles from "@/components/Lantern/LanternPath/LanternPath.module.css";

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
  generatingDraft = null,
  creationChromeOpen = false,
  searchString = "",
  selectedLabelIds = [],
  excludedLabelIds = [],
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

  const trimmedSearch = searchString.trim();
  const isSearching = trimmedSearch !== "";
  const debouncedSearch = useDebouncedValue(trimmedSearch, HAIKU_SEARCH_DEBOUNCE_MS);
  const searchQuery = useInfiniteHaikusQuery({
    q: debouncedSearch,
    sort,
    enabled: initialized && isLoggedIn && debouncedSearch !== "",
  });

  const filteredHaikus = useMemo(() => {
    if (!isSearching) return filterHaikusByLabels(haikus, selectedLabelIds, excludedLabelIds);
    const normalizedSearch = normalizeHaikuSearch(trimmedSearch);
    const matches = (list: typeof haikus) => list.filter((haiku) => haikuMatchesSearch(haiku, normalizedSearch));
    // API results may still belong to the previous debounced term; re-check them against the current one.
    const searchResults = debouncedSearch ? matches(searchQuery.haikus) : [];
    return filterHaikusByLabels(
      mergeHaikuSearchResults(matches(haikus), searchResults, sort),
      selectedLabelIds,
      excludedLabelIds,
    );
  }, [haikus, isSearching, trimmedSearch, debouncedSearch, searchQuery.haikus, selectedLabelIds, excludedLabelIds, sort]);

  const searchPending =
    isSearching && (debouncedSearch !== trimmedSearch || searchQuery.isInitialLoading);
  const showSearchLoader = searchPending && filteredHaikus.length === 0;

  // No paging until the debounced term catches up, so typing never triggers list requests.
  const pagedQuery = !isSearching
    ? { hasNextPage, isFetchingNextPage, fetchNextPage }
    : searchPending
      ? { hasNextPage: false, isFetchingNextPage: false, fetchNextPage: () => {} }
      : {
          hasNextPage: searchQuery.hasNextPage,
          isFetchingNextPage: searchQuery.isFetchingNextPage,
          fetchNextPage: searchQuery.fetchNextPage,
        };

  const { onHaikuDeleted, onHaikuDeleteFailed, deleteFailedModal } = useHaikuDeleteController();

  const fetchVisibleNextPage = pagedQuery.fetchNextPage;
  const handleVacantQueueSlot = useCallback(() => {
    fetchVisibleNextPage();
  }, [fetchVisibleNextPage]);

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

  if (showSearchLoader) {
    return (
      <div className={styles.flightPathLoader} aria-busy="true" aria-label="Searching haikus">
        <SakuraPetalLoader />
      </div>
    );
  }

  return (
    <>
      <SVGPath
        ref={ref}
        haikus={filteredHaikus}
        generatingDraft={generatingDraft}
        creationChromeOpen={creationChromeOpen}
        hasNextPage={pagedQuery.hasNextPage}
        isFetchingNextPage={pagedQuery.isFetchingNextPage}
        onVacantQueueSlot={handleVacantQueueSlot}
        onHaikuDeleted={onHaikuDeleted}
        onHaikuDeleteFailed={onHaikuDeleteFailed}
        onHaikuChanged={handleHaikuChanged}
        excludeLabelIds={selectedLabelIds}
      />
      {deleteFailedModal}
    </>
  );
});
