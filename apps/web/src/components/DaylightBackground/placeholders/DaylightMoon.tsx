import type { CSSProperties } from "react";
import styles from "./DaylightMoon.module.css";

type DaylightMoonProps = {
  style?: CSSProperties;
};

export const DaylightMoon = ({ style }: DaylightMoonProps) => (
  <div className={styles.moon} style={style} aria-hidden />
);
