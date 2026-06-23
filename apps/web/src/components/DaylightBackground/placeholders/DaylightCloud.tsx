import type { CSSProperties } from "react";
import styles from "./DaylightCloud.module.css";

type DaylightCloudProps = {
  className?: string;
  style?: CSSProperties;
};

export const DaylightCloud = ({ className, style }: DaylightCloudProps) => (
  <div className={`${styles.cloud}${className ? ` ${className}` : ""}`} style={style} aria-hidden />
);
