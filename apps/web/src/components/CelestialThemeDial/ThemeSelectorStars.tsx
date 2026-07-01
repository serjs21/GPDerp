import type { CSSProperties } from "react";
import {
  THEME_SELECTOR_STAR_APPEARANCE,
  THEME_SELECTOR_STAR_POSITIONS,
} from "./themeSelectorStars.config";
import styles from "./ThemeSelectorStars.module.css";
import { ThemeSelectorIcon } from "@/components/CelestialThemeClock/ThemeSelectorIcon";

const starFieldVars = {
  "--selector-star-size": `${THEME_SELECTOR_STAR_APPEARANCE.sizePx}px`,
  "--selector-star-color": THEME_SELECTOR_STAR_APPEARANCE.color,
  "--selector-star-glow-color": THEME_SELECTOR_STAR_APPEARANCE.glowColor,
  "--selector-star-glow-mix": `${THEME_SELECTOR_STAR_APPEARANCE.glowMixPercent}%`,
  "--selector-star-glow-blur": `${THEME_SELECTOR_STAR_APPEARANCE.glowBlurRem}rem`,
} as CSSProperties;

type ThemeSelectorStarsProps = {
  opacity: number;
};

export function ThemeSelectorStars({ opacity }: ThemeSelectorStarsProps) {
  return (
    <div
      className={styles.field}
      style={{ ...starFieldVars, opacity } as CSSProperties}
      aria-hidden
    >
      {THEME_SELECTOR_STAR_POSITIONS.map((position, index) => (
        <ThemeSelectorIcon
          variant="star"
          showGlow
          key={`selector-star-${index}`}
          className={styles.star}
          style={{ left: position.left, top: position.top }}
        />
      ))}
    </div>
  );
}
