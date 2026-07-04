"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import {
  CelestialScene,
  CelestialStoryControls,
  type CelestialStoryControlState,
} from "@/components/CelestialScene";
import { DaylightBackgroundView } from "@/components/DaylightBackground/DaylightBackground";
import { ThemeSelector } from "@/components/ThemeSelector/ThemeSelector";
import type { ThemeName } from "@/config/userConfiguration";
import {
  getCelestialPresetDate,
  type CelestialPresetName,
} from "@/theme/celestialPresets";
import { dateToSlot, slotToDate } from "@/theme/celestialTime";
import {
  getSelectorDialLayoutFromSlot,
  selectorLayoutToBackgroundBodies,
} from "@/theme/celestialSelectorLayout";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";
import {
  BANGKOK_COORDINATES,
  DEFAULT_CELESTIAL_PROJECTION,
  useCelestialScene,
} from "@/theme/useCelestialScene";
import styles from "../WisdomBranch.stories.module.css";

const THEME_SCALE: Record<ThemeName, number> = {
  "night-sky": 100,
  "tokyo-dusk": 50,
  sumie: 0,
};

export type WisdomBranchStoryStageProps = {
  children: ReactNode;
  initialTheme?: ThemeName;
  initialCelestialMode?: boolean;
  initialCelestialDate?: Date;
  initialCelestialPreset?: CelestialPresetName;
};

function createInitialCelestialState(
  props: Pick<
    WisdomBranchStoryStageProps,
    "initialCelestialMode" | "initialCelestialDate" | "initialCelestialPreset"
  >,
): CelestialStoryControlState {
  const presetDate = props.initialCelestialPreset
    ? getCelestialPresetDate(props.initialCelestialPreset, BANGKOK_COORDINATES)
    : undefined;

  return {
    useCelestialMode: props.initialCelestialMode ?? false,
    selectedDate:
      props.initialCelestialDate ??
      presetDate ??
      getCelestialPresetDate("sunset", BANGKOK_COORDINATES),
    coordinates: BANGKOK_COORDINATES,
    projection: DEFAULT_CELESTIAL_PROJECTION,
    showCelestialBodies: true,
  };
}

export function WisdomBranchStoryStage({
  children,
  initialTheme = "tokyo-dusk",
  initialCelestialMode,
  initialCelestialDate,
  initialCelestialPreset,
}: WisdomBranchStoryStageProps) {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [preview, setPreview] = useState<number | null>(null);
  const [celestialState, setCelestialState] = useState<CelestialStoryControlState>(() =>
    createInitialCelestialState({
      initialCelestialMode,
      initialCelestialDate,
      initialCelestialPreset,
    }),
  );

  const activeScale = preview ?? THEME_SCALE[theme];
  const themeVars = getThemeScaleVars(activeScale);
  const celestialScene = useCelestialScene({
    date: celestialState.selectedDate,
    coordinates: celestialState.coordinates,
    projection: celestialState.projection,
  });
  const celestialSlot = dateToSlot(celestialState.selectedDate);
  const selectorLayout = getSelectorDialLayoutFromSlot(
    celestialSlot,
    celestialState.coordinates,
  );
  const backgroundBodies = selectorLayoutToBackgroundBodies(
    celestialSlot,
    selectorLayout,
    celestialScene.layout.moon.limbAngleDeg,
  );

  const background = celestialState.useCelestialMode ? (
    <DaylightBackgroundView
      mode="celestial"
      backgroundBodies={backgroundBodies}
      showCelestialBodies={celestialState.showCelestialBodies}
    />
  ) : (
    <DaylightBackgroundView progress={activeScale} />
  );

  const stageInner = (
    <div className={styles.stagePage}>
      {background}
      <main className={styles.stageMain}>
        <div className={styles.stageControls}>
          <div className={styles.selectorCard}>
            <CelestialStoryControls
              state={celestialState}
              onChange={setCelestialState}
              onPreset={(preset) =>
                setCelestialState((current) => {
                  const presetDate = getCelestialPresetDate(preset, current.coordinates);
                  return {
                    ...current,
                    useCelestialMode: true,
                    selectedDate: slotToDate(dateToSlot(presetDate)),
                  };
                })
              }
              celestialModeNote="Manual theme slider disabled while celestial mode is on."
              themeSelectorSlot={
                <>
                  <ThemeSelector
                    value={theme}
                    onChange={setTheme}
                    onPreviewChange={setPreview}
                    onScaleCommit={(progress) => {
                      setPreview(progress);
                      setTheme(getPersistedThemeFromScale(progress));
                    }}
                    ariaLabel="Storybook theme"
                  />
                  <p className={styles.themeLabel}>Theme: {theme}</p>
                </>
              }
            />
          </div>
        </div>
        <div className={styles.stageContent}>{children}</div>
      </main>
    </div>
  );

  if (celestialState.useCelestialMode) {
    return (
      <CelestialScene
        sceneVars={celestialScene.sceneVars}
        className={styles.stageRoot}
        data-theme="celestial"
      >
        {stageInner}
      </CelestialScene>
    );
  }

  return (
    <div className={styles.stageRoot} style={themeVars as CSSProperties} data-theme={theme}>
      {stageInner}
    </div>
  );
}
