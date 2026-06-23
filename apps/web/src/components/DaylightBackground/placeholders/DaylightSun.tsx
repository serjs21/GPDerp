import type { CSSProperties } from "react";
import styles from "./DaylightSun.module.css";

type DaylightSunProps = {
  style?: CSSProperties;
};

export const DaylightSun = ({ style }: DaylightSunProps) => (
  <div className={styles.sun} style={style} aria-hidden />
);
