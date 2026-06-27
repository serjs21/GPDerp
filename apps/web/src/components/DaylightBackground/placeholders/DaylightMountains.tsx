import type { CSSProperties } from "react";
import { DAYLIGHT_ASSETS } from "../daylightAssets";
import { DaylightArtImage } from "../DaylightArtImage";
import styles from "./DaylightMountains.module.css";

type DaylightMountainsProps = {
  style?: CSSProperties;
};

export const DaylightMountains = ({ style }: DaylightMountainsProps) => (
  <DaylightArtImage
    src={DAYLIGHT_ASSETS.mountains}
    className={styles.mountains}
    style={style}
  />
);
