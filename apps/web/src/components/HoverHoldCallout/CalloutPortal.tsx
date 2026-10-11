"use client";

import { createPortal } from "react-dom";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import type { CalloutPortalProps } from "./CalloutPortal.types";
import { buildCalloutPositionStyle } from "./utils/calloutPositionUtils";
import styles from "./HoverHoldCallout.module.css";

/** Fixed box over the trigger, portaled to `document.body` so clipped ancestors can't hide it. */
export function CalloutPortal({
  anchor,
  visible,
  fadeMs,
  position,
  className,
  children,
}: CalloutPortalProps) {
  const hydrated = useIsHydrated();
  if (!hydrated) return null;

  return createPortal(
    <div
      className={styles.portalAnchor}
      style={{
        left: anchor.left,
        top: anchor.top,
        bottom: anchor.bottom,
        right: anchor.right,
        width: anchor.width,
        height: anchor.height,
        ["--hover-hold-fade-ms" as string]: `${fadeMs}ms`,
      }}
      aria-hidden={!visible}
    >
      <div
        className={[styles.callout, visible ? styles.calloutVisible : styles.calloutFading, className]
          .filter(Boolean)
          .join(" ")}
        style={buildCalloutPositionStyle(position)}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
