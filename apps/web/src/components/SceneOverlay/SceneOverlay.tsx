"use client";

import {
  useEffect,
  useId,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./SceneOverlay.module.css";

export type SceneOverlayAppearance = "dim" | "blur" | "vignette" | "inkWash";

export type SceneOverlayProps = {
  open: boolean;
  onClose?: () => void;
  appearance?: SceneOverlayAppearance;
  closeOnScrimClick?: boolean;
  children?: ReactNode;
  className?: string;
  /** Optional class for the centered content slot */
  contentClassName?: string;
};

const SCRIM_CLASS: Record<SceneOverlayAppearance, string> = {
  dim: styles.scrimDim,
  blur: styles.scrimBlur,
  vignette: styles.scrimVignette,
  inkWash: styles.scrimInkWash,
};

export function SceneOverlay({
  open,
  onClose,
  appearance = "dim",
  closeOnScrimClick = true,
  children,
  className,
  contentClassName,
}: SceneOverlayProps) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !onClose) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const rootClass = [styles.root, className].filter(Boolean).join(" ");
  const contentClass = [styles.content, contentClassName].filter(Boolean).join(" ");
  const scrimClass = [styles.scrim, SCRIM_CLASS[appearance]].filter(Boolean).join(" ");

  const fadeTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  const contentTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };

  const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && onClose) {
      event.stopPropagation();
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="scene-overlay"
          className={rootClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleRootKeyDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeTransition}
        >
          <span id={titleId} className={styles.visuallyHidden}>
            Overlay
          </span>
          <motion.button
            type="button"
            className={scrimClass}
            aria-label="Close overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            onClick={() => {
              if (closeOnScrimClick) onClose?.();
            }}
          />
          <motion.div
            className={contentClass}
            style={{ overflow: "visible" } as CSSProperties}
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={contentTransition}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
