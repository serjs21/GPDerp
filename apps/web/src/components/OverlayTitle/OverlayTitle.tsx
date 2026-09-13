"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import styles from "./OverlayTitle.module.css";

export type OverlayTitleDirection = "bottom" | "top" | "left" | "right";

export type OverlayTitleProps = {
  title: ReactNode;
  /**
   * Edge the overlay grows from when it appears.
   * `"bottom"` rises upward (bottom → top).
   */
  direction?: OverlayTitleDirection;
  /** When false, the title overlay is greyscaled (unchecked controls). */
  active?: boolean;
  children: ReactNode;
  className?: string;
};

const DIRECTION_CLASS: Record<OverlayTitleDirection, string> = {
  bottom: styles.fromBottom,
  top: styles.fromTop,
  left: styles.fromLeft,
  right: styles.fromRight,
};

export function OverlayTitle({
  title,
  direction = "bottom",
  active = true,
  children,
  className,
}: OverlayTitleProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // #region agent log
  const debugSnapshot = (event: string, hypothesisId: string) => {
    const root = rootRef.current;
    const overlay = overlayRef.current;
    if (!root || !overlay) return;
    const activeEl = document.activeElement;
    const data = {
      event,
      title: typeof title === "string" ? title : "[node]",
      activeProp: active,
      rootMatchesHover: root.matches(":hover"),
      rootMatchesFocusWithin: root.matches(":focus-within"),
      activeTag: activeEl?.tagName ?? null,
      activeIsInsideRoot: activeEl instanceof Node ? root.contains(activeEl) : false,
      overlayTransform: getComputedStyle(overlay).transform,
    };
    fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "8e01e4",
      },
      body: JSON.stringify({
        sessionId: "8e01e4",
        runId: "post-fix",
        hypothesisId,
        location: "OverlayTitle.tsx:debugSnapshot",
        message: "overlay visibility probe",
        data,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  };
  // #endregion

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      // #region agent log
      onMouseEnter={() => debugSnapshot("mouseenter", "B")}
      onMouseLeave={() => debugSnapshot("mouseleave", "B")}
      onFocusCapture={() => debugSnapshot("focusin", "A")}
      onBlurCapture={() => {
        Promise.resolve().then(() => debugSnapshot("blur-after", "A"));
      }}
      onClick={() => {
        debugSnapshot("click", "A");
        window.setTimeout(() => debugSnapshot("click+50ms", "A"), 50);
      }}
      // #endregion
    >
      {children}
      <div
        ref={overlayRef}
        className={[
          styles.overlay,
          DIRECTION_CLASS[direction],
          active ? styles.overlayActive : styles.overlayInactive,
        ].join(" ")}
        aria-hidden
      >
        <span className={styles.title}>{title}</span>
      </div>
    </div>
  );
}
