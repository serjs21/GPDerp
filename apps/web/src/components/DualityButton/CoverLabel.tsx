"use client";

import { useRef, type CSSProperties } from "react";
import {
  COVER_LABEL_ARC_GAP_REM,
  DUALITY_BUTTON_DIRECTION_SRC,
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
  /** When true, flips title chars out and the direction arrow in. */
  expanded: boolean;
  /** Face diameter in rem — used to size the concentric title arc. */
  sizeRem?: number;
  uncoverMs?: number;
  onMorphComplete?: () => void;
  className?: string;
};

/**
 * Direction-slot cue: title sits on an arc concentric with the face circle.
 * On open, the arrow rises from behind on its rotateX hinge and pushes the
 * title outward while it fades.
 */
export function CoverLabel({
  title,
  expanded,
  sizeRem = DUALITY_BUTTON_SIZE_REM,
  uncoverMs,
  onMorphComplete,
  className,
}: CoverLabelProps) {
  const titleLineRef = useRef<HTMLSpanElement>(null);
  const arrowFaceRef = useRef<HTMLSpanElement>(null);
  const chars = Array.from(title);
  const angles = coverLabelCharAngles(chars.length);
  const fontSizeRem = coverLabelFontSizeRem(chars.length, sizeRem);

  useCoverLabelMorph(
    expanded,
    titleLineRef,
    arrowFaceRef,
    uncoverMs,
    onMorphComplete,
  );

  const cueStyle = {
    "--cover-label-arc-gap": `${COVER_LABEL_ARC_GAP_REM}rem`,
    "--cover-label-font-size": `${fontSizeRem}rem`,
  } as CSSProperties;

  return (
    <span
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
          <span ref={arrowFaceRef} className={styles.arrowFace}>
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
