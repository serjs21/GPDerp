import { HEADER_HAIKU_SEARCH_ICON_SRC } from "../consts/headerToolConsts";
import type { useHeaderHaikuSearch } from "../useHeaderHaikuSearch";
import type { useHeaderSettingsSearch } from "../useHeaderSettingsSearch";

type Translate = (key: string, values?: Record<string, string | number>) => string;

type HaikuSearch = Omit<ReturnType<typeof useHeaderHaikuSearch>, "inputRef">;
type SettingsSearch = Omit<ReturnType<typeof useHeaderSettingsSearch>, "inputRef">;

/** What the header search control shows, from whichever page search is active. */
export type HeaderSearchView = {
  isSettings: boolean;
  expanded: boolean;
  fadingOut: boolean;
  searchString: string;
  setSearchString: (value: string) => void;
  placeholder: string;
  inputAriaLabel: string;
  buttonAriaLabel: string;
  onSearchClick: () => void;
  onSearchPointerDown: (() => void) | undefined;
  onInputBlur: (() => void) | undefined;
  iconSrc: string;
  labelsTab: boolean;
};

function settingsSearchView(settings: SettingsSearch): HeaderSearchView {
  return {
    isSettings: true,
    expanded: settings.expanded,
    fadingOut: false,
    searchString: settings.searchString,
    setSearchString: settings.setSearchString,
    placeholder: settings.placeholder,
    inputAriaLabel: settings.ariaLabel,
    buttonAriaLabel: settings.buttonAriaLabel,
    onSearchClick: settings.toggleExpanded,
    onSearchPointerDown: settings.onSearchPointerDown,
    onInputBlur: settings.onInputBlur,
    iconSrc: settings.iconSrc,
    labelsTab: settings.tab === "labels",
  };
}

function haikuSearchView(haiku: HaikuSearch, t: Translate): HeaderSearchView {
  return {
    isSettings: false,
    expanded: haiku.expanded,
    fadingOut: haiku.fadingOut,
    searchString: haiku.searchString,
    setSearchString: haiku.setSearchString,
    placeholder: t("placeholder"),
    inputAriaLabel: t("inputAriaLabel"),
    buttonAriaLabel: t("buttonAriaLabel"),
    onSearchClick: haiku.openSearch,
    onSearchPointerDown: undefined,
    onInputBlur: haiku.onBlur,
    iconSrc: HEADER_HAIKU_SEARCH_ICON_SRC,
    labelsTab: false,
  };
}

/** Settings tab search wins on `/settings`; haiku title search on `/`; null elsewhere. */
export function resolveHeaderSearchView(
  settings: SettingsSearch,
  haiku: HaikuSearch,
  t: Translate,
): HeaderSearchView | null {
  if (settings.enabled) return settingsSearchView(settings);
  if (haiku.enabled) return haikuSearchView(haiku, t);
  return null;
}
