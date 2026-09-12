"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";

const FADE_MS = 200;

export function useHeaderHaikuSearch() {
  const pathname = usePathname();
  const { searchString, setSearchString } = useHaikuFilters();
  const [expanded, setExpanded] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasQuery = Boolean(searchString.trim());
  const isExpanded = expanded || hasQuery;

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isExpanded && !fadingOut) {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isExpanded, fadingOut]);

  const openSearch = () => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    setFadingOut(false);
    setExpanded(true);
  };

  const onBlur = () => {
    if (hasQuery) return;
    setFadingOut(true);
    fadeTimerRef.current = setTimeout(() => {
      setExpanded(false);
      setFadingOut(false);
      fadeTimerRef.current = null;
    }, FADE_MS);
  };

  return {
    enabled: pathname === "/",
    expanded: isExpanded,
    fadingOut,
    searchString,
    setSearchString,
    openSearch,
    onBlur,
    inputRef,
  };
}
