"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, runPaperPlaneExit } from "./usePaperPlaneExitAnimation";
import styles from "./paperPlaneExit.module.css";

export type PaperPlaneExitProps = {
  active: boolean;
  onComplete?: () => void;
  children: React.ReactNode;
  className?: string;
};

export function PaperPlaneExit({
  active,
  onComplete,
  children,
  className,
}: PaperPlaneExitProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const hasRunRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      hasRunRef.current = false;
      return;
    }
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    if (prefersReducedMotion()) {
      onCompleteRef.current?.();
      return;
    }

    const { promise, cancel } = runPaperPlaneExit(sceneRef.current, contentRef.current);
    void promise.then(() => {
      onCompleteRef.current?.();
    });

    return () => {
      cancel();
    };
  }, [active]);

  const rootClass = [styles.scene, className].filter(Boolean).join(" ");

  return (
    <div
      ref={sceneRef}
      className={rootClass}
      data-exiting={active || undefined}
    >
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
      <div className={styles.left} aria-hidden />
      <div className={styles.right} aria-hidden />
    </div>
  );
}
