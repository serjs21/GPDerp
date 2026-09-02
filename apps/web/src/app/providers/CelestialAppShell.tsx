"use client";

import type { CSSProperties, ReactNode } from "react";
import { CelestialScene } from "@/components/CelestialScene";
import { BackgroundSceneCelestial } from "@/components/BackgroundScene";
import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import styles from "./CelestialAppShell.module.css";

type CelestialAppShellProps = {
  children: ReactNode;
  className?: string;
};

export function CelestialAppShell({ children, className }: CelestialAppShellProps) {
  const { scene } = useCelestialTheme();
  const sceneStyle = scene.sceneVars as CSSProperties;

  // #region agent log
  fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "baf7a7" },
    body: JSON.stringify({
      sessionId: "baf7a7",
      runId: "pre-fix",
      hypothesisId: "D",
      location: "CelestialAppShell.tsx:render",
      message: "celestial sceneVars on render",
      data: {
        isServer: typeof window === "undefined",
        sunX: scene.sceneVars["--sun-x"],
        sunY: scene.sceneVars["--sun-y"],
        moonX: scene.sceneVars["--moon-x"],
        moonY: scene.sceneVars["--moon-y"],
        moonOpacity: scene.sceneVars["--moon-opacity"],
        overlayOpacity: scene.sceneVars["--overlay-opacity"],
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <div
      className={`${styles.shell}${className ? ` ${className}` : ""}`}
      style={sceneStyle}
      data-theme="celestial"
    >
      <div className={styles.backdrop} aria-hidden>
        <CelestialScene sceneVars={scene.sceneVars} className={styles.backdropScene}>
          <BackgroundSceneCelestial />
        </CelestialScene>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
