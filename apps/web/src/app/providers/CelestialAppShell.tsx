"use client";

import type { CSSProperties, ReactNode } from "react";
import { CelestialScene } from "@/components/CelestialScene";
import { BackgroundSceneCelestial } from "@/components/BackgroundScene";
import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import styles from "./CelestialAppShell.module.css";

type CelestialAppShellProps = {
  children: ReactNode;
  /** Renders below the scenic stage (not over the backdrop). */
  footer?: ReactNode;
  className?: string;
};

export function CelestialAppShell({ children, footer, className }: CelestialAppShellProps) {
  const { scene } = useCelestialTheme();
  const sceneStyle = scene.sceneVars as CSSProperties;

  return (
    <div
      className={`${styles.shell}${className ? ` ${className}` : ""}`}
      style={sceneStyle}
      data-theme="celestial"
    >
      <div className={styles.stage}>
        <div className={styles.stageCanvas}>
          <div className={styles.backdrop} aria-hidden>
            <CelestialScene sceneVars={scene.sceneVars} className={styles.backdropScene}>
              <BackgroundSceneCelestial />
            </CelestialScene>
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
      {footer ? <div className={styles.footerSlot}>{footer}</div> : null}
    </div>
  );
}
