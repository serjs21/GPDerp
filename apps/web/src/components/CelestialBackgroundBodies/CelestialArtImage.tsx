import type { CSSProperties } from "react";
import styles from "./CelestialArtImage.module.css";

type CelestialArtImageProps = {
  src: string;
  className?: string;
  style?: CSSProperties;
};

export const CelestialArtImage = ({ src, className, style }: CelestialArtImageProps) => {
  const { opacity, ...rest } = style ?? {};
  const layerStyle = {
    ...rest,
    ["--layer-opacity" as string]: opacity ?? 1,
  } as CSSProperties;

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      className={`${styles.artImage}${className ? ` ${className}` : ""}`}
      style={layerStyle}
    />
  );
};
