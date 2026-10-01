"use client";

import { NAVIGATION_ARROW_SRC } from "./consts/navigationArrowConsts";
import type { SVGPathNavigationArrowsProps } from "./SVGPathNavigationArrows.types";
import styles from "./SVGPathNavigationArrows.module.css";

export function SVGPathNavigationArrows({
  showBack,
  showForward,
  onStepBack,
  onStepForward,
}: SVGPathNavigationArrowsProps) {
  return (
    <div className={styles.root}>
      <span className={styles.slot}>
        {showForward ? (
          <button
            type="button"
            className={`${styles.button} ${styles.mirrored}`}
            aria-label="Next lantern"
            onClick={onStepForward}
          >
            <img className={styles.icon} src={NAVIGATION_ARROW_SRC} alt="" draggable={false} />
          </button>
        ) : null}
      </span>
      <span className={styles.slot}>
        {showBack ? (
          <button
            type="button"
            className={styles.button}
            aria-label="Previous lantern"
            onClick={onStepBack}
          >
            <img className={styles.icon} src={NAVIGATION_ARROW_SRC} alt="" draggable={false} />
          </button>
        ) : null}
      </span>
    </div>
  );
}
