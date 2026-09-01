"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { DrawnCloseMark, type DrawnCloseMarkHandle } from "./DrawnCloseMark";
import { DrawnFrame, type DrawnFrameHandle } from "./DrawnFrame";
import { DRAWN_OVERLAY_MS, DRAWN_SIZE_MAX_WIDTH, type DrawnModalSize } from "./drawnTokens";
import { fadeElement, useDrawnOpenAnimation } from "./useDrawnOpenAnimation";
import styles from "./DrawnModal.module.css";

export type DrawnModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: DrawnModalSize;
  showClose?: boolean;
  /** Rough.js seed for reproducible borders / X. */
  roughSeed?: number;
  className?: string;
  /** When false, pointer interaction outside does not dismiss. Default true. */
  closeOnOverlayClick?: boolean;
};

export function DrawnModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  showClose = true,
  roughSeed = 42,
  className,
  closeOnOverlayClick = true,
}: DrawnModalProps) {
  const reduceMotion = useReducedMotion();
  const [present, setPresent] = useState(open);
  const exitingRef = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<DrawnFrameHandle>(null);
  const closeRef = useRef<DrawnCloseMarkHandle>(null);
  const geometryFrameRef = useRef(0);

  const { contentReady, chromeReady, restartDraw } = useDrawnOpenAnimation({
    open: present && open,
    reducedMotion: Boolean(reduceMotion),
    frameRef,
    closeRef,
    showClose,
  });

  const handleGeometryReady = useCallback(() => {
    if (!(present && open)) return;
    cancelAnimationFrame(geometryFrameRef.current);
    geometryFrameRef.current = requestAnimationFrame(() => {
      restartDraw();
    });
  }, [open, present, restartDraw]);

  useEffect(() => {
    if (open) {
      exitingRef.current = false;
      setPresent(true);
    }
  }, [open]);

  useEffect(() => {
    if (!present) return;

    if (open) {
      const id = requestAnimationFrame(() => {
        if (reduceMotion) {
          if (overlayRef.current) overlayRef.current.style.opacity = "1";
          if (shellRef.current) shellRef.current.style.opacity = "1";
          return;
        }
        void fadeElement(overlayRef.current, 1, DRAWN_OVERLAY_MS);
        void fadeElement(shellRef.current, 1, DRAWN_OVERLAY_MS);
      });
      return () => cancelAnimationFrame(id);
    }

    if (exitingRef.current) return;
    exitingRef.current = true;

    let cancelled = false;
    const runExit = async () => {
      if (reduceMotion) {
        if (!cancelled) {
          setPresent(false);
          exitingRef.current = false;
        }
        return;
      }
      await Promise.all([
        fadeElement(overlayRef.current, 0, DRAWN_OVERLAY_MS),
        fadeElement(shellRef.current, 0, DRAWN_OVERLAY_MS),
      ]);
      if (cancelled) return;
      setPresent(false);
      exitingRef.current = false;
    };
    void runExit();

    return () => {
      cancelled = true;
    };
  }, [open, present, reduceMotion]);

  const shellStyle = {
    "--drawn-modal-max-width": DRAWN_SIZE_MAX_WIDTH[size],
  } as CSSProperties;

  if (!present) {
    return (
      <Dialog.Root open={false} onOpenChange={onOpenChange}>
        {null}
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={open || present} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        <Dialog.Overlay asChild forceMount>
          <div ref={overlayRef} className={styles.overlay} />
        </Dialog.Overlay>

        <Dialog.Content
          asChild
          forceMount
          onPointerDownOutside={(event) => {
            if (!closeOnOverlayClick) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (!closeOnOverlayClick) event.preventDefault();
          }}
        >
          <div className={styles.contentRoot}>
            <div
              ref={shellRef}
              className={[styles.shell, className].filter(Boolean).join(" ")}
              style={shellStyle}
              data-chrome-ready={chromeReady ? "true" : "false"}
            >
              <DrawnFrame
                ref={frameRef}
                seed={roughSeed}
                onGeometryReady={handleGeometryReady}
              />

              {showClose ? (
                <div className={styles.closeWrap}>
                  <DrawnCloseMark
                    ref={closeRef}
                    seed={roughSeed + 50}
                    onGeometryReady={handleGeometryReady}
                  />
                  <Dialog.Close asChild>
                    <button type="button" className={styles.closeHit} aria-label="Close" />
                  </Dialog.Close>
                </div>
              ) : null}

              <div
                className={[
                  styles.body,
                  contentReady ? styles.contentVisible : styles.contentHidden,
                ].join(" ")}
              >
                {(title || showClose) && (
                  <div className={styles.header}>
                    {title ? (
                      <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                    ) : (
                      <Dialog.Title className={styles.visuallyHidden}>Dialog</Dialog.Title>
                    )}
                  </div>
                )}

                {!title && !showClose ? (
                  <Dialog.Title className={styles.visuallyHidden}>Dialog</Dialog.Title>
                ) : null}

                {description ? (
                  <Dialog.Description className={styles.description}>
                    {description}
                  </Dialog.Description>
                ) : (
                  <Dialog.Description className={styles.visuallyHidden}> </Dialog.Description>
                )}

                {children ? <div className={styles.children}>{children}</div> : null}
                {footer ? <div className={styles.footer}>{footer}</div> : null}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type { DrawnModalSize } from "./drawnTokens";
