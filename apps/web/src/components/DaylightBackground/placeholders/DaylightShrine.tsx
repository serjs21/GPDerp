import type { CSSProperties } from "react";
import { DAYLIGHT_ASSETS } from "../daylightAssets";
import { DaylightArtImage } from "../DaylightArtImage";
import styles from "./DaylightShrine.module.css";

type DaylightShrineProps = {
  style?: CSSProperties;
};

export const DaylightShrine = ({ style }: DaylightShrineProps) => (
  <DaylightArtImage src={DAYLIGHT_ASSETS.shrine} className={styles.shrine} style={style} />
);
