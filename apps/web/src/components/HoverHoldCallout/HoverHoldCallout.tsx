"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./HoverHoldCallout.module.css";
import {
  buildCalloutPositionStyle,
  type CalloutPosition,
} from "./utils/calloutPositionUtils";

export type HoverHoldCalloutProps = {
  children: ReactNode;
  /** Overlay content (e.g. speech bubble). */
  callout: ReactNode;
  /**
   * Absolute placement of the callout inside this area.
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

const DEFAULT_POSITION: CalloutPosition = {
  left: "50%",
  top: "0",
  transform: "translate(-50%, calc(-100% - 0.55rem))",
};

/**
 * Shows an absolutely positioned callout on hover.
 * A click holds it open for `holdMs`, then fades out over `fadeMs`.
 */
export function HoverHoldCallout({
  children,
  callout,
  position = DEFAULT_POSITION,
  holdMs = 3000,
  fadeMs = 200,
  className,
  calloutClassName,
}: HoverHoldCalloutProps) {
  const [hovered, setHovered] = useState(false);
  const [held, setHeld] = useState(false);
  const [fading, setFading] = useState(false);
  const hoveredRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const beginFadeOut = useCallback(() => {
    setFading(true);
    const doneId = window.setTimeout(() => {
      setFading(false);
      timersRef.current = timersRef.current.filter((id) => id !== doneId);
    }, fadeMs);
    timersRef.current.push(doneId);
  }, [fadeMs]);

  const onEnter = () => {
    hoveredRef.current = true;
    setHovered(true);
    setFading(false);
  };

  const onLeave = () => {
    hoveredRef.current = false;
    setHovered(false);
    if (!held) beginFadeOut();
  };

  const onClick = () => {
    clearTimers();
    setFading(false);
    setHeld(true);
    const holdId = window.setTimeout(() => {
      setHeld(false);
      timersRef.current = timersRef.current.filter((id) => id !== holdId);
      if (!hoveredRef.current) beginFadeOut();
    }, holdMs);
    timersRef.current.push(holdId);
  };

  const open = hovered || held;
  const mounted = open || fading;
  const visible = open && !fading;

  const rootStyle = {
    "--hover-hold-fade-ms": `${fadeMs}ms`,
  } as CSSProperties;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={rootStyle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {children}
      {mounted ? (
        <div
          className={[
            styles.callout,
            visible ? styles.calloutVisible : styles.calloutFading,
            calloutClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          style={buildCalloutPositionStyle(position)}
          aria-hidden={!visible}
        >
          {callout}
        </div>
      ) : null}
    </div>
  );
}
