"use client";

import { useState, type CSSProperties } from "react";
import {
  DUALITY_BUTTON_BASE_SRC,
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
  const [uncontrolled, setUncontrolled] = useState(defaultFlipped);
  const isControlled = flippedProp != null;
  const flipped = isControlled ? flippedProp : uncontrolled;

  const setFlipped = (next: boolean) => {
    if (!isControlled) setUncontrolled(next);
    onFlippedChange?.(next);
  };

  const rootStyle = {
    ...style,
    "--duality-flip-ms": `${DUALITY_BUTTON_FLIP_MS}ms`,
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
        setFlipped(!flipped);
      }}
    >
      <span className={styles.baseWrap} aria-hidden>
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
