"use client";

import { resolveLabelMethodFrame } from "./utils/labelMethodFrameUtils";
import styles from "./LabelMethodIcon.module.css";

export type LabelMethodIconBubbleStyle =
  | "speech"
  | "thought"
  | "pointedArcs"
  | "circle"
  | "caption"
  | "rectangle"
  | "diamond";

export type LabelMethodIconProps = {
  src: string;
  /**
   * Visual variant for the static CSS bubble frame.
   * Kept for call-site compatibility (no Comical / useEffect).
   */
  bubbleStyle?: LabelMethodIconBubbleStyle | string;
  sourceDirection?: string;
  /** Dims the frame when the parent tab is inactive. */
  active?: boolean;
  className?: string;
};

/**
 * Comic method icon with a static CSS bubble frame.
 * Avoids Comical.js single-edit-root races used by ShareMethodIcon.
 */
export function LabelMethodIcon({
  src,
  bubbleStyle = "rectangle",
  active = true,
  className,
}: LabelMethodIconProps) {
  const { frameClass, burstOutline } = resolveLabelMethodFrame(String(bubbleStyle));

  return (
    <div
      className={[
        styles.stage,
        active ? styles.active : styles.inactive,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={[styles.frame, frameClass].join(" ")}>
        {burstOutline ? (
          <svg
            className={styles.burstOutline}
            viewBox={`0 0 ${burstOutline.width} ${burstOutline.height}`}
            aria-hidden
          >
            <path d={burstOutline.d} fill="#111111" transform="translate(4 4)" />
            <path
              d={burstOutline.d}
              fill="#ffffff"
              stroke="#111111"
              strokeWidth="3.25"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
        <img src={src} alt="" className={styles.icon} draggable={false} />
      </div>
    </div>
  );
}
