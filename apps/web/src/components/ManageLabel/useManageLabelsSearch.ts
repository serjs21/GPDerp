"use client";

import { useEffect, useRef } from "react";
import { useDebouncedSearchInput } from "@/hooks/useDebouncedSearchInput";

const SEARCH_DEBOUNCE_MS = 200;

/**
 * Local search box (debounced, focused on activation, cleared on deactivation), or the header's
 * controlled `searchQuery` when `headerDriven`.
 */
export function useManageLabelsSearch(active: boolean, headerDriven: boolean, searchQuery: string) {
  const searchRef = useRef<HTMLInputElement>(null);
  const { searchInput, setSearchInput, query } = useDebouncedSearchInput(active, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (!active || headerDriven) return;
    window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }, [active, headerDriven]);

  return {
    searchRef,
    searchInput,
    setSearchInput,
    resolvedQ: headerDriven ? searchQuery.trim() : query,
  };
}
