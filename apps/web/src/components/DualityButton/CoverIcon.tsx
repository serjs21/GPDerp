"use client";

import { useEffect, type AnimationEvent, type CSSProperties } from "react";
import styles from "./CoverIcon.module.css";

export type CoverIconProps = {
  iconSrc: string;
  className?: string;
  style?: CSSProperties;
  /** When true, exits with magic.css `rotateRight`. */
  dismissing?: boolean;
  onDismissComplete?: () => void;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Circular cover disk seated exactly over the duality base (fill + icon).
 */
export function CoverIcon({
  iconSrc,
  className,
  style,
  dismissing = false,
  onDismissComplete,
}: CoverIconProps) {
  useEffect(() => {
    if (!dismissing || !onDismissComplete) return;
    if (!prefersReducedMotion()) return;
    onDismissComplete();
  }, [dismissing, onDismissComplete]);

  const onAnimationEnd = (event: AnimationEvent<HTMLSpanElement>) => {
    if (!dismissing) return;
    if (!event.animationName.toLowerCase().includes("rotateright")) return;
    onDismissComplete?.();
  };

  return (
    <span
      className={[
        styles.disk,
        dismissing ? `magictime rotateRight ${styles.diskExiting}` : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-hidden
      onAnimationEnd={onAnimationEnd}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
      <img
        className={styles.icon}
        src={iconSrc}
        alt=""
        draggable={false}
        decoding="async"
      />
    </span>
  );
}
