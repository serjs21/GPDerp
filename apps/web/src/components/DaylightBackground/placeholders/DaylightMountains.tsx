import type { CSSProperties } from "react";
import styles from "./DaylightMountains.module.css";

type DaylightMountainsProps = {
  style?: CSSProperties;
};

export const DaylightMountains = ({ style }: DaylightMountainsProps) => (
  <div className={styles.mountains} style={style} aria-hidden>
    <div className={styles.ridge} />
  </div>
);
