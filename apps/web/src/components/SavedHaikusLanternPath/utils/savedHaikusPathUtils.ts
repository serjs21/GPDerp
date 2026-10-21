import type { CSSProperties } from "react";
import { SVG_PATH_LANTERN_WIDTH_REM } from "@/components/SVGPath";

/** Loader lantern at the size of the path's first (focused, unscaled) lantern. */
export function savedHaikusPathLoaderStyle(): CSSProperties {
  return { "--wag-lantern-width": `${SVG_PATH_LANTERN_WIDTH_REM}rem` } as CSSProperties;
}

export type HaikuPaging = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
};

const NO_PAGING: HaikuPaging = { hasNextPage: false, isFetchingNextPage: false, fetchNextPage: () => {} };

/** No paging until the debounced term catches up, so typing never triggers list requests. */
export function visibleHaikuPaging(params: {
  isSearching: boolean;
  searchPending: boolean;
  list: HaikuPaging;
  search: HaikuPaging;
}): HaikuPaging {
  if (!params.isSearching) return params.list;
  return params.searchPending ? NO_PAGING : params.search;
}

export type SavedHaikusPathPhase = "hidden" | "loading" | "error" | "searching" | "ready";

export function savedHaikusPathPhase(params: {
  signedIn: boolean;
  isInitialLoading: boolean;
  isError: boolean;
  showSearchLoader: boolean;
}): SavedHaikusPathPhase {
  if (!params.signedIn) return "hidden";
  if (params.isInitialLoading) return "loading";
  if (params.isError) return "error";
  if (params.showSearchLoader) return "searching";
  return "ready";
}
