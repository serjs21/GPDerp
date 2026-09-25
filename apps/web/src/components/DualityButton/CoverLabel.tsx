"use client";

import { useRef, type CSSProperties } from "react";
import {
  COVER_LABEL_ARC_GAP_REM,
  COVER_LABEL_ARROW_WIDTH_FRAC,
  DUALITY_BUTTON_DIRECTION_SRC,
  DUALITY_BUTTON_SIZE_REM,
} from "./consts/dualityButtonConsts";
import styles from "./CoverLabel.module.css";
import { useCoverLabelMorph } from "./useCoverLabelMorph";
import {
  coverLabelArrowStartDeg,
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
  className?: string;
};

/**
 * Title + arrow on one concentric track around the face. On open, the arrow
 * rotates in from behind the title, pushes it clockwise, and the title fades.
 */
export function CoverLabel({
  title,
  expanded,
  sizeRem = DUALITY_BUTTON_SIZE_REM,
  uncoverMs,
  onMorphComplete,
  className,
}: CoverLabelProps) {
  const cueRef = useRef<HTMLSpanElement>(null);
  const titleLineRef = useRef<HTMLSpanElement>(null);
  const chars = Array.from(title);
  const angles = coverLabelCharAngles(chars.length);
  const fontSizeRem = coverLabelFontSizeRem(chars.length, sizeRem);
  const arrowStartDeg = coverLabelArrowStartDeg(chars.length);

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
    "--cover-label-arrow-width": String(COVER_LABEL_ARROW_WIDTH_FRAC),
    "--arrow-angle": `${arrowStartDeg}deg`,
    "--title-spin": "0deg",
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
        <span className={styles.arrowSlot}>
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
