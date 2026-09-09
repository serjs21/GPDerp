"use client";

import type { RefObject } from "react";
import { Search } from "lucide-react";
import { SearchInkDivider } from "./SearchInkDivider";
import styles from "./LocaleBubbleSelector.module.css";

type LocaleSearchHeaderProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function LocaleSearchHeader({
  inputRef,
  value,
  onChange,
  placeholder,
}: LocaleSearchHeaderProps) {
  return (
    <div className={styles.searchBlock}>
      <div className={styles.searchRow}>
        <Search className={styles.searchIcon} aria-hidden strokeWidth={2.25} />
        <input
          ref={inputRef}
          type="search"
          className={styles.search}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            // Keep typing from closing / toggling the trigger.
            event.stopPropagation();
          }}
        />
        <span className={styles.checkSpacer} aria-hidden />
      </div>
      <SearchInkDivider />
    </div>
  );
}
