"use client";

import styles from "./LabelMethodIcon.module.css";

export type LabelMethodIconProps = {
  src: string;
  /**
   * Visual variant for the static CSS bubble frame.
   * Kept for call-site compatibility (no Comical / useEffect).
   */
  bubbleStyle?: "speech" | "thought" | "pointedArcs" | "circle" | "caption" | "rectangle" | string;
  sourceDirection?: string;
  /** Dims the frame when the parent tab is inactive. */
  active?: boolean;
};

/**
 * Comic method icon with a static CSS bubble frame.
 * Avoids Comical.js single-edit-root races used by ShareMethodIcon.
 */
export function LabelMethodIcon({
  src,
  bubbleStyle = "rectangle",
  active = true,
}: LabelMethodIconProps) {
  const frameClass =
    bubbleStyle === "thought" || bubbleStyle === "circle"
      ? styles.frameRound
      : styles.frameRect;

  return (
    <div
      className={[styles.stage, active ? styles.active : styles.inactive].filter(Boolean).join(" ")}
    >
      <div className={[styles.frame, frameClass].join(" ")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
        <img src={src} alt="" className={styles.icon} draggable={false} />
      </div>
    </div>
  );
}
