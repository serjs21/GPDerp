"use client";

import { useTranslations } from "next-intl";
import { useHeaderHaikuSearch } from "./useHeaderHaikuSearch";
import { useHeaderSettingsSearch } from "./useHeaderSettingsSearch";
import { resolveHeaderSearchView } from "./utils/headerSearchSourceUtils";

/** Active header search (settings tab or haiku titles) as one view + its input ref; view is null when neither applies. */
export function useHeaderSearchSource() {
  const t = useTranslations("HeaderHaikuTools.search");
  const { inputRef: haikuInputRef, ...haikuSearch } = useHeaderHaikuSearch();
  const { inputRef: settingsInputRef, ...settingsSearch } = useHeaderSettingsSearch();
  return {
    view: resolveHeaderSearchView(settingsSearch, haikuSearch, t),
    inputRef: settingsSearch.enabled ? settingsInputRef : haikuInputRef,
  };
}
