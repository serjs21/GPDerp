"use client";

import { useTranslations } from "next-intl";
import { useHeaderHaikuSearch } from "./useHeaderHaikuSearch";
import styles from "./HeaderHaikuTools.module.css";

export function HeaderHaikuSearch() {
  const t = useTranslations("HeaderHaikuTools.search");
  const {
    enabled,
    expanded,
    fadingOut,
    searchString,
    setSearchString,
    openSearch,
    onBlur,
    inputRef,
  } = useHeaderHaikuSearch();

  if (!enabled) return null;

  return (
    <div className={styles.searchRoot}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={t("buttonAriaLabel")}
        aria-expanded={expanded}
        onClick={openSearch}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nav/search.svg" alt="" className={styles.iconImg} width={28} height={28} />
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
          placeholder={t("placeholder")}
          aria-label={t("inputAriaLabel")}
          autoComplete="off"
          spellCheck={false}
        />
      ) : null}
    </div>
  );
}
