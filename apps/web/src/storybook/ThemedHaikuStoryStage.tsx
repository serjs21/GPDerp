"use client";

import type { ReactNode } from "react";
import { CelestialThemeProvider, useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import { CelestialAppShell } from "@/app/providers/CelestialAppShell";
import { CelestialThemeSelector } from "@/components/CelestialThemeSelector";
import {
  getCelestialPresetDate,
  type CelestialPresetName,
} from "@/theme/celestialPresets";
import { dateToSlot, formatClockLabel } from "@/theme/celestialTime";
import { BANGKOK_COORDINATES } from "@/theme/useCelestialScene";
import styles from "./ThemedHaikuStoryStage.module.css";

const DEFAULT_CELESTIAL_SLOT = 48;

export type ThemedHaikuStoryStageProps = {
  children: ReactNode;
  /** Initial celestial time slot (0–95). Ignored when `initialCelestialPreset` is set. */
  initialSlot?: number;
  /** Resolve initial slot from a named solar preset (same as main-app celestial mode). */
  initialCelestialPreset?: CelestialPresetName;
  /** Stretch content to full stage width (lists, scroll demos). */
  wideContent?: boolean;
};

function resolveInitialSlot(
  props: Pick<ThemedHaikuStoryStageProps, "initialSlot" | "initialCelestialPreset">,
): number {
  if (props.initialCelestialPreset) {
    return dateToSlot(
      getCelestialPresetDate(props.initialCelestialPreset, BANGKOK_COORDINATES),
    );
  }
  return props.initialSlot ?? DEFAULT_CELESTIAL_SLOT;
}

function ThemedHaikuStoryStageInner({
  children,
  wideContent = false,
}: {
  children: ReactNode;
  wideContent?: boolean;
}) {
  const { effectiveSlot, commitSlot, setPreviewSlot, scene } = useCelestialTheme();

  const contentClass = [styles.stageContent, wideContent ? styles.stageContentWide : null]
    .filter(Boolean)
    .join(" ");

  return (
    <CelestialAppShell className={styles.shell}>
      <main className={styles.stageMain}>
        <div className={styles.stageControls}>
          <div className={styles.selectorCard}>
            <CelestialThemeSelector
              slot={effectiveSlot}
              onChange={commitSlot}
              onPreviewChange={setPreviewSlot}
              sceneVars={scene.sceneVars}
              ariaLabel="Storybook theme"
            />
            <p className={styles.timeLabel}>{formatClockLabel(effectiveSlot)}</p>
          </div>
        </div>
        <div className={contentClass}>{children}</div>
      </main>
    </CelestialAppShell>
  );
}

/** Main-page celestial theme shell + dial selector for Storybook. */
export function ThemedHaikuStoryStage({
  children,
  initialSlot,
  initialCelestialPreset,
  wideContent = false,
}: ThemedHaikuStoryStageProps) {
  const slot = resolveInitialSlot({ initialSlot, initialCelestialPreset });

  return (
    <CelestialThemeProvider initialSlot={slot}>
      <ThemedHaikuStoryStageInner wideContent={wideContent}>
        {children}
      </ThemedHaikuStoryStageInner>
    </CelestialThemeProvider>
  );
}

export type ThemedStoryStageParameters = Pick<
  ThemedHaikuStoryStageProps,
  "initialSlot" | "initialCelestialPreset" | "wideContent"
>;
