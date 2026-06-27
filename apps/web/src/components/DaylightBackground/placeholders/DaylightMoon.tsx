import type { CSSProperties } from "react";
import { DAYLIGHT_ASSETS } from "../daylightAssets";
import { DaylightArtImage } from "../DaylightArtImage";
import styles from "./DaylightMoon.module.css";

type DaylightMoonProps = {
  style?: CSSProperties;
};

export const DaylightMoon = ({ style }: DaylightMoonProps) => (
  <DaylightArtImage src={DAYLIGHT_ASSETS.moon} className={styles.moon} style={style} />
);
