import type { CSSProperties } from "react";
import {
  formatCssDegrees,
  formatCssNumber,
  formatCssPercent,
} from "@/theme/celestialTheme";
import { CELESTIAL_BACKGROUND_BODY_ASSETS } from "./celestialBackgroundBodyAssets";
import { CelestialArtImage } from "./CelestialArtImage";
import styles from "./DaylightMoon.module.css";

export type DaylightMoonCelestialProps = {
  x: number;
  y: number;
  opacity: number;
  limbAngleDeg: number;
};

type DaylightMoonProps = {
  style?: CSSProperties;
  celestial?: DaylightMoonCelestialProps;
};

export const DaylightMoon = ({ style, celestial }: DaylightMoonProps) => {
  const celestialStyle: CSSProperties | undefined = celestial
    ? {
        left: formatCssPercent(celestial.x),
        top: formatCssPercent(celestial.y),
        right: "auto",
        opacity: Number(formatCssNumber(celestial.opacity)),
        transform: `translate(-50%, -50%) rotate(${formatCssDegrees(celestial.limbAngleDeg)})`,
      }
    : undefined;

  return (
    <CelestialArtImage
      src={CELESTIAL_BACKGROUND_BODY_ASSETS.moon}
      className={`${styles.moon}${celestial ? ` ${styles.celestial}` : ""}`}
      style={{ ...celestialStyle, ...style }}
    />
  );
};
