"use client";

import type { ReactNode } from "react";
import styles from "./OverlayTitle.module.css";

export type OverlayTitleDirection = "bottom" | "top" | "left" | "right";

export type OverlayTitleProps = {
  title: ReactNode;
  /**
   * Edge the overlay grows from when it appears.
   * `"bottom"` rises upward (bottom → top).
   */
  direction?: OverlayTitleDirection;
  /** When false, the title overlay is greyscaled (unchecked controls). */
  active?: boolean;
  children: ReactNode;
  className?: string;
};

const DIRECTION_CLASS: Record<OverlayTitleDirection, string> = {
  bottom: styles.fromBottom,
  top: styles.fromTop,
  left: styles.fromLeft,
  right: styles.fromRight,
};

export function OverlayTitle({
  title,
  direction = "bottom",
  active = true,
  children,
  className,
}: OverlayTitleProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {children}
      <div
        className={[
          styles.overlay,
          DIRECTION_CLASS[direction],
          active ? styles.overlayActive : styles.overlayInactive,
        ].join(" ")}
        aria-hidden
      >
        <span className={styles.title}>{title}</span>
      </div>
    </div>
  );
}
