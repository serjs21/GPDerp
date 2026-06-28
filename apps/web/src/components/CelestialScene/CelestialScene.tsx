import type { CSSProperties, ReactNode } from "react";
import styles from "./CelestialScene.module.css";

export type CelestialSceneProps = {
  sceneVars: Record<string, string>;
  className?: string;
  children: ReactNode;
  "data-theme"?: string;
};

export function CelestialScene({
  sceneVars,
  className,
  children,
  "data-theme": dataTheme,
}: CelestialSceneProps) {
  return (
    <div
      className={`${styles.scene}${className ? ` ${className}` : ""}`}
      style={sceneVars as CSSProperties}
      data-theme={dataTheme}
    >
      {children}
    </div>
  );
}
