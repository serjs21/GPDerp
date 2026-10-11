"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 200;

/** Filter input state: focused when the panel activates, cleared when it deactivates, debounced for queries. */
export function useLabelPickerSearch(active: boolean) {
  const [searchInput, setSearchInput] = useState("");
  const [wasActive, setWasActive] = useState(active);
  const searchRef = useRef<HTMLInputElement>(null);
  const query = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);

  if (wasActive !== active) {
    setWasActive(active);
    if (!active) setSearchInput("");
  }

  useEffect(() => {
    if (!active) return;
    window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }, [active]);

  return { searchRef, searchInput, setSearchInput, query };
}
