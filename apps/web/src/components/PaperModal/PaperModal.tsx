"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { withDefaults } from "@/utils/props/withDefaults";
import { PaperModalBody } from "./PaperModalBody";
import { PaperRoughFrame } from "./PaperRoughFrame";
import { PaperSurface } from "./PaperSurface";
import type { PaperMotionPreset } from "./paperMotion";
import { PAPER_SIZE_MAX_WIDTH, type PaperModalSize } from "./paperTokens";
import { usePaperMotionVariants } from "./usePaperMotionVariants";
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

const PAPER_MODAL_DEFAULTS = {
  motionPreset: "dropSettle",
  size: "md",
  showClose: true,
  roughSeed: 42,
  closeOnOverlayClick: true,
} as const;

/** Waits for the paper's exit before the content root unmounts. */
const CONTENT_ROOT_VARIANTS = {
  initial: {},
  animate: {},
  exit: { transition: { when: "afterChildren" } },
} as const;

export function PaperModal(props: PaperModalProps) {
  const { motionPreset, size, showClose, roughSeed, closeOnOverlayClick } = withDefaults(
    props,
    PAPER_MODAL_DEFAULTS,
  );
  const { open, onOpenChange, title, description, children, footer, className } = props;
  const variants = usePaperMotionVariants(motionPreset);
  const keepOpenOnOutside = (event: Event) => {
    if (!closeOnOverlayClick) event.preventDefault();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open ? (
            <Dialog.Overlay asChild forceMount key="paper-modal-overlay">
              <motion.div
                className={styles.overlay}
                variants={variants.overlay}
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
              onPointerDownOutside={keepOpenOnOutside}
              onInteractOutside={keepOpenOnOutside}
            >
              <motion.div
                className={styles.contentRoot}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={CONTENT_ROOT_VARIANTS}
              >
                <motion.div
                  className={[styles.paper, className].filter(Boolean).join(" ")}
                  style={{ "--paper-modal-max-width": PAPER_SIZE_MAX_WIDTH[size] } as CSSProperties}
                  variants={variants.paper}
                >
                  <PaperSurface />
                  <PaperRoughFrame seed={roughSeed} />
                  <PaperModalBody
                    title={title}
                    description={description}
                    showClose={showClose}
                    footer={footer}
                  >
                    {children}
                  </PaperModalBody>
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
