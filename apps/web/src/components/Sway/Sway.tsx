"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import styles from "./Sway.module.css";

export type SwayProps = {
  children: ReactNode;
  /**
   * Full sway cycle duration in seconds.
   * Lower = faster. Default 4.2.
   */
  speed?: number;
  /**
   * Peak rotation in degrees (pendulum half-angle).
   * Default 3.5.
   */
  amplitude?: number;
  /**
   * Horizontal drift in rem at peak sway. Defaults to amplitude-scaled drift.
   */
  driftRem?: number;
  /** When true, render children with no animation wrapper styles. */
  disabled?: boolean;
  className?: string;
};

const DEFAULT_SPEED_S = 4.2;
const DEFAULT_AMPLITUDE_DEG = 3.5;

export function Sway({
  children,
  speed = DEFAULT_SPEED_S,
  amplitude = DEFAULT_AMPLITUDE_DEG,
  driftRem,
  disabled = false,
  className,
}: SwayProps) {
  const reduceMotion = useReducedMotion();
  const inert = disabled || reduceMotion;

  if (inert) {
    if (!className) return children;
    return <div className={className}>{children}</div>;
  }

  const duration = Math.max(0.4, speed);
  const amp = Math.max(0, amplitude);
  const drift = driftRem ?? Math.max(0.05, amp * 0.045);

  const style = {
    "--sway-duration": `${duration}s`,
    "--sway-amp": `${amp}deg`,
    "--sway-drift": `${drift}rem`,
  } as CSSProperties;

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} style={style}>
      {children}
    </div>
  );
}
