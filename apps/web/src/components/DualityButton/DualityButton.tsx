"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  DUALITY_BUTTON_BASE_SRC,
  DUALITY_BUTTON_DIRECTION_SRC,
  DUALITY_BUTTON_FLIP_MS,
} from "./consts/dualityButtonConsts";
import {
  DualityFaceIcon,
  type DualityIconTone,
} from "./DualityFaceIcon";
import styles from "./DualityButton.module.css";

export type DualityButtonProps = {
  /** Icon shown at the top of the face (e.g. “new”). Ignored when `centerIconSrc` is set. */
  topIconSrc?: string;
  /** Icon shown at the bottom of the face (e.g. “old”). Ignored when `centerIconSrc` is set. */
  bottomIconSrc?: string;
  /** Single centered glyph (e.g. time remaining). Overrides top/bottom. */
  centerIconSrc?: string;
  /** Size multiplier for the centered glyph (default 2). */
  centerIconScale?: number;
  /**
   * `mask` — mono tint (black/white swap on flip).
   * `strokeInvert` — only black ink flips; light fills stay as authored.
   */
  iconTone?: DualityIconTone;
  /** Controlled flip state. When omitted, the button manages its own state. */
  flipped?: boolean;
  /** Initial flip when uncontrolled. */
  defaultFlipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  /** When false, hides the curved direction cue (e.g. while a cover overlay is up). */
  showDirection?: boolean;
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
  centerIconSrc,
  centerIconScale = 1,
  iconTone = "mask",
  flipped: flippedProp,
  defaultFlipped = false,
  onFlippedChange,
  showDirection = true,
  disabled = false,
  className,
  style,
  "aria-label": ariaLabel,
}: DualityButtonProps) {
  const isControlled = flippedProp != null;
  const [clockwiseDeg, setClockwiseDeg] = useState(
    (flippedProp ?? defaultFlipped) ? 180 : 0,
  );
  const flipped = flippedFromTurns(clockwiseDeg);
  const lastControlledRef = useRef(flippedProp);

  // External controlled updates: advance clockwise to the requested side (never CCW).
  useEffect(() => {
    if (!isControlled) return;
    const target = flippedProp!;
    if (lastControlledRef.current === target) return;
    lastControlledRef.current = target;
    setClockwiseDeg((prevDeg) => {
      if (flippedFromTurns(prevDeg) === target) return prevDeg;
      return prevDeg + 180;
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
        {showDirection ? (
          // eslint-disable-next-line @next/next/no-img-element -- static public SVG
          <img
            className={styles.direction}
            src={DUALITY_BUTTON_DIRECTION_SRC}
            alt=""
            draggable={false}
            decoding="async"
          />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.base}
          src={DUALITY_BUTTON_BASE_SRC}
          alt=""
          draggable={false}
          decoding="async"
        />
        {centerIconSrc ? (
          <DualityFaceIcon
            src={centerIconSrc}
            position="center"
            tone={iconTone}
            scale={1.2}
          />
        ) : null}
      </span>
      {!centerIconSrc ? (
        <>
          {topIconSrc ? (
            <DualityFaceIcon src={topIconSrc} position="top" tone={iconTone} />
          ) : null}
          {bottomIconSrc ? (
            <DualityFaceIcon
              src={bottomIconSrc}
              position="bottom"
              tone={iconTone}
            />
          ) : null}
        </>
      ) : null}
    </button>
  );
}
