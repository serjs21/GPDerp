import type { CSSProperties } from "react";
import {
  LABEL_HALO_DROP_PAD_EXTRA_REM,
  LABEL_HALO_DROP_PAD_REM,
} from "@/components/LabelHalo";
import {
  LANTERN_IMAGE_HEIGHT,
  LANTERN_IMAGE_WIDTH,
  LANTERN_WIDTH_REM,
} from "@/components/Lantern/constants";
import {
  LABEL_HALO_CONTENT_MIN_HEIGHT_REM,
  SHARE_LINK_PREVIEW_EXTRA_HEIGHT_REM,
} from "../consts/shareLinkPreviewModalConsts";

/** Rendered height of a wrap-layout LabelHalo around a default-width LanternFrame. */
export function labelHaloHeightRem(lanternWidthRem: number = LANTERN_WIDTH_REM): number {
  const lanternHeightRem = (lanternWidthRem * LANTERN_IMAGE_HEIGHT) / LANTERN_IMAGE_WIDTH;
  const padTop = LABEL_HALO_DROP_PAD_REM + LABEL_HALO_DROP_PAD_EXTRA_REM;
  const padBottom = LABEL_HALO_DROP_PAD_REM;
  return padTop + Math.max(LABEL_HALO_CONTENT_MIN_HEIGHT_REM, lanternHeightRem) + padBottom;
}

export function shareLinkPreviewPanelStyle(): CSSProperties {
  return {
    height: `${labelHaloHeightRem() + SHARE_LINK_PREVIEW_EXTRA_HEIGHT_REM}rem`,
  };
}
