"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

/**
 * Search input whose trimmed value is debounced into `query`. Deactivating clears the input and
 * reports an empty `query` immediately, not after the debounce catches up.
 */
export function useDebouncedSearchInput(active: boolean, delayMs: number) {
  const [searchInput, setSearchInput] = useState("");
  const [wasActive, setWasActive] = useState(active);
  const [resetPending, setResetPending] = useState(false);
  const trimmed = searchInput.trim();
  const debounced = useDebouncedValue(trimmed, delayMs);

  if (wasActive !== active) {
    setWasActive(active);
    if (!active) {
      setSearchInput("");
      setResetPending(true);
    }
  }
  if (resetPending && debounced === trimmed) setResetPending(false);

  return { searchInput, setSearchInput, query: resetPending ? "" : debounced };
}
