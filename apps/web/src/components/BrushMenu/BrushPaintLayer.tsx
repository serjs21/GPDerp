"use client";

import { useEffect, useId, useRef } from "react";
import {
  BRUSH_MENU_ICON_HEIGHT,
  BRUSH_MENU_ICON_VIEWBOX,
  BRUSH_MENU_ICON_WIDTH,
  brushMenuIconForIndex,
  type BrushMenuIconSrc,
} from "./brushMenuIcons";
import { BRUSH_REVEAL_PATHS } from "./brushRevealPaths";
import styles from "./BrushPaintLayer.module.css";

/** One SVGPathElement per entry in BRUSH_REVEAL_PATHS (same order). */
export type BrushOptionBrushPaths = SVGPathElement[];

export type BrushPaintLayerProps = {
  /** Option index (kept for API; ink brush is shared). */
  index?: number;
  iconSrc?: BrushMenuIconSrc | string;
  className?: string;
  onBrushPaths?: (paths: BrushOptionBrushPaths | null) => void;
};

function sanitizeSvgId(reactId: string): string {
  return reactId.replace(/:/g, "");
}

/**
 * Masked ink_brush artwork; paths register for Anime.js createDrawable reveal.
 */
export function BrushPaintLayer({
  index = 0,
  iconSrc,
  className,
  onBrushPaths,
}: BrushPaintLayerProps) {
  const reactId = useId();
  const idBase = sanitizeSvgId(reactId);
  const maskId = `brush-paint-mask-${idBase}`;
  const resolvedIconSrc = iconSrc ?? brushMenuIconForIndex(index);

  const pathRefs = useRef<(SVGPathElement | null)[]>(
    BRUSH_REVEAL_PATHS.map(() => null),
  );
  const onBrushPathsRef = useRef(onBrushPaths);
  onBrushPathsRef.current = onBrushPaths;

  useEffect(() => {
    const paths = pathRefs.current.filter(
      (path): path is SVGPathElement => path != null,
    );
    if (paths.length === BRUSH_REVEAL_PATHS.length) {
      onBrushPathsRef.current?.(paths);
    }
    return () => {
      onBrushPathsRef.current?.(null);
    };
  }, []);

  return (
    <svg
      className={`${styles.brush}${className ? ` ${className}` : ""}`}
      viewBox={BRUSH_MENU_ICON_VIEWBOX}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={BRUSH_MENU_ICON_WIDTH}
          height={BRUSH_MENU_ICON_HEIGHT}
        >
          <rect
            width={BRUSH_MENU_ICON_WIDTH}
            height={BRUSH_MENU_ICON_HEIGHT}
            fill="#000000"
          />
          {BRUSH_REVEAL_PATHS.map((def, pathIndex) => (
            <path
              key={def.id}
              ref={(node) => {
                pathRefs.current[pathIndex] = node;
              }}
              d={def.d}
              fill="none"
              stroke="#ffffff"
              strokeWidth={def.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              data-brush-pass={def.id}
            />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <image
          href={resolvedIconSrc}
          width={BRUSH_MENU_ICON_WIDTH}
          height={BRUSH_MENU_ICON_HEIGHT}
          preserveAspectRatio="none"
        />
      </g>
    </svg>
  );
}
