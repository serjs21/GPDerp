"use client";

import { NAVIGATION_ARROW_SRC } from "./consts/pathNavigationConsts";
import type { PathNavigationArrowsProps } from "./PathNavigation.types";
import styles from "./PathNavigationArrows.module.css";

/** Flanks `children` with path step arrows; hidden arrows keep their slot so `children` stays centered. */
export function PathNavigationArrows({
  showBack,
  showForward,
  onStepBack,
  onStepForward,
  children,
}: PathNavigationArrowsProps) {
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
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative arrow from /public */}
            <img className={styles.icon} src={NAVIGATION_ARROW_SRC} alt="" draggable={false} />
          </button>
        ) : null}
      </span>
      {children}
      <span className={styles.slot}>
        {showBack ? (
          <button
            type="button"
            className={styles.button}
            aria-label="Previous lantern"
            onClick={onStepBack}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative arrow from /public */}
            <img className={styles.icon} src={NAVIGATION_ARROW_SRC} alt="" draggable={false} />
          </button>
        ) : null}
      </span>
    </div>
  );
}
