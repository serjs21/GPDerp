"use client";

import { useRef, type CSSProperties } from "react";
import {
  COVER_LABEL_ARC_GAP_REM,
  DUALITY_BUTTON_DIRECTION_SRC,
  DUALITY_BUTTON_FLIP_MS,
  DUALITY_BUTTON_SIZE_REM,
} from "./consts/dualityButtonConsts";
import styles from "./CoverLabel.module.css";
import { useCoverLabelMorph } from "./useCoverLabelMorph";
import {
  coverLabelCharAngles,
  coverLabelFontSizeRem,
} from "./utils/coverLabelArcUtils";

export type CoverLabelProps = {
  title: string;
  /** When true, arrow pushes title along the arc and title fades out. */
  expanded: boolean;
  /** Face diameter in rem — used to size the concentric title arc. */
  sizeRem?: number;
  uncoverMs?: number;
  onMorphComplete?: () => void;
  /**
   * After open: clockwise base turn (0, 180, 360…) so the arrow rotates with
   * DualityButton flips. Keep 0 while covered / morphing in.
   */
  baseRotateDeg?: number;
  /** Match DualityButton `--duality-flip-ms`. */
  baseRotateMs?: number;
  /** When false, snap base rotate (no tween) — used while re-covering. */
  followBaseRotate?: boolean;
  className?: string;
};

/**
 * Title + arrow on one concentric track around the face. On open, the arrow
 * fades in from behind the title, pushes it clockwise, and the title fades.
 * After open, `baseRotateDeg` turns the cue with the duality base.
 */
export function CoverLabel({
  title,
  expanded,
  sizeRem = DUALITY_BUTTON_SIZE_REM,
  uncoverMs,
  onMorphComplete,
  baseRotateDeg = 0,
  baseRotateMs = DUALITY_BUTTON_FLIP_MS,
  followBaseRotate = false,
  className,
}: CoverLabelProps) {
  const cueRef = useRef<HTMLSpanElement>(null);
  const titleLineRef = useRef<HTMLSpanElement>(null);
  const chars = Array.from(title);
  const angles = coverLabelCharAngles(chars.length);
  const fontSizeRem = coverLabelFontSizeRem(chars.length, sizeRem);

  useCoverLabelMorph(
    expanded,
    cueRef,
    titleLineRef,
    chars.length,
    uncoverMs,
    onMorphComplete,
  );

  const cueStyle = {
    "--cover-label-arc-gap": `${COVER_LABEL_ARC_GAP_REM}rem`,
    "--cover-label-font-size": `${fontSizeRem}rem`,
    "--cover-label-base-rotate": `${baseRotateDeg}deg`,
    "--cover-label-flip-ms": `${baseRotateMs}ms`,
  } as CSSProperties;

  return (
    <span
      ref={cueRef}
      className={[styles.cue, className].filter(Boolean).join(" ")}
      style={cueStyle}
      aria-hidden
    >
      <span className={styles.flipStage}>
        <span ref={titleLineRef} className={styles.titleLine}>
          {chars.map((ch, index) => (
            <span
              key={`${ch}-${String(index)}`}
              className={styles.charSlot}
              style={
                {
                  "--char-angle": `${angles[index] ?? 0}deg`,
                } as CSSProperties
              }
            >
              <span className={styles.char} data-cover-char>
                {ch === " " ? "\u00a0" : ch}
              </span>
            </span>
          ))}
        </span>
        <span
          className={[
            styles.arrowSlot,
            followBaseRotate ? styles.arrowSlotTracking : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.arrowFace}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
            <img
              className={styles.arrow}
              src={DUALITY_BUTTON_DIRECTION_SRC}
              alt=""
              draggable={false}
              decoding="async"
            />
          </span>
        </span>
      </span>
    </span>
  );
}
