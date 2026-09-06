"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";
import styles from "./HeaderHaikuTools.module.css";

const FADE_MS = 100;

export function HeaderHaikuSearch() {
  const pathname = usePathname();
  const { searchString, setSearchString } = useHaikuFilters();
  const [expanded, setExpanded] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchString.trim()) setExpanded(true);
  }, [searchString]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (expanded && !fadingOut) {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [expanded, fadingOut]);

  if (pathname !== "/") return null;

  const openSearch = () => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    setFadingOut(false);
    setExpanded(true);
  };

  const onBlur = () => {
    if (searchString.trim()) return;
    setFadingOut(true);
    fadeTimerRef.current = setTimeout(() => {
      setExpanded(false);
      setFadingOut(false);
      fadeTimerRef.current = null;
    }, FADE_MS);
  };

  return (
    <div className={styles.searchRoot}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label="Search haikus"
        aria-expanded={expanded}
        onClick={openSearch}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/search.svg" alt="" className={styles.iconImg} width={28} height={28} />
      </button>
      {expanded ? (
        <input
          ref={inputRef}
          className={[styles.searchInput, fadingOut ? styles.searchInputFadeOut : ""]
            .filter(Boolean)
            .join(" ")}
          type="search"
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
          onBlur={onBlur}
          placeholder="Search titles…"
          aria-label="Search haiku titles"
          autoComplete="off"
          spellCheck={false}
        />
      ) : null}
    </div>
  );
}
