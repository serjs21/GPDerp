"use client";

import { FinePatternTiles } from "./FinePatternTiles";
import type { FineBandsLayerProps } from "./FineBandsLayer.types";
import panelStyles from "./ComicPagePanel.module.css";

const FINE_CLOUD_SRC = "/fine_panel/fine_cloud_pattern.svg";
const FINE_FLAME_SRC = "/fine_panel/fine_flame_pattern.svg";

/** "This is fine" cloud and flame pattern bands clipped to the panel. */
export function FineBandsLayer({ exiting }: FineBandsLayerProps) {
  return (
    <div className={panelStyles.fineBandsClip} aria-hidden>
      <div
        className={[panelStyles.fineCloudBand, exiting && panelStyles.fineCloudBandExit].filter(Boolean).join(" ")}
      >
        <FinePatternTiles src={FINE_CLOUD_SRC} />
      </div>
      <div
        className={[panelStyles.fineFlameBand, exiting && panelStyles.fineFlameBandExit].filter(Boolean).join(" ")}
      >
        <FinePatternTiles src={FINE_FLAME_SRC} />
      </div>
    </div>
  );
}
