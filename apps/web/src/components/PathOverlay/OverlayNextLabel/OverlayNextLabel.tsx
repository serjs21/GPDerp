"use client";

import styles from "./OverlayNextLabel.module.css";

export type OverlayNextLabelProps = {
  className?: string;
};

/** Path overlay “continue” cue — own styles; do not share with OverlayPrevLabel. */
export function OverlayNextLabel({ className }: OverlayNextLabelProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <span className={styles.label}>Continue the journey</span>
      {/* eslint-disable-next-line @next/next/no-img-element -- static public asset */}
      <img
        className={styles.arrow}
        src="/overlay/arrow-continue.png"
        alt=""
        width={207}
        height={227}
        draggable={false}
        aria-hidden
      />
    </div>
  );
}
