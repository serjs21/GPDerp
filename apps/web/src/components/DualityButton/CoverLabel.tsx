"use client";

import { useRef, type CSSProperties } from "react";
import { DUALITY_BUTTON_DIRECTION_SRC } from "./consts/dualityButtonConsts";
import styles from "./CoverLabel.module.css";
import { useCoverLabelMorph } from "./useCoverLabelMorph";

export type CoverLabelProps = {
  title: string;
  /** When true, title exits with magic.css rotateRight; arrow flips in. */
  expanded: boolean;
  uncoverMs?: number;
  onMorphComplete?: () => void;
  className?: string;
};

/**
 * Direction-slot cue: title exits via `magictime rotateRight`, arrow flips in.
 */
export function CoverLabel({
  title,
  expanded,
  uncoverMs,
  onMorphComplete,
  className,
}: CoverLabelProps) {
  const arrowFaceRef = useRef<HTMLSpanElement>(null);

  useCoverLabelMorph(expanded, arrowFaceRef, uncoverMs, onMorphComplete);

  const titleStyle = (
    uncoverMs != null
      ? { "--cover-label-exit-ms": `${uncoverMs}ms` }
      : undefined
  ) as CSSProperties | undefined;

  return (
    <span
      className={[styles.cue, className].filter(Boolean).join(" ")}
      aria-hidden
    >
      <span className={styles.flipStage}>
        <span
          className={[
            styles.titleLine,
            expanded ? `magictime rotateRight ${styles.titleExiting}` : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={titleStyle}
        >
          {Array.from(title).map((ch, index) => (
            <span key={`${ch}-${String(index)}`} className={styles.char}>
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
