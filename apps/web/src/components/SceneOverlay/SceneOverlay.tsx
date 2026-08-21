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
import {
  yinYangDarkPath,
  yinYangLightPath,
} from "./yinYangPaths";

export type SceneOverlayAppearance =
  | "dim"
  | "blur"
  | "vignette"
  | "inkWash"
  | "yinYang";

export type SceneOverlayProps = {
  open: boolean;
  onClose?: () => void;
  /** Left (dark) half when appearance is yinYang. */
  onKeepScrolling?: () => void;
  /** Right (light) half when appearance is yinYang. */
  onGoToBeginning?: () => void;
  appearance?: SceneOverlayAppearance;
  closeOnScrimClick?: boolean;
  children?: ReactNode;
  className?: string;
  /** Optional class for the centered content slot */
  contentClassName?: string;
};

const SCRIM_CLASS: Record<Exclude<SceneOverlayAppearance, "yinYang">, string> = {
  dim: styles.scrimDim,
  blur: styles.scrimBlur,
  vignette: styles.scrimVignette,
  inkWash: styles.scrimInkWash,
};

const DARK_PATH = yinYangDarkPath();
const LIGHT_PATH = yinYangLightPath();

export function SceneOverlay({
  open,
  onClose,
  onKeepScrolling,
  onGoToBeginning,
  appearance = "dim",
  closeOnScrimClick = true,
  children,
  className,
  contentClassName,
}: SceneOverlayProps) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const isYinYang = appearance === "yinYang";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isYinYang) {
        (onKeepScrolling ?? onClose)?.();
        return;
      }
      onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onKeepScrolling, isYinYang]);

  if (typeof document === "undefined") return null;

  const rootClass = [styles.root, className].filter(Boolean).join(" ");
  const contentClass = [styles.content, contentClassName].filter(Boolean).join(" ");

  const fadeTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  const contentTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };

  const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    if (isYinYang) {
      (onKeepScrolling ?? onClose)?.();
      return;
    }
    onClose?.();
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

          {isYinYang ? (
            <motion.div
              className={styles.yinYangScrim}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
            >
              <svg
                className={styles.yinYangSvg}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  className={styles.scrimYinRightFill}
                  d={LIGHT_PATH}
                  role="button"
                  tabIndex={0}
                  aria-label="Go back to the beginning"
                  onClick={() => onGoToBeginning?.()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onGoToBeginning?.();
                    }
                  }}
                />
                <path
                  className={styles.scrimYinLeftFill}
                  d={DARK_PATH}
                  role="button"
                  tabIndex={0}
                  aria-label="Keep scrolling"
                  onClick={() => onKeepScrolling?.()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onKeepScrolling?.();
                    }
                  }}
                />
              </svg>
              <div className={styles.yinLabels} aria-hidden>
                <span className={`${styles.yinLabel} ${styles.yinLabelLeft}`}>
                  Keep scrolling
                </span>
                <span className={`${styles.yinLabel} ${styles.yinLabelRight}`}>
                  Go back to the beginning
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              className={`${styles.scrim} ${SCRIM_CLASS[appearance]}`}
              aria-label="Close overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
              onClick={() => {
                if (closeOnScrimClick) onClose?.();
              }}
            />
          )}

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
