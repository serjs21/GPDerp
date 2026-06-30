"use client";

import type { CSSProperties } from "react";
import { CelestialScene } from "@/components/CelestialScene";
import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import styles from "./page.module.css";
import { HaikuGenerationStickyNote } from "@/components/HaikuGenerationStickyNote";
import { DaylightBackground } from "@/components/DaylightBackground";
import { CenteredAuthPrompt } from "@/components/AuthenticationNav/CenteredAuthPrompt";

export function HomePageContent() {
  const { scene } = useCelestialTheme();

  return (
    <CelestialScene
      sceneVars={scene.sceneVars}
      className={styles.page}
      style={{ minHeight: 0 } as CSSProperties}
      data-theme="celestial"
    >
      <DaylightBackground />
      <div className={styles.paperPlaneFlyLayer} data-paper-plane-background aria-hidden />
      <main className={styles.main}>
        <CenteredAuthPrompt />
        <HaikuGenerationStickyNote />
      </main>
    </CelestialScene>
  );
}
