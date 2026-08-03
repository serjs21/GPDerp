import type { CSSProperties } from "react";
import { DaylightArtImage } from "../DaylightArtImage";
import styles from "./DaylightCloud.module.css";

type DaylightCloudProps = {
  src: string;
  className?: string;
  style?: CSSProperties;
};

export const DaylightCloud = ({ src, className, style }: DaylightCloudProps) => (
  <DaylightArtImage
    src={src}
    className={`${styles.cloud}${className ? ` ${className}` : ""}`}
    style={style}
  />
);
