import type { CSSProperties } from "react";
import styles from "./SakuraBranch.module.css";

export type SakuraBranchProps = {
  className?: string;
  /** Stem angle in degrees (default 0) */
  angle?: number;
  /** Visual length scale 0.8–1.2 */
  scale?: number;
};

export function SakuraBranch({ className, angle = 0, scale = 1 }: SakuraBranchProps) {
  const rootClass = [styles.branch, className].filter(Boolean).join(" ");

  return (
    <span
      className={rootClass}
      aria-hidden
      style={
        {
          "--branch-angle": `${angle}deg`,
          "--branch-scale": scale,
        } as CSSProperties
      }
    />
  );
}
