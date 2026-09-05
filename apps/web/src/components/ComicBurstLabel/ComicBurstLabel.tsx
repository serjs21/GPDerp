"use client";

import { useMemo, type CSSProperties } from "react";
import { layoutComicBurstLabel } from "./comicBurstPath";
import {
  fitBurstFontSize,
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
  /** Optional fixed size; when omitted, size auto-fits to the burst. */
  fontSize?: number;
  className?: string;
};

const DEFAULT_FILL = "#f4511e";
const DEFAULT_STROKE = "#000000";
const DEFAULT_TEXT_COLOR = "#ffffff";

/**
 * Comic-book impact burst label: procedural SVG spikes + Bangers KA-BLAM lettering.
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
  fontSize: fontSizeProp,
  className,
}: ComicBurstLabelProps) {
  const seedKey = seed ?? text;

  const { layout, fontSize, strokePx } = useMemo(() => {
    const fontSize = fontSizeProp ?? fitBurstFontSize(text, paddingX);
    const textWidth = measureComicBurstTextWidth(text, fontSize);
    const layout = layoutComicBurstLabel({
      textWidth,
      fontSize,
      paddingX,
      paddingY,
      spikeCount,
      randomness,
      seedKey,
    });
    const strokePx = Math.min(2.5, Math.max(1.5, fontSize * 0.08));
    return { layout, fontSize, strokePx };
  }, [text, fontSizeProp, paddingX, paddingY, spikeCount, randomness, seedKey]);

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
