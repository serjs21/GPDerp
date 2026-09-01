"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { PaperRoughFrame } from "./PaperRoughFrame";
import { PaperSurface } from "./PaperSurface";
import { resolvePaperMotion, type PaperMotionPreset } from "./paperMotion";
import { PAPER_SIZE_MAX_WIDTH, type PaperModalSize } from "./paperTokens";
import styles from "./PaperModal.module.css";

export type PaperModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  /** Optional visible description text (also sets accessible description). */
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  motionPreset?: PaperMotionPreset;
  size?: PaperModalSize;
  showClose?: boolean;
  /** Rough.js seed for reproducible borders. */
  roughSeed?: number;
  className?: string;
  /** When false, pointer interaction outside does not dismiss. Default true. */
  closeOnOverlayClick?: boolean;
};

export function PaperModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  motionPreset = "dropSettle",
  size = "md",
  showClose = true,
  roughSeed = 42,
  className,
  closeOnOverlayClick = true,
}: PaperModalProps) {
  const reduceMotion = useReducedMotion();
  const motionBundle = resolvePaperMotion(motionPreset);
  const overlayVariants = reduceMotion ? motionBundle.reducedOverlay : motionBundle.overlay;
  const paperVariants = reduceMotion ? motionBundle.reducedPaper : motionBundle.paper;

  const paperStyle = {
    "--paper-modal-max-width": PAPER_SIZE_MAX_WIDTH[size],
  } as CSSProperties;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open ? (
            <Dialog.Overlay asChild forceMount key="paper-modal-overlay">
              <motion.div
                className={styles.overlay}
                variants={overlayVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              />
            </Dialog.Overlay>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {open ? (
            <Dialog.Content
              asChild
              forceMount
              key="paper-modal-content"
              onPointerDownOutside={(event) => {
                if (!closeOnOverlayClick) event.preventDefault();
              }}
              onInteractOutside={(event) => {
                if (!closeOnOverlayClick) event.preventDefault();
              }}
            >
              <motion.div
                className={styles.contentRoot}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={{
                  initial: {},
                  animate: {},
                  exit: { transition: { when: "afterChildren" } },
                }}
              >
                <motion.div
                  className={[styles.paper, className].filter(Boolean).join(" ")}
                  style={paperStyle}
                  variants={paperVariants}
                >
                  <PaperSurface />
                  <PaperRoughFrame seed={roughSeed} />

                  <div className={styles.body}>
                    {(title || showClose) && (
                      <div className={styles.header}>
                        {title ? (
                          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                        ) : (
                          <Dialog.Title className={styles.visuallyHidden}>Dialog</Dialog.Title>
                        )}
                        {showClose ? (
                          <Dialog.Close asChild>
                            <button type="button" className={styles.closeButton} aria-label="Close">
                              ×
                            </button>
                          </Dialog.Close>
                        ) : null}
                      </div>
                    )}

                    {!title && !showClose ? (
                      <Dialog.Title className={styles.visuallyHidden}>Dialog</Dialog.Title>
                    ) : null}

                    {description ? (
                      <Dialog.Description className={styles.description}>{description}</Dialog.Description>
                    ) : (
                      <Dialog.Description className={styles.visuallyHidden}> </Dialog.Description>
                    )}

                    {children ? <div className={styles.children}>{children}</div> : null}
                    {footer ? <div className={styles.footer}>{footer}</div> : null}
                  </div>
                </motion.div>
              </motion.div>
            </Dialog.Content>
          ) : null}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type { PaperMotionPreset } from "./paperMotion";
export type { PaperModalSize } from "./paperTokens";
