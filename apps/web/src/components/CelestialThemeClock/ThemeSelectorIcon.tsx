import type { CSSProperties, HTMLAttributes } from "react";
import {
  EARTH_SKY_FADE_OUTER_RADIUS_PERCENT,
  EARTH_SKY_INNER_RADIUS_PERCENT,
} from "@/components/CelestialThemeDial/celestialDialProportions";
import styles from "./ThemeSelectorIcon.module.css";

type ThemeSelectorIconVariant = "earth" | "sun" | "moon";

type ThemeSelectorIconProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  variant: ThemeSelectorIconVariant;
  showGlow?: boolean;
};

const earthSkyFadeVars = {
  "--earth-sky-inner": `${EARTH_SKY_INNER_RADIUS_PERCENT}%`,
  "--earth-sky-fade-outer": `${EARTH_SKY_FADE_OUTER_RADIUS_PERCENT}%`,
} as CSSProperties;

export function ThemeSelectorIcon({
  variant,
  showGlow = false,
  className,
  style,
  ...props
}: ThemeSelectorIconProps) {
  const { opacity, ...rest } = style ?? {};
  const iconStyle = {
    ...rest,
    opacity: opacity ?? 1,
  } as CSSProperties;

  if (variant === "earth") {
    return (
      <span
        className={`${styles.earthRoot}${className ? ` ${className}` : ""}`}
        style={{ ...earthSkyFadeVars, ...iconStyle }}
        aria-hidden
        {...props}
      >
        <span className={styles.earthTerminator} aria-hidden>
          <span className={styles.earthGlow} aria-hidden />
          <span className={styles.earthSky} aria-hidden />
        </span>
        <span className={styles.earthMask} aria-hidden />
      </span>
    );
  }

  const glowClass = variant === "sun" ? styles.sunGlow : styles.moonGlow;
  const maskedClass = variant === "sun" ? styles.sunMasked : styles.moonMasked;
  const showGlowClass = variant === "sun" && showGlow ? ` ${styles.showGlow}` : "";

  return (
    <span
      className={`${styles.bodyRoot}${showGlowClass}${className ? ` ${className}` : ""}`}
      style={iconStyle}
      aria-hidden
      {...props}
    >
      <span className={glowClass} aria-hidden />
      <span className={`${styles.maskedIcon} ${maskedClass}`} aria-hidden />
    </span>
  );
}
