"use client";

import { useMemo, type CSSProperties } from "react";
import {
  layoutComicBurstLabel,
  type ComicBurstShapeKind,
} from "./comicBurstPath";
import {
  burstDisplayFontSize,
  measureComicBurstTextWidth,
} from "./measureComicBurstText";
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
};

const DEFAULT_FILL = "#f4511e";
const DEFAULT_STROKE = "#000000";
const DEFAULT_TEXT_COLOR = "#ffffff";

/**
 * Comic-book impact burst label: procedural SVG spikes + Bangers KA-BLAM lettering.
 * Shape is seeded from `seed ?? text` so the silhouette stays stable across renders.
 * Longer text uses a slightly smaller display size so lettering stays inside the silhouette.
 */
export function ComicBurstLabel({
  text,
  fill = DEFAULT_FILL,
  stroke = DEFAULT_STROKE,
  textColor = DEFAULT_TEXT_COLOR,
  spikeCount = 12,
  randomness = 0.18,
  shapeKind = "burst",
  paddingX = 18,
  paddingY = 14,
  strokeWidth = 4,
  seed,
  fontSize: fontSizeProp,
  className,
}: ComicBurstLabelProps) {
  const seedKey = seed ?? text;

  const { layout, fontSize, strokePx } = useMemo(() => {
    const fontSize = fontSizeProp ?? burstDisplayFontSize(text);
    const textWidth = measureComicBurstTextWidth(text, fontSize);
    const layout = layoutComicBurstLabel({
      textWidth,
      fontSize,
      paddingX,
      paddingY,
      spikeCount,
      randomness,
      seedKey,
      kind: shapeKind,
      text,
    });
    const strokePx = Math.min(2.5, Math.max(1.5, fontSize * 0.08));
    return { layout, fontSize, strokePx };
  }, [text, fontSizeProp, paddingX, paddingY, spikeCount, randomness, seedKey, shapeKind]);

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
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d={layout.d}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span className={styles.labelText} style={{ color: textColor }} aria-hidden>
        {text}
      </span>
    </div>
  );
}
