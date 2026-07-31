"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { CelestialThemeProvider, useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import { CelestialThemeSelector } from "@/components/CelestialThemeSelector";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import {
  getCelestialPresetDate,
  type CelestialPresetName,
} from "@/theme/celestialPresets";
import { dateToSlot, formatClockLabel } from "@/theme/celestialTime";
import { BANGKOK_COORDINATES } from "@/theme/useCelestialScene";
import { BackgroundScene } from "./BackgroundScene";
import { BackgroundSceneColorBalanceControls } from "./BackgroundSceneColorBalanceControls";
import { BackgroundSceneMountainColorBalanceControls } from "./BackgroundSceneMountainColorBalanceControls";
import {
  DEFAULT_COLOR_BALANCE,
  type ColorBalanceValues,
} from "./backgroundSceneColorBalance";
import styles from "./BackgroundSceneStoryStage.module.css";

const DEFAULT_CELESTIAL_SLOT = 48;

export type BackgroundSceneStoryStageProps = {
  children?: ReactNode;
  initialSlot?: number;
  initialCelestialPreset?: CelestialPresetName;
};

function resolveInitialSlot(
  props: Pick<BackgroundSceneStoryStageProps, "initialSlot" | "initialCelestialPreset">,
): number {
  if (props.initialCelestialPreset) {
    return dateToSlot(
      getCelestialPresetDate(props.initialCelestialPreset, BANGKOK_COORDINATES),
    );
  }
  return props.initialSlot ?? DEFAULT_CELESTIAL_SLOT;
}

function BackgroundSceneStoryStageInner({ children }: { children?: ReactNode }) {
  const { effectiveSlot, commitSlot, setPreviewSlot, scene, backgroundBodies } =
    useCelestialTheme();
  const [colorBalance, setColorBalance] = useState<ColorBalanceValues>(
    DEFAULT_COLOR_BALANCE,
  );
  const [mountainColorBalance, setMountainColorBalance] = useState<ColorBalanceValues>(
    DEFAULT_COLOR_BALANCE,
  );

  return (
    <div
      className={styles.shell}
      data-theme="celestial"
      style={scene.sceneVars as CSSProperties}
    >
      <div className={styles.stage}>
        <BackgroundScene
          theme={scene.theme}
          backgroundBodies={backgroundBodies}
          colorBalance={colorBalance}
          mountainColorBalance={mountainColorBalance}
        />
        {children}
      </div>

      <div className={styles.controls}>
        <div className={styles.selectorRow}>
          <CelestialThemeSelector
            slot={effectiveSlot}
            onChange={commitSlot}
            onPreviewChange={setPreviewSlot}
            sceneVars={scene.sceneVars}
            ariaLabel="Storybook theme"
          />
          <p className={styles.timeLabel}>{formatClockLabel(effectiveSlot)}</p>
        </div>
        <BackgroundSceneColorBalanceControls
          title="Global color balance"
          resetLabel="Reset global balance"
          value={colorBalance}
          onChange={setColorBalance}
        />
        <BackgroundSceneMountainColorBalanceControls
          value={mountainColorBalance}
          onChange={setMountainColorBalance}
        />
      </div>

      <footer className={styles.footerSlot}>
        <SiteFooter />
      </footer>
    </div>
  );
}

export function BackgroundSceneStoryStage({
  children,
  initialSlot,
  initialCelestialPreset,
}: BackgroundSceneStoryStageProps) {
  const slot = resolveInitialSlot({ initialSlot, initialCelestialPreset });

  return (
    <CelestialThemeProvider initialSlot={slot}>
      <BackgroundSceneStoryStageInner>{children}</BackgroundSceneStoryStageInner>
    </CelestialThemeProvider>
  );
}
