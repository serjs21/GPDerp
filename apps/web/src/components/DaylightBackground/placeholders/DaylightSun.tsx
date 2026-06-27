import type { CSSProperties } from "react";
import { DAYLIGHT_ASSETS } from "../daylightAssets";
import { DaylightArtImage } from "../DaylightArtImage";
import styles from "./DaylightSun.module.css";

type DaylightSunProps = {
  style?: CSSProperties;
};

export const DaylightSun = ({ style }: DaylightSunProps) => (
  <DaylightArtImage src={DAYLIGHT_ASSETS.sun} className={styles.sun} style={style} />
);
