"use client";

import { memo, useMemo, type CSSProperties, type ReactNode } from "react";
import type { ComicBurstShapeKind } from "./comicBurstPath";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { withDefaults } from "@/utils/props/withDefaults";
import { BurstOverlay } from "./BurstOverlay";
import { resolveBurstLayout, strokeCapsForShape } from "./utils/burstLayoutUtils";
import { stretchPathProps, stretchSvgProps } from "./utils/stretchUtils";
import styles from "./ComicBurstLabel.module.css";

export type ComicBurstLabelProps = {
  text: string;
  fill?: string;
  stroke?: string;
  textColor?: string;
  spikeCount?: number;
  randomness?: number;
  /** Silhouette family: burst spikes, ellipse, rounded square, or thought cloud. */
  shapeKind?: ComicBurstShapeKind;
  paddingX?: number;
  paddingY?: number;
  strokeWidth?: number;
  /** Optional override; defaults to `text` for deterministic silhouettes. */
  seed?: string | number;
  /** Optional fixed size; when omitted, uses short/long display size from text length. */
  fontSize?: number;
  className?: string;
  /** Optional content before lettering (e.g. an icon). Ignored when `children` replaces text. */
  leading?: ReactNode;
  /** When set, replaces lettering with custom content (e.g. an avatar icon). */
  children?: ReactNode;
  /**
   * Let the SVG silhouette stretch to the box CSS gives it (no aspect lock,
   * constant stroke). Meant for `rect`; spiky shapes would distort.
   */
  stretch?: boolean;
};

const COMIC_BURST_LABEL_DEFAULTS = {
  fill: "#f4511e",
  stroke: "#000000",
  textColor: "#ffffff",
  spikeCount: 12,
  randomness: 0.18,
  shapeKind: "burst",
  paddingX: 18,
  paddingY: 14,
  strokeWidth: 4,
} as const;

/**
 * Comic-book impact burst label: procedural SVG spikes + Bangers KA-BLAM lettering.
 * Shape is seeded from `seed ?? text` so the silhouette stays stable across renders.
 * Longer text uses a slightly smaller display size so lettering stays inside the silhouette.
 */
export const ComicBurstLabel = memo(function ComicBurstLabel(props: ComicBurstLabelProps) {
  const {
    text,
    fill,
    stroke,
    textColor,
    spikeCount,
    randomness,
    shapeKind,
    paddingX,
    paddingY,
    strokeWidth,
  } = withDefaults(props, COMIC_BURST_LABEL_DEFAULTS);
  const { className, leading, children } = props;
  const seedKey = props.seed ?? text;
  const { strokeLinejoin, strokeLinecap } = strokeCapsForShape(shapeKind);
  const canMeasure = useIsHydrated();

  const { layout, fontSize, strokePx } = useMemo(
    () =>
      resolveBurstLayout({
        text,
        fontSizeProp: props.fontSize,
        paddingX,
        paddingY,
        spikeCount,
        randomness,
        seedKey,
        shapeKind,
        hasChildren: Boolean(children),
        hasLeading: Boolean(leading),
        canMeasure,
      }),
    [
      canMeasure,
      text,
      props.fontSize,
      paddingX,
      paddingY,
      spikeCount,
      randomness,
      seedKey,
      shapeKind,
      children,
      leading,
    ],
  );

  const rootStyle = {
    "--burst-font-size": `${fontSize}px`,
    "--burst-stroke": `${strokePx}px`,
  } as CSSProperties;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={rootStyle}
      role="img"
      aria-label={text}
      data-comic-role="label"
    >
      <svg
        className={styles.svg}
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        {...stretchSvgProps(props.stretch)}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d={layout.d}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin={strokeLinejoin}
          strokeLinecap={strokeLinecap}
          {...stretchPathProps(props.stretch)}
        />
      </svg>
      <BurstOverlay text={text} textColor={textColor} leading={leading}>
        {children}
      </BurstOverlay>
    </div>
  );
});
