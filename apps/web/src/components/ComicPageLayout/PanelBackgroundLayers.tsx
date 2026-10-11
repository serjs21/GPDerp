"use client";

import { FineBandsLayer } from "./FineBandsLayer";
import type { PanelBackgroundLayersProps } from "./PanelBackgroundLayers.types";
import { panelBackgroundClass } from "./utils/comicPagePanelUtils";
import panelStyles from "./ComicPagePanel.module.css";

/** Static fill, speed-line motion layer / loading overlay, and the fine pattern bands. */
export function PanelBackgroundLayers({ mode, fineBands, shine, loading }: PanelBackgroundLayersProps) {
  const showMotionOverlay = loading && !mode.isMotion;

  return (
    <>
      <div className={panelBackgroundClass(mode, fineBands.visible, shine)} aria-hidden />
      {mode.isMotion ? (
        <div className={[panelStyles.bgLayer, panelStyles.bgMotion].join(" ")} aria-hidden />
      ) : null}
      {showMotionOverlay ? (
        <div className={[panelStyles.bgLayer, panelStyles.bgMotionOverlay].join(" ")} aria-hidden />
      ) : null}
      {fineBands.visible ? <FineBandsLayer exiting={fineBands.exiting} /> : null}
    </>
  );
}
