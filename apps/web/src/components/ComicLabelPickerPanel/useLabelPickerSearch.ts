"use client";

import { useEffect, useRef } from "react";
import { useDebouncedSearchInput } from "@/hooks/useDebouncedSearchInput";

const SEARCH_DEBOUNCE_MS = 200;

/** Filter input state: focused when the panel activates, cleared when it deactivates, debounced for queries. */
export function useLabelPickerSearch(active: boolean) {
  const searchRef = useRef<HTMLInputElement>(null);
  const { searchInput, setSearchInput, query } = useDebouncedSearchInput(active, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (!active) return;
    window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }, [active]);

  return { searchRef, searchInput, setSearchInput, query };
}
