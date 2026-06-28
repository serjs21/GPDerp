import type { CSSProperties } from "react";
import { DAYLIGHT_ASSETS } from "../daylightAssets";
import { DaylightArtImage } from "../DaylightArtImage";
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
        left: `${celestial.x}%`,
        top: `${celestial.y}%`,
        right: "auto",
        opacity: celestial.opacity,
        transform: `translate(-50%, -50%) rotate(${celestial.limbAngleDeg}deg)`,
      }
    : undefined;

  return (
    <DaylightArtImage
      src={DAYLIGHT_ASSETS.moon}
      className={`${styles.moon}${celestial ? ` ${styles.celestial}` : ""}`}
      style={{ ...celestialStyle, ...style }}
    />
  );
};
