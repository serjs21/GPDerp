import type { CSSProperties } from "react";
import type { SelectorDialLayout } from "@/theme/celestialSelectorLayout";
import { selectorSelectionBorderPosition } from "@/theme/celestialSelectorLayout";
import { ThemeSelectorIcon } from "@/components/CelestialThemeClock/ThemeSelectorIcon";
import { CELESTIAL_SELECTOR_NORTH_STAR } from "@/components/CelestialThemeSelector/celestialSelectorNorthStar.config";
import styles from "./ThemeSelectorNorthStar.module.css";

const northStarFieldVars = {
  "--north-star-color": CELESTIAL_SELECTOR_NORTH_STAR.color,
  "--north-star-glow-color": CELESTIAL_SELECTOR_NORTH_STAR.glowColor,
  "--north-star-glow-mix": `${CELESTIAL_SELECTOR_NORTH_STAR.glowMixPercent}%`,
  "--north-star-glow-blur": `${CELESTIAL_SELECTOR_NORTH_STAR.glowBlurRem}rem`,
} as CSSProperties;

type ThemeSelectorNorthStarProps = {
  layout: SelectorDialLayout;
  className?: string;
};

export function ThemeSelectorNorthStar({
  layout,
  className,
}: ThemeSelectorNorthStarProps) {
  const position = selectorSelectionBorderPosition(
    layout,
    CELESTIAL_SELECTOR_NORTH_STAR.sizePercent,
  );

  return (
    <ThemeSelectorIcon
      variant="northStar"
      className={`${styles.northStar}${className ? ` ${className}` : ""}`}
      style={
        {
          ...northStarFieldVars,
          "--north-star-size": `${CELESTIAL_SELECTOR_NORTH_STAR.sizePercent}%`,
          left: `${position.x}%`,
          top: `${position.y}%`,
          zIndex: CELESTIAL_SELECTOR_NORTH_STAR.zIndex,
        } as CSSProperties
      }
    />
  );
}
