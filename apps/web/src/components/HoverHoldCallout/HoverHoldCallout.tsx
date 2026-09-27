"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
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

const DEFAULT_POSITION: CalloutPosition = {
  left: "-1.5rem",
  bottom: "-0.55rem",
  transform: "translate(0, -50%)",
};

type AnchorBox = {
  left: number;
  top: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

/**
 * Shows a callout on hover, portaled to `document.body` so it stacks above
 * clipped/overflow ancestors. A click holds it open for `holdMs`, then fades
 * out over `fadeMs`.
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [held, setHeld] = useState(false);
  const [fading, setFading] = useState(false);
  const [anchor, setAnchor] = useState<AnchorBox | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const hoveredRef = useRef(false);
  const heldRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  heldRef.current = held;

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const syncAnchor = useCallback(() => {
    const node = rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setAnchor({
      left: rect.left,
      top: rect.top,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  const open = hovered || held;
  const mounted = open || fading;
  const visible = open && !fading;

  useLayoutEffect(() => {
    if (!mounted) {
      setAnchor(null);
      return;
    }
    syncAnchor();
  }, [mounted, syncAnchor]);

  useEffect(() => {
    if (!mounted) return;
    const onReposition = () => syncAnchor();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [mounted, syncAnchor]);

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
    if (!heldRef.current) beginFadeOut();
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

  const rootStyle = {
    "--hover-hold-fade-ms": `${fadeMs}ms`,
  } as CSSProperties;

  const portal =
    portalReady && mounted && anchor
      ? createPortal(
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
              className={[
                styles.callout,
                visible ? styles.calloutVisible : styles.calloutFading,
                calloutClassName,
              ]
                .filter(Boolean)
                .join(" ")}
              style={buildCalloutPositionStyle(position)}
            >
              {callout}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={rootStyle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {children}
      {portal}
    </div>
  );
}
