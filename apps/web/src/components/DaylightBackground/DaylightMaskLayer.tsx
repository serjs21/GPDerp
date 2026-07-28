import type { CSSProperties } from "react";
import styles from "./DaylightMaskLayer.module.css";

export type DaylightMaskLayerProps = {
  maskUrl: string;
  color?: string;
  gradient?: string;
  opacity: number;
  blendMode: CSSProperties["mixBlendMode"];
  zIndex: number;
};

export function DaylightMaskLayer({
  maskUrl,
  color,
  gradient,
  opacity,
  blendMode,
  zIndex,
}: DaylightMaskLayerProps) {
  return (
    <div
      className={styles.layer}
      style={
        {
          zIndex,
          background: gradient ?? color,
          opacity,
          mixBlendMode: blendMode,
          WebkitMaskImage: `url("${maskUrl}")`,
          maskImage: `url("${maskUrl}")`,
        } as CSSProperties
      }
    />
  );
}
