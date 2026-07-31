import type { CSSProperties } from "react";
import styles from "./BackgroundSceneStars.module.css";

const STAR_POSITIONS = [
  { left: "12%", top: "7%" },
  { left: "22%", top: "14%" },
  { left: "34%", top: "5%" },
  { left: "48%", top: "11%" },
  { left: "58%", top: "18%" },
  { left: "67%", top: "8%" },
  { left: "76%", top: "15%" },
  { left: "86%", top: "6%" },
  { left: "91%", top: "22%" },
  { left: "18%", top: "24%" },
  { left: "41%", top: "20%" },
  { left: "63%", top: "26%" },
  { left: "8%", top: "18%" },
  { left: "53%", top: "4%" },
  { left: "29%", top: "9%" },
] as const;

type BackgroundSceneStarsProps = {
  opacity: number;
  moonColor?: string;
};

export function BackgroundSceneStars({ opacity, moonColor }: BackgroundSceneStarsProps) {
  if (opacity <= 0) return null;

  return (
    <div
      className={styles.field}
      aria-hidden
      style={
        {
          opacity,
          "--moon-color": moonColor,
        } as CSSProperties
      }
    >
      {STAR_POSITIONS.map((position, index) => (
        <span
          key={`background-scene-star-${index}`}
          className={styles.star}
          style={{ left: position.left, top: position.top }}
        />
      ))}
    </div>
  );
}
