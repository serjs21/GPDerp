"use client";

import { useMemo } from "react";
import type { HaikuDto, HaikuListSort } from "@/api/haikus";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import { HAIKU_SEARCH_DEBOUNCE_MS } from "./consts/haikuSearchConsts";
import {
  filterHaikusByLabels,
  haikuMatchesSearch,
  mergeHaikuSearchResults,
  normalizeHaikuSearch,
} from "./utils/haikuSearchUtils";
import { visibleHaikuPaging, type HaikuPaging } from "./utils/savedHaikusPathUtils";

const EMPTY_LABEL_IDS: string[] = [];

/**
 * Search + label filtering over the loaded haikus, merged with debounced API search results, plus
 * the paging source that matches what's on screen.
 */
export function useSavedHaikusSearch(params: {
  haikus: HaikuDto[];
  listPaging: HaikuPaging;
  searchString: string | undefined;
  selectedLabelIds: string[] | undefined;
  excludedLabelIds: string[] | undefined;
  sort: HaikuListSort | undefined;
  queryEnabled: boolean;
}) {
  const { haikus, listPaging, sort, queryEnabled } = params;
  const selectedLabelIds = params.selectedLabelIds ?? EMPTY_LABEL_IDS;
  const excludedLabelIds = params.excludedLabelIds ?? EMPTY_LABEL_IDS;
  const trimmedSearch = (params.searchString ?? "").trim();
  const isSearching = trimmedSearch !== "";
  const debouncedSearch = useDebouncedValue(trimmedSearch, HAIKU_SEARCH_DEBOUNCE_MS);
  const searchQuery = useInfiniteHaikusQuery({
    q: debouncedSearch,
    sort,
    enabled: queryEnabled && debouncedSearch !== "",
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

  return {
    selectedLabelIds,
    /** A search or label filter narrows the list (an empty result is "no matches", not "no haikus"). */
    isFiltering: isSearching || selectedLabelIds.length > 0 || excludedLabelIds.length > 0,
    filteredHaikus,
    showSearchLoader: searchPending && filteredHaikus.length === 0,
    paging: visibleHaikuPaging({ isSearching, searchPending, list: listPaging, search: searchQuery }),
  };
}
