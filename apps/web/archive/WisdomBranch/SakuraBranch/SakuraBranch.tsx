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
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

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
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative branch art from /public */}
      <img
        className={styles.image}
        src="/branch/branch-base.png"
        alt=""
        draggable={false}
      />
    </span>
  );
}
