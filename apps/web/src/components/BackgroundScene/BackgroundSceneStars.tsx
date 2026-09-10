import type { CSSProperties } from "react";
import styles from "./BackgroundSceneStars.module.css";

const STAR_SRCS = [
  "/stars/star1.svg",
  "/stars/star2.svg",
  "/stars/star3.svg",
  "/stars/star4.svg",
  "/stars/star5.svg",
  "/stars/star6.svg",
] as const;

/** Stable mix across `/stars/star*.svg` (same pattern as StyleNavigationWheel). */
function starSrcForIndex(index: number): string {
  return STAR_SRCS[(index * 5 + 1) % STAR_SRCS.length]!;
}

const STAR_POSITIONS = [
  { left: "12%", top: "7%", sizeRem: 1.35, rotationDeg: 12 },
  { left: "22%", top: "14%", sizeRem: 0.95, rotationDeg: 48 },
  { left: "34%", top: "5%", sizeRem: 1.55, rotationDeg: 95 },
  { left: "48%", top: "11%", sizeRem: 1.1, rotationDeg: 160 },
  { left: "58%", top: "18%", sizeRem: 0.85, rotationDeg: 210 },
  { left: "67%", top: "8%", sizeRem: 1.4, rotationDeg: 25 },
  { left: "76%", top: "15%", sizeRem: 1.05, rotationDeg: 280 },
  { left: "86%", top: "6%", sizeRem: 1.25, rotationDeg: 55 },
  { left: "91%", top: "22%", sizeRem: 0.9, rotationDeg: 130 },
  { left: "18%", top: "24%", sizeRem: 1.2, rotationDeg: 200 },
  { left: "41%", top: "20%", sizeRem: 1.5, rotationDeg: 300 },
  { left: "63%", top: "26%", sizeRem: 0.8, rotationDeg: 75 },
  { left: "8%", top: "18%", sizeRem: 1.15, rotationDeg: 240 },
  { left: "53%", top: "4%", sizeRem: 1.0, rotationDeg: 15 },
  { left: "29%", top: "9%", sizeRem: 1.3, rotationDeg: 175 },
] as const;

type BackgroundSceneStarsProps = {
  opacity: number;
  /** Kept for API compatibility; SVG stars use their own palette. */
  moonColor?: string;
};

export function BackgroundSceneStars({ opacity }: BackgroundSceneStarsProps) {
  if (opacity <= 0) return null;

  return (
    <div className={styles.field} aria-hidden style={{ opacity } as CSSProperties}>
      {STAR_POSITIONS.map((position, index) => (
        // eslint-disable-next-line @next/next/no-img-element -- public SVG sky assets
        <img
          key={`background-scene-star-${index}`}
          src={starSrcForIndex(index)}
          alt=""
          draggable={false}
          className={styles.star}
          style={
            {
              left: position.left,
              top: position.top,
              width: `${position.sizeRem}rem`,
              transform: `translate(-50%, -50%) rotate(${position.rotationDeg}deg)`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
