import type { CSSProperties } from "react";
import { LOADING_TEXT_DOT_COUNT } from "../consts/loadingTextConsts";

/** The dot cycle is the bare word plus one step per dot. */
export function buildLoadingTextStyle(stepMs: number): CSSProperties {
  return { "--loading-text-dots-duration": `${(LOADING_TEXT_DOT_COUNT + 1) * stepMs}ms` } as CSSProperties;
}
