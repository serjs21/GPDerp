"use client";

import { useId, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { withDefaults } from "@/utils/props/withDefaults";
import { PATH_OVERLAY_DEFAULTS } from "./consts/pathOverlayConsts";
import styles from "./PathOverlay.module.css";
import { PathOverlayContent } from "./PathOverlayContent";
import { PathScrim } from "./PathScrim";
import type { PathSeam } from "./pathGeometry";
import { usePathOverlayMount } from "./usePathOverlayMount";

export type PathOverlayFillOrigin =
  | "center"
  | "corners"
  | "sideCorners"
  | "vertical";
export type PathOverlaySeam = PathSeam;

export type PathOverlayProps = {
  open: boolean;
  onClose?: () => void;
  /** Left (dark) half. */
  onKeepScrolling?: () => void;
  /** Right (light) half. */
  onGoToBeginning?: () => void;
  /**
   * Where the stagger fill begins.
   * - `center` — bloom from viewport center
   * - `corners` — dark from top-left, light from bottom-right
   * - `sideCorners` — dark from both left corners, light from both right corners
   * - `vertical` — dark/bright from top vs bottom (sun-aware); skyMid / highlight paints
   */
  fillOrigin?: PathOverlayFillOrigin;
  /**
   * Split geometry.
   * - `sCurve` — expressed S-seam
   * - `straight` — vertical midline
   */
  seam?: PathOverlaySeam;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PathOverlay(props: PathOverlayProps) {
  const { open, fillOrigin, seam, className, contentClassName } = withDefaults(props, PATH_OVERLAY_DEFAULTS);
  const { onKeepScrolling, onGoToBeginning } = props;
  const t = useTranslations("PathOverlay.pathOverlay");
  const titleId = useId();
  const clipUid = useId().replace(/:/g, "");
  const darkClipId = `path-dark-${clipUid}`;
  const lightClipId = `path-light-${clipUid}`;
  const reduceMotion = useReducedMotion();
  const escape = onKeepScrolling ?? props.onClose;
  const { mounted, handleCloseComplete } = usePathOverlayMount(open, escape);

  if (typeof document === "undefined") return null;

  const rootClass = [styles.root, className].filter(Boolean).join(" ");
  const contentClass = [styles.content, contentClassName].filter(Boolean).join(" ");

  const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    escape?.();
  };

  return createPortal(
    <AnimatePresence>
      {mounted ? (
        <motion.div
          key="path-overlay"
          className={rootClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleRootKeyDown}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          <span id={titleId} className={styles.visuallyHidden}>
            {t("title")}
          </span>

          <PathScrim
            open={open}
            reduceMotion={reduceMotion}
            fillOrigin={fillOrigin}
            seam={seam}
            darkClipId={darkClipId}
            lightClipId={lightClipId}
            onKeepScrolling={onKeepScrolling}
            onGoToBeginning={onGoToBeginning}
            onCloseComplete={handleCloseComplete}
          />

          <PathOverlayContent open={open} reduceMotion={reduceMotion} className={contentClass}>
            {props.children}
          </PathOverlayContent>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
