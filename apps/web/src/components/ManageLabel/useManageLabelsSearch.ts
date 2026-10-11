"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 200;

/**
 * Local search box (debounced, focused on activation, cleared on deactivation), or the header's
 * controlled `searchQuery` when `headerDriven`.
 */
export function useManageLabelsSearch(active: boolean, headerDriven: boolean, searchQuery: string) {
  const [searchInput, setSearchInput] = useState("");
  const [wasActive, setWasActive] = useState(active);
  const searchRef = useRef<HTMLInputElement>(null);
  const debouncedQ = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);

  if (wasActive !== active) {
    setWasActive(active);
    if (!active) setSearchInput("");
  }

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
    resolvedQ: headerDriven ? searchQuery.trim() : debouncedQ,
  };
}
