"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  DUALITY_BUTTON_BASE_SRC,
  DUALITY_BUTTON_DIRECTION_SRC,
  DUALITY_BUTTON_FLIP_MS,
} from "./consts/dualityButtonConsts";
import styles from "./DualityButton.module.css";

export type DualityButtonProps = {
  /** Icon shown at the top of the face (e.g. “new”). */
  topIconSrc: string;
  /** Icon shown at the bottom of the face (e.g. “old”). */
  bottomIconSrc: string;
  /** Controlled flip state. When omitted, the button manages its own state. */
  flipped?: boolean;
  /** Initial flip when uncontrolled. */
  defaultFlipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label": string;
};

function flippedFromTurns(clockwiseDeg: number): boolean {
  return Math.round(clockwiseDeg / 180) % 2 === 1;
}

export function DualityButton({
  topIconSrc,
  bottomIconSrc,
  flipped: flippedProp,
  defaultFlipped = false,
  onFlippedChange,
  disabled = false,
  className,
  style,
  "aria-label": ariaLabel,
}: DualityButtonProps) {
  const isControlled = flippedProp != null;
  const [clockwiseDeg, setClockwiseDeg] = useState(defaultFlipped ? 180 : 0);
  const flipped = flippedFromTurns(clockwiseDeg);
  const lastControlledRef = useRef(flippedProp);

  // External controlled updates: advance clockwise to the requested side (never CCW).
  useEffect(() => {
    if (!isControlled) return;
    const target = flippedProp!;
    if (lastControlledRef.current === target) return;
    lastControlledRef.current = target;
    setClockwiseDeg((prev) => {
      if (flippedFromTurns(prev) === target) return prev;
      return prev + 180;
    });
  }, [flippedProp, isControlled]);

  const rootStyle = {
    ...style,
    "--duality-flip-ms": `${DUALITY_BUTTON_FLIP_MS}ms`,
    "--duality-base-rotate": `${clockwiseDeg}deg`,
  } as CSSProperties;

  return (
    <button
      type="button"
      className={[styles.root, flipped ? styles.flipped : "", className]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
      aria-label={ariaLabel}
      aria-pressed={flipped}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        const nextDeg = clockwiseDeg + 180;
        const nextFlipped = flippedFromTurns(nextDeg);
        setClockwiseDeg(nextDeg);
        if (isControlled) lastControlledRef.current = nextFlipped;
        onFlippedChange?.(nextFlipped);
      }}
    >
      <span className={styles.baseWrap} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.direction}
          src={DUALITY_BUTTON_DIRECTION_SRC}
          alt=""
          draggable={false}
          decoding="async"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.base}
          src={DUALITY_BUTTON_BASE_SRC}
          alt=""
          draggable={false}
          decoding="async"
        />
      </span>
      <span
        className={[styles.icon, styles.iconTop].join(" ")}
        style={
          {
            WebkitMaskImage: `url("${topIconSrc}")`,
            maskImage: `url("${topIconSrc}")`,
          } as CSSProperties
        }
        aria-hidden
      />
      <span
        className={[styles.icon, styles.iconBottom].join(" ")}
        style={
          {
            WebkitMaskImage: `url("${bottomIconSrc}")`,
            maskImage: `url("${bottomIconSrc}")`,
          } as CSSProperties
        }
        aria-hidden
      />
    </button>
  );
}
