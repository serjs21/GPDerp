"use client";

import { useTranslations } from "next-intl";
import { HEADER_HAIKU_SEARCH_ICON_SRC } from "./consts/headerToolConsts";
import type { HeaderSearchButtonProps } from "./HeaderSearchButton.types";
import { HeaderToolFace } from "./HeaderToolFace";
import { HeaderToolFrame } from "./HeaderToolFrame";
import { useHeaderHaikuSearch } from "./useHeaderHaikuSearch";
import { useHeaderSettingsSearch } from "./useHeaderSettingsSearch";
import { useHeaderToolHover } from "./useHeaderToolHover";
import toolStyles from "./HeaderHaikuTools.module.css";
import styles from "./HeaderToolButton.module.css";

/** Header search button + input: haiku titles on `/`, the active tab on `/settings`. */
export function HeaderSearchButton({ className, forcedHover }: HeaderSearchButtonProps) {
  const t = useTranslations("HeaderHaikuTools.search");
  const haikuSearch = useHeaderHaikuSearch();
  const settingsSearch = useHeaderSettingsSearch();
  const { active, handlers } = useHeaderToolHover(forcedHover);

  const isSettings = settingsSearch.enabled;
  if (!isSettings && !haikuSearch.enabled) return null;

  const expanded = isSettings ? settingsSearch.expanded : haikuSearch.expanded;
  const fadingOut = isSettings ? false : haikuSearch.fadingOut;
  const searchString = isSettings ? settingsSearch.searchString : haikuSearch.searchString;
  const setSearchString = isSettings
    ? settingsSearch.setSearchString
    : haikuSearch.setSearchString;
  const inputRef = isSettings ? settingsSearch.inputRef : haikuSearch.inputRef;
  const placeholder = isSettings ? settingsSearch.placeholder : t("placeholder");
  const inputAriaLabel = isSettings ? settingsSearch.ariaLabel : t("inputAriaLabel");
  const buttonAriaLabel = isSettings ? settingsSearch.buttonAriaLabel : t("buttonAriaLabel");
  const onSearchClick = isSettings ? settingsSearch.toggleExpanded : haikuSearch.openSearch;
  const onInputBlur = isSettings ? undefined : haikuSearch.onBlur;
  const iconSrc = isSettings ? settingsSearch.iconSrc : HEADER_HAIKU_SEARCH_ICON_SRC;
  const panelClassName = [
    styles.panelSearch,
    isSettings && settingsSearch.tab === "labels" ? styles.panelSearchLabels : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={[styles.anchor, className].filter(Boolean).join(" ")}>
      <HeaderToolFrame panelClassName={panelClassName}>
        <button
          type="button"
          className={styles.button}
          aria-label={buttonAriaLabel}
          aria-expanded={expanded}
          {...handlers}
          onClick={onSearchClick}
        >
          <HeaderToolFace>
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
            <img src={iconSrc} alt="" className={styles.iconImg} width={28} height={28} />
          </HeaderToolFace>
          <HeaderToolFace enterFrom="right" hidden={!active}>
            <span className={styles.actionName}>{t("actionName")}</span>
          </HeaderToolFace>
        </button>
      </HeaderToolFrame>

      {expanded ? (
        <input
          ref={inputRef}
          className={[toolStyles.searchInput, fadingOut ? toolStyles.searchInputFadeOut : ""]
            .filter(Boolean)
            .join(" ")}
          type="search"
          value={searchString}
          onChange={(event) => setSearchString(event.target.value)}
          onBlur={onInputBlur}
          placeholder={placeholder}
          aria-label={inputAriaLabel}
          autoComplete="off"
          spellCheck={false}
        />
      ) : null}
    </div>
  );
}
