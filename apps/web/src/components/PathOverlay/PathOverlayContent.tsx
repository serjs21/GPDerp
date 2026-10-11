"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { PATH_OVERLAY_CONTENT_TRANSITION } from "./consts/pathOverlayConsts";
import type { PathOverlayContentProps } from "./PathOverlayContent.types";
import styles from "./PathOverlay.module.css";

/** Overlay children, fading out with the scrim on close (instant under reduced motion). */
export function PathOverlayContent({ open, reduceMotion, className, children }: PathOverlayContentProps) {
  return (
    <motion.div
      className={className}
      style={{ overflow: "visible" } as CSSProperties}
      initial={false}
      animate={{ opacity: open ? 1 : 0 }}
      transition={reduceMotion ? PATH_OVERLAY_CONTENT_TRANSITION.reduced : PATH_OVERLAY_CONTENT_TRANSITION.full}
    >
      <div className={styles.contentHitTarget}>{children}</div>
    </motion.div>
  );
}
