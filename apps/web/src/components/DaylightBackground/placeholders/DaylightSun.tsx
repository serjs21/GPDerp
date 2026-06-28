import type { CSSProperties } from "react";
import { DAYLIGHT_ASSETS } from "../daylightAssets";
import { DaylightArtImage } from "../DaylightArtImage";
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
  const celestialStyle: CSSProperties | undefined = celestial
    ? {
        left: `${celestial.x}%`,
        top: `${celestial.y}%`,
        opacity: celestial.opacity,
        transform: "translate(-50%, -50%)",
      }
    : undefined;

  return (
    <DaylightArtImage
      src={DAYLIGHT_ASSETS.sun}
      className={`${styles.sun}${celestial ? ` ${styles.celestial}` : ""}`}
      style={{ ...celestialStyle, ...style }}
    />
  );
};
