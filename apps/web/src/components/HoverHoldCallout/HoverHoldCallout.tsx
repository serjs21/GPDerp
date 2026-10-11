"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { withDefaults } from "@/utils/props/withDefaults";
import { CalloutPortal } from "./CalloutPortal";
import { useHoverHoldVisibility } from "./useHoverHoldVisibility";
import { useViewportAnchor } from "./useViewportAnchor";
import type { CalloutPosition } from "./utils/calloutPositionUtils";
import styles from "./HoverHoldCallout.module.css";

export type HoverHoldCalloutProps = {
  children: ReactNode;
  /** Overlay content (e.g. speech bubble). */
  callout: ReactNode;
  /**
   * Absolute placement of the callout relative to the trigger box
   * (portaled to `document.body` as a fixed anchor matching the trigger).
   * Defaults to top-centered above the children.
   */
  position?: CalloutPosition;
  /** How long a click keeps the callout open (ms). Default 3000. */
  holdMs?: number;
  /** Fade-out duration after hold ends or hover leaves (ms). Default 200. */
  fadeMs?: number;
  className?: string;
  calloutClassName?: string;
};

const HOVER_HOLD_CALLOUT_DEFAULTS = {
  position: {
    left: "-1.5rem",
    bottom: "-0.55rem",
    transform: "translate(0, -50%)",
  } satisfies CalloutPosition,
  holdMs: 3000,
  fadeMs: 200,
} as const;

/**
 * Shows a callout on hover, portaled to `document.body` so it stacks above
 * clipped/overflow ancestors. A click holds it open for `holdMs`, then fades
 * out over `fadeMs`.
 */
export function HoverHoldCallout(props: HoverHoldCalloutProps) {
  const { holdMs, fadeMs } = withDefaults(props, HOVER_HOLD_CALLOUT_DEFAULTS);
  const { children, callout, className, calloutClassName } = props;
  const position = props.position ?? HOVER_HOLD_CALLOUT_DEFAULTS.position;
  const rootRef = useRef<HTMLDivElement>(null);
  const { mounted, visible, onEnter, onLeave, onClick } = useHoverHoldVisibility(holdMs, fadeMs);
  const anchor = useViewportAnchor(rootRef, mounted);

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={{ "--hover-hold-fade-ms": `${fadeMs}ms` } as CSSProperties}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {children}
      {anchor ? (
        <CalloutPortal
          anchor={anchor}
          visible={visible}
          fadeMs={fadeMs}
          position={position}
          className={calloutClassName}
        >
          {callout}
        </CalloutPortal>
      ) : null}
    </div>
  );
}
