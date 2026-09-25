"use client";

import { useRef } from "react";
import { DUALITY_BUTTON_DIRECTION_SRC } from "./consts/dualityButtonConsts";
import styles from "./CoverLabel.module.css";
import { useCoverLabelMorph } from "./useCoverLabelMorph";

export type CoverLabelProps = {
  title: string;
  /** When true, flips title chars out and the direction arrow in. */
  expanded: boolean;
  uncoverMs?: number;
  onMorphComplete?: () => void;
  className?: string;
};

/**
 * Direction-slot cue: title that morphs into the duality arrow via per-character
 * rotateX (same pattern as RestartLinkButton labels).
 */
export function CoverLabel({
  title,
  expanded,
  uncoverMs,
  onMorphComplete,
  className,
}: CoverLabelProps) {
  const titleLineRef = useRef<HTMLSpanElement>(null);
  const arrowFaceRef = useRef<HTMLSpanElement>(null);

  useCoverLabelMorph(
    expanded,
    titleLineRef,
    arrowFaceRef,
    uncoverMs,
    onMorphComplete,
  );

  return (
    <span
      className={[styles.cue, className].filter(Boolean).join(" ")}
      aria-hidden
    >
      <span className={styles.flipStage}>
        <span ref={titleLineRef} className={styles.titleLine}>
          {Array.from(title).map((ch, index) => (
            <span
              key={`${ch}-${String(index)}`}
              className={styles.char}
              data-cover-char
            >
              {ch === " " ? "\u00a0" : ch}
            </span>
          ))}
        </span>
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
  );
}
