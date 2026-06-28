import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties } from "react";
import {
  CelestialScene,
  CelestialStoryControls,
  type CelestialStoryControlState,
} from "@/components/CelestialScene";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { getCelestialPresetDate } from "@/theme/celestialPresets";
import { dateToSlot, slotToDate } from "@/theme/celestialTime";
import {
  getSelectorDialLayoutFromSlot,
  selectorLayoutToBackgroundBodies,
} from "@/theme/celestialSelectorLayout";
import { getThemeScaleVars } from "@/theme/themeScale";
import {
  BANGKOK_COORDINATES,
  DEFAULT_CELESTIAL_PROJECTION,
  useCelestialScene,
} from "@/theme/useCelestialScene";
import { DaylightBackgroundView } from "./DaylightBackground";
import styles from "./DaylightBackground.stories.module.css";

const meta: Meta<typeof DaylightBackgroundView> = {
  title: "Layout/DaylightBackground",
  component: DaylightBackgroundView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DaylightBackgroundView>;

function createInitialState(
  useCelestialMode: boolean,
  preset?: CelestialPresetName,
): CelestialStoryControlState {
  return {
    useCelestialMode,
    selectedDate: preset
      ? getCelestialPresetDate(preset, BANGKOK_COORDINATES)
      : getCelestialPresetDate("sunset", BANGKOK_COORDINATES),
    coordinates: BANGKOK_COORDINATES,
    projection: DEFAULT_CELESTIAL_PROJECTION,
    showCelestialBodies: true,
  };
}

const InteractiveBackground = ({
  initialProgress,
  initialCelestialMode = false,
  initialCelestialPreset,
}: {
  initialProgress: number;
  initialCelestialMode?: boolean;
  initialCelestialPreset?: CelestialPresetName;
}) => {
  const [progress, setProgress] = useState(initialProgress);
  const [celestialState, setCelestialState] = useState<CelestialStoryControlState>(() =>
    createInitialState(initialCelestialMode, initialCelestialPreset),
  );
  const themeVars = getThemeScaleVars(progress);
  const celestialScene = useCelestialScene({
    date: celestialState.selectedDate,
    coordinates: celestialState.coordinates,
    projection: celestialState.projection,
  });
  const selectorLayout = getSelectorDialLayoutFromSlot(
    dateToSlot(celestialState.selectedDate),
    celestialState.coordinates,
  );
  const backgroundBodies = selectorLayoutToBackgroundBodies(
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
    <DaylightBackgroundView progress={progress} />
  );

  const controls = (
    <div className={styles.controls}>
      {celestialState.useCelestialMode ? null : (
        <>
          <label className={styles.label} htmlFor="daylight-progress">
            Theme scale: {Math.round(progress)}% (0 = day, 100 = night)
          </label>
          <input
            id="daylight-progress"
            className={styles.slider}
            type="range"
            min={0}
            max={100}
            step={1}
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
          />
        </>
      )}
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
        celestialModeNote="Theme scale slider disabled while celestial mode is on."
      />
    </div>
  );

  const stageInner = (
    <>
      {background}
      {controls}
    </>
  );

  if (celestialState.useCelestialMode) {
    return (
      <CelestialScene sceneVars={celestialScene.sceneVars} className={styles.stage}>
        {stageInner}
      </CelestialScene>
    );
  }

  return (
    <div className={styles.stage} style={themeVars as CSSProperties}>
      {stageInner}
    </div>
  );
};

export const Day: Story = {
  render: () => <InteractiveBackground initialProgress={0} />,
};

export const Twilight: Story = {
  render: () => <InteractiveBackground initialProgress={50} />,
};

export const Night: Story = {
  render: () => <InteractiveBackground initialProgress={100} />,
};

export const ScaleProgression: Story = {
  render: () => <InteractiveBackground initialProgress={35} />,
};

export const CelestialSunset: Story = {
  render: () => (
    <InteractiveBackground
      initialProgress={50}
      initialCelestialMode
      initialCelestialPreset="sunset"
    />
  ),
};

export const CelestialDeepNight: Story = {
  render: () => (
    <InteractiveBackground
      initialProgress={100}
      initialCelestialMode
      initialCelestialPreset="deepNight"
    />
  ),
};
