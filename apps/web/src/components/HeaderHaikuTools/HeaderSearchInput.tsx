"use client";

import type { HeaderSearchInputProps } from "./HeaderSearchInput.types";
import toolStyles from "./HeaderHaikuTools.module.css";

/** Expanded search field beside the header search button. */
export function HeaderSearchInput({ view, inputRef }: HeaderSearchInputProps) {
  const className = [
    toolStyles.searchInput,
    view.isSettings ? toolStyles.searchInputSettings : "",
    view.fadingOut ? toolStyles.searchInputFadeOut : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      ref={inputRef}
      className={className}
      type="search"
      value={view.searchString}
      onChange={(event) => view.setSearchString(event.target.value)}
      onBlur={view.onInputBlur}
      placeholder={view.placeholder}
      aria-label={view.inputAriaLabel}
      autoComplete="off"
      spellCheck={false}
    />
  );
}
