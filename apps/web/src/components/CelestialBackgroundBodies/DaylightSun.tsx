import type { CSSProperties } from "react";
import { CELESTIAL_BACKGROUND_BODY_ASSETS } from "./celestialBackgroundBodyAssets";
import { CelestialArtImage } from "./CelestialArtImage";
import styles from "./DaylightSun.module.css";

export type DaylightSunCelestialProps = {
  x: number;
  y: number;
  opacity: number;
};

type DaylightSunProps = {
  style?: CSSProperties;
  celestial?: DaylightSunCelestialProps;
};

export const DaylightSun = ({ style, celestial }: DaylightSunProps) => {
  const glowStrength = celestial?.opacity ?? 1;
  const celestialStyle = celestial
    ? ({
        left: `${celestial.x}%`,
        top: `${celestial.y}%`,
        opacity: celestial.opacity,
        transform: "translate(-50%, -50%)",
        "--sun-glow-strength": String(glowStrength),
      } as CSSProperties)
    : undefined;

  return (
    <CelestialArtImage
      src={CELESTIAL_BACKGROUND_BODY_ASSETS.sun}
      className={`${styles.sun}${celestial ? ` ${styles.celestial}` : ""}`}
      style={{ ...celestialStyle, ...style }}
    />
  );
};
