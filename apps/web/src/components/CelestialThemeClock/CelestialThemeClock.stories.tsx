import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties } from "react";
import { CelestialScene } from "@/components/CelestialScene";
import { DaylightBackgroundView } from "@/deprecated/daylight-background-2026-07-31/DaylightBackground";
import { CelestialThemeClock } from "@/components/CelestialThemeClock";
import { slotToDate } from "@/theme/celestialTime";
import {
  getSelectorDialLayoutFromSlot,
  selectorLayoutToBackgroundBodies,
} from "@/theme/celestialSelectorLayout";
import { BANGKOK_COORDINATES, useCelestialScene } from "@/theme/useCelestialScene";
import styles from "./CelestialThemeClock.stories.module.css";

const meta: Meta<typeof CelestialThemeClock> = {
  title: "Theme/CelestialThemeClock",
  component: CelestialThemeClock,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof CelestialThemeClock>;

export const Default: Story = {
  args: {
    value: 16,
    onChange: () => undefined,
    coordinates: BANGKOK_COORDINATES,
    ariaLabel: "Time of day",
  },
};

export const Interactive: Story = {
  render: () => {
    const [slot, setSlot] = useState(16);

    return (
      <div className={styles.panel}>
        <CelestialThemeClock
          value={slot}
          onChange={setSlot}
          coordinates={BANGKOK_COORDINATES}
        />
        <p className={styles.caption}>Selected slot: {slot}</p>
      </div>
    );
  },
};

const CelestialScenePreview = () => {
  const [slot, setSlot] = useState(72);
  const celestialScene = useCelestialScene({
    date: slotToDate(slot),
    coordinates: BANGKOK_COORDINATES,
  });
  const selectorLayout = getSelectorDialLayoutFromSlot(slot, BANGKOK_COORDINATES);
  const backgroundBodies = selectorLayoutToBackgroundBodies(
    slot,
    selectorLayout,
    celestialScene.layout.moon.limbAngleDeg,
  );

  return (
    <CelestialScene sceneVars={celestialScene.sceneVars} className={styles.scene}>
      <DaylightBackgroundView
        mode="celestial"
        backgroundBodies={backgroundBodies}
        showCelestialBodies
        solarElevationDeg={celestialScene.layout.sun.altitudeDeg}
        slot={slot}
        theme={celestialScene.theme}
      />
      <div className={styles.controls}>
        <CelestialThemeClock
          value={slot}
          onChange={setSlot}
          coordinates={BANGKOK_COORDINATES}
          ariaLabel="Celestial theme time"
        />
      </div>
    </CelestialScene>
  );
};

export const WithCelestialBackground: Story = {
  parameters: { layout: "fullscreen" },
  render: () => <CelestialScenePreview />,
};

export const StyledWithThemeVars: Story = {
  render: () => {
    const [slot, setSlot] = useState(60);
    const celestialScene = useCelestialScene({
      date: slotToDate(slot),
      coordinates: BANGKOK_COORDINATES,
    });

    return (
      <div style={celestialScene.sceneVars as CSSProperties} className={styles.themedPanel}>
        <CelestialThemeClock
          value={slot}
          onChange={setSlot}
          coordinates={BANGKOK_COORDINATES}
        />
      </div>
    );
  },
};
