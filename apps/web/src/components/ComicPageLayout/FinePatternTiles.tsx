"use client";

import panelStyles from "./ComicPagePanel.module.css";

/** Enough tiles to cover wide panels with 0.5rem overlap. */
const FINE_TILE_COUNT = 12;

export function FinePatternTiles({ src }: { src: string }) {
  return Array.from({ length: FINE_TILE_COUNT }, (_, index) => (
    // eslint-disable-next-line @next/next/no-img-element -- static public SVG tile
    <img
      key={`${src}-${index}`}
      className={panelStyles.fineTile}
      src={src}
      alt=""
      draggable={false}
    />
  ));
}
