"use client";

import { useMemo } from "react";
import { layoutComicBurstLabel } from "./comicBurstPath";
import {
  COMIC_BURST_DEFAULT_FONT_SIZE,
  COMIC_BURST_FONT_STACK,
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
  paddingX?: number;
  paddingY?: number;
  strokeWidth?: number;
  /** Optional override; defaults to `text` for deterministic silhouettes. */
  seed?: string | number;
  fontSize?: number;
  className?: string;
};

const DEFAULT_FILL = "#f4511e";
const DEFAULT_STROKE = "#000000";
const DEFAULT_TEXT_COLOR = "#ffffff";

/**
 * Comic-book impact burst label: procedural SVG spikes around centered text.
 * Shape is seeded from `seed ?? text` so the silhouette stays stable across renders.
 */
export function ComicBurstLabel({
  text,
  fill = DEFAULT_FILL,
  stroke = DEFAULT_STROKE,
  textColor = DEFAULT_TEXT_COLOR,
  spikeCount = 12,
  randomness = 0.18,
  paddingX = 18,
  paddingY = 14,
  strokeWidth = 4,
  seed,
  fontSize = COMIC_BURST_DEFAULT_FONT_SIZE,
  className,
}: ComicBurstLabelProps) {
  const seedKey = seed ?? text;

  const layout = useMemo(() => {
    const textWidth = measureComicBurstTextWidth(text, fontSize, COMIC_BURST_FONT_STACK);
    return layoutComicBurstLabel({
      textWidth,
      fontSize,
      paddingX,
      paddingY,
      spikeCount,
      randomness,
      seedKey,
    });
  }, [text, fontSize, paddingX, paddingY, spikeCount, randomness, seedKey]);

  const textStrokeWidth = Math.max(2, strokeWidth * 0.55);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={text}
    >
      <svg
        className={styles.svg}
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={layout.d}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <text
          className={styles.labelText}
          x={layout.cx}
          y={layout.cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
          stroke={stroke}
          strokeWidth={textStrokeWidth}
          paintOrder="stroke"
          style={{ fontSize }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}
