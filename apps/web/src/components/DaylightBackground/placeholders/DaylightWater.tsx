import type { CSSProperties } from "react";
import styles from "./DaylightWater.module.css";

type DaylightWaterProps = {
  style?: CSSProperties;
};

export const DaylightWater = ({ style }: DaylightWaterProps) => (
  <div className={styles.water} style={style} aria-hidden>
    <div className={styles.surface} />
    <div className={styles.reflection} />
  </div>
);
