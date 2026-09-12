import type { CSSProperties } from "react";
import { formatCssNumber } from "@/theme/celestialTheme";
import styles from "./CelestialArtImage.module.css";

type CelestialArtImageProps = {
  src: string;
  className?: string;
  style?: CSSProperties;
};

export const CelestialArtImage = ({ src, className, style }: CelestialArtImageProps) => {
  const { opacity, ...rest } = style ?? {};
  const layerOpacity =
    typeof opacity === "number" ? formatCssNumber(opacity) : formatCssNumber(1);
  const layerStyle = {
    ...rest,
    ["--layer-opacity" as string]: layerOpacity,
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
