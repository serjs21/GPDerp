"use client";

import styles from "./OverlayPrevLabel.module.css";

export type OverlayPrevLabelProps = {
  className?: string;
};

/** Path overlay “return” cue — own styles; do not share with OverlayNextLabel. */
export function OverlayPrevLabel({ className }: OverlayPrevLabelProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <span className={styles.label}>Go back to the start</span>
      {/* eslint-disable-next-line @next/next/no-img-element -- static public asset */}
      <img
        className={styles.arrow}
        src="/overlay/arrow-return.png"
        alt=""
        width={239}
        height={183}
        draggable={false}
        aria-hidden
      />
    </div>
  );
}
