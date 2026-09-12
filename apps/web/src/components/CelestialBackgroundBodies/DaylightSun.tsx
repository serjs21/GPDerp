import type { CSSProperties } from "react";
import { formatCssNumber, formatCssPercent } from "@/theme/celestialTheme";
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
        left: formatCssPercent(celestial.x),
        top: formatCssPercent(celestial.y),
        opacity: Number(formatCssNumber(celestial.opacity)),
        transform: "translate(-50%, -50%)",
        "--sun-glow-strength": formatCssNumber(glowStrength),
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
